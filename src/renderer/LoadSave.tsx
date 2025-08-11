import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../hooks/useSettingsStore';
import FrenzyNETHeader from './FrenzyNETHeader';
import { gameState, SaveGame } from './interfaces';
import MenuRoot from './MenuRoot';

export default function LoadSave() {
  const { settings, updateSettings } = useSettingsStore();
  const openFolder = () => {
    console.log('clicked');
    window.electron.ipcRenderer.sendMessage(
      'open-path',
      settings.save_folder_path,
    );
  };

  const selectSave = (s: SaveGame) => {
    updateSettings({
      ...settings,
      selected_save: s.filename,
      selected_impact: s.impact,
    });
  };

  const [saves, setSaves] = useState<Array<SaveGame>>([]);
  useEffect(() => {
    window.electron.ipcRenderer
      .invoke('get-saves', settings.save_folder_path)
      .then((res) => {
        setSaves(res);
        return res;
      })
      .catch((err) => {
        console.error('Failed to get saves:', err);
      });
  }, []);

  return (
    <MenuRoot background={settings.background}>
      <FrenzyNETHeader nav page="load save" />
      <div id="body">
        <div className="NETcontainer center">
          <Saves saves={saves} selectSave={selectSave}></Saves>
          <a className="NETheader cursor fullwidth" onClick={openFolder}>
            OPEN SAVES FOLDER
          </a>
        </div>
      </div>
    </MenuRoot>
  );
}

interface SavesProps {
  saves: Array<SaveGame>;
  selectSave: (save: SaveGame) => void;
}

function Saves(props: SavesProps) {
  const arr: Array<React.JSX.Element> = [];
  props.saves.forEach((e: SaveGame) => {
    arr.push(
      <a onClick={(event) => props.selectSave(e)}>
        <div className="NETsave cursor fullwidth">
          <div className="NETsaveTitle">{e.gameState.currentVideo.title}</div>
          <div className="NETsaveDate">{e.key}</div>
          <div className="NETsaveImpact">{e.impact}</div>
        </div>
      </a>,
    );
  });
  return arr;
}
