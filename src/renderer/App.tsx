import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';

import FrenzyNETHeader from './FrenzyNETHeader';
import Settings from './Settings';
import Browse from './Browse';
import Game from './Game';
import LoadSave from './LoadSave';
import './App.css';
import Credits from './components/Credits';
import { useSettingsStore } from '../hooks/useSettingsStore';

function LoadImpact() {
  return (
    <div className="menuroot">
      <FrenzyNETHeader nav page="load custom impact" />
    </div>
  );
}

function Title() {
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
          <button type="button" disabled>
            ???
          </button>
          <Link to="/loadsave" tabIndex={-1}>
            <button type="button">Load Save</button>
          </Link>
          <Link to="/newgame" tabIndex={-1}>
            <button type="button">Start New Game</button>
          </Link>
          <Link to="/continue" tabIndex={-1}>
            <button type="button">Continue Game</button>
          </Link>
          <button type="button" disabled>
            ???
          </button>
          <Link to="/credits" tabIndex={-1}>
            <button type="button">Credits</button>
          </Link>
          <button type="button" disabled>
            ???
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { settings, setSettings } = useSettingsStore();
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res =
          await window.electron.ipcRenderer.invoke('load-usersettings');
        if (res) {
          setSettings(res);
          return;
        }

        // data not successfully returned, fill with defaults
        console.log('filling settings with defaults');
        const defaultPaths = await window.electron.ipcRenderer.invoke(
          'get-defaultappdatapaths',
        );
        setSettings({
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
        });
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    loadSettings();
    window.electron.ipcRenderer.sendMessage('allow-close');
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.invoke('save-usersettings', settings);
  }, [settings]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Title />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/loadimpact" element={<LoadImpact />} />
        <Route path="/loadsave" element={<LoadSave />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/newgame" element={<Game />} />
        <Route path="/continue" element={<Game continue />} />
      </Routes>
    </Router>
  );
}
