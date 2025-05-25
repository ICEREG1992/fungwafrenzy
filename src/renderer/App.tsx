import React, { useState, useEffect } from 'react';
import {
  useNavigate,
  MemoryRouter as Router,
  Routes,
  Route,
  Link,
} from 'react-router-dom';

import FrenzyNETHeader from './FrenzyNETHeader';
import Settings from './Settings';
import Browse from './Browse';
import Game from './Game';
import LoadSave from './LoadSave';
import Radio from './Radio';
import './App.css';
import Credits from './components/Credits';
import { useSettingsStore } from '../hooks/useSettingsStore';
import Tools from './Tools';
import SaveModal from './SaveModal';
import MenuModal from './MenuModal';
import { ModalState, SaveGame, userSettings } from './interfaces';

function Title() {
  const navigate = useNavigate();
  const { settings } = useSettingsStore();
  const [localModalState, setLocalModalState] = useState<ModalState>({
    type: 'start',
    visible: false,
  });
  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('allow-close');
  }, []);

  const startGame = () => {
    if (settings.selected_impact) {
      navigate('/newgame');
    } else {
      setLocalModalState((prev) => ({
        ...prev,
        type: 'start',
        visible: true,
      }));
    }
  };

  const continueGame = async () => {
    if (settings.selected_save) {
      try {
        const sav: SaveGame = await window.electron.ipcRenderer.invoke(
          'get-savedata',
          settings.selected_save,
          settings.save_folder_path,
        );
        if (sav.impact === settings.selected_impact) {
          navigate('/continue');
        } else {
          setLocalModalState((prev) => ({
            ...prev,
            type: 'mismatch',
            visible: true,
          }));
        }
      } catch {
        setLocalModalState((prev) => ({
          ...prev,
          type: 'error',
          visible: true,
        }));
      }
    } else {
      setLocalModalState((prev) => ({
        ...prev,
        type: 'continue',
        visible: true,
      }));
    }
  };

  const loadImpact = () => {
    navigate('/browse');
  };

  const loadSave = () => {
    navigate('/loadsave');
  };

  return (
    <div className="menuroot">
      <FrenzyNETHeader page="mainmenu" />
      <div id="body">
        <div id="grid">
          <Link to="/browse" tabIndex={-1}>
            <button type="button">Browse Impacts</button>
          </Link>
          <button type="button" disabled>
            ???
          </button>
          <Link to="/radio" tabIndex={-1}>
            <button type="button">Radio</button>
          </Link>
          <Link to="/loadsave" tabIndex={-1}>
            <button type="button">Load Save</button>
          </Link>
          <button type="button" onClick={startGame}>
            Start New Game
          </button>
          <button type="button" onClick={continueGame}>
            Continue Game
          </button>
          <Link to="/tools" tabIndex={-1}>
            <button type="button">Tools</button>
          </Link>
          <Link to="/credits" tabIndex={-1}>
            <button type="button">Credits</button>
          </Link>
          <button type="button" disabled>
            ???
          </button>
        </div>
      </div>
      <MenuModal
        modalState={localModalState}
        setter={setLocalModalState}
        loadImpact={loadImpact}
        loadSave={loadSave}
        start={() => {
          navigate('/newgame');
        }}
        continue={() => {
          navigate('/continue');
        }}
      ></MenuModal>
    </div>
  );
}

export default function App() {
  const { settings, setSettings, updateSettings } = useSettingsStore();
  useEffect(() => {
    const loadSettings = async () => {
      const defaultPaths = await window.electron.ipcRenderer.invoke(
        'get-defaultappdatapaths',
      );
      const defaultSettings: userSettings = {
        selected_impact: '',
        selected_save: '',
        player_theme: 'classic',
        impact_folder_path: defaultPaths[0],
        save_folder_path: defaultPaths[1],
        skip_button: true,
        skip_timer: 3,
        username: '',
        class: '',
        location: '',
        resolution_x: 1024,
        resolution_y: 728,
        fullscreen: false,
        volume_master: 80,
        volume_video: 100,
        volume_music: 100,
        debug: false,
      };
      try {
        const res: userSettings =
          await window.electron.ipcRenderer.invoke('load-usersettings');
        if (res) {
          const out = { ...defaultSettings, ...res };
          setSettings(out);
          // if fullscreen, launch app fullscreen
          window.electron.ipcRenderer.sendMessage(
            'toggle-fullscreen',
            (res as userSettings).fullscreen,
          );
          return;
        }
        // data not successfully returned, fill with defaults
        console.log('filling settings with defaults');
        setSettings(defaultSettings);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    loadSettings();

    window.electron.ipcRenderer.sendMessage('allow-close');
  }, []);

  useEffect(() => {
    if (
      settings.impact_folder_path !== 'x' &&
      settings.save_folder_path !== 'y'
    ) {
      window.electron.ipcRenderer.invoke('save-usersettings', settings);
    }

    // F11 key listener for fullscreen toggle
    const handleF11 = (event: KeyboardEvent) => {
      if (event.key === 'F11') {
        event.preventDefault();
        window.electron.ipcRenderer.sendMessage(
          'toggle-fullscreen',
          !settings.fullscreen,
        );
        updateSettings({ fullscreen: !settings.fullscreen });
      }
    };

    // Add event listener for F11
    window.addEventListener('keydown', handleF11);
    // Clean up listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleF11);
    };
  }, [settings]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Title />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/loadsave" element={<LoadSave />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/newgame" element={<Game />} />
        <Route path="/continue" element={<Game continue />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/radio" element={<Radio />} />
      </Routes>
    </Router>
  );
}
