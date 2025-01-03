import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';

import FrenzyNETHeader from './FrenzyNETHeader';
import { userSettings } from './interfaces';
import Settings from './Settings';
import Browse from './Browse';
import Game from './Game';
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

function LoadGame() {
  return (
    <div className="menuroot">
      <FrenzyNETHeader nav page="load game" />
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
          <Link to="/loadimpact" tabIndex={-1}>
            <button type="button">Load Custom Impact</button>
          </Link>
          <button type="button" disabled>
            ???
          </button>
          <button type="button">Continue Game</button>
          <Link to="/game" tabIndex={-1}>
            <button type="button">Start New Game</button>
          </Link>
          <Link to="/loadgame" tabIndex={-1}>
            <button type="button">Load Game</button>
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
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.invoke('save-usersettings', settings);
  }, [settings]);

  const selectImpact = (name: string) => {
    setSettings({
      ...settings,
      selected_impact: name,
    });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Title />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/browse"
          element={
            <Browse
              path={settings.impact_folder_path}
              selectImpact={selectImpact}
            />
          }
        />
        <Route path="/loadimpact" element={<LoadImpact />} />
        <Route path="/loadgame" element={<LoadGame />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}
