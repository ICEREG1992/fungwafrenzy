import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import path from 'path-browserify';
import FrenzyNETHeader from './FrenzyNETHeader';
import { userSettings } from './interfaces';
import Options from './Options';
import Browse from './Browse';
import './App.css';

function LoadImpact() {
  return (
    <div>
      <FrenzyNETHeader nav page="load custom impact"/>
      <div>

      </div>
    </div>
  )
}

function LoadGame() {
  return (
    <div>
      <FrenzyNETHeader nav page="load game"/>
      <div>

      </div>
    </div>
  )
}

function Game() {
  return (
    <div>

    </div>
  )
}

function Credits() {
  return (
    <div>
      <FrenzyNETHeader nav page="credits"/>
      <div>

      </div>
    </div>
  )
}

function Title() {
  return (
    <div>
      <FrenzyNETHeader page="mainmenu"/>
      <div id="body">
        <div id="grid">
          <Link to="/browse" tabIndex={-1}><button type="button">Browse Impacts</button></Link>
          <Link to="/loadimpact" tabIndex={-1}><button type="button">Load Custom Impact</button></Link>
          <button type="button" disabled>???</button>
          <button type="button">Continue Game</button>
          <button type="button">Start New Game</button>
          <Link to="/loadgame" tabIndex={-1}><button type="button">Load Game</button></Link>
          <button type="button" disabled>???</button>
          <Link to="/credits" tabIndex={-1}><button type="button">Credits</button></Link>
          <button type="button" disabled>???</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  
  const [userSettings, setUserSettings] = useState<userSettings>({
    "player_theme": "classic",
    "impact_folder_path": "x",
    "save_folder_path": "y",
    "resolution_x": 1024,
    "resolution_y": 728,
    "fullscreen": false,
    "volume_master": 100,
    "volume_video": 100,
    "volume_music": 80
  });

  useEffect(() => {
    const loadSettings = async () => {
      const settings = localStorage.getItem('fungwafrenzy.settings');
      if (settings) {
        const data = JSON.parse(settings);
        if (data) {
          setUserSettings(data);
        }
      }
      // data not successfully returned, fill with defaults
      window.electron.ipcRenderer.invoke('get-appdatapaths').then((res) => {
        setUserSettings({
          "player_theme": "classic",
          "impact_folder_path": res[0],
          "save_folder_path": res[1],
          "resolution_x": 1024,
          "resolution_y": 728,
          "fullscreen": false,
          "volume_master": 100,
          "volume_video": 100,
          "volume_music": 80
        });
      });
      
    }
    loadSettings();
  }, [])
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Title />} />
        <Route path="/options" element={<Options settings={userSettings}/>} />
        <Route path="/browse" element={<Browse path={userSettings.impact_folder_path}/>} />
        <Route path="/loadimpact" element={<LoadImpact />} />
        <Route path="/loadgame" element={<LoadGame />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}