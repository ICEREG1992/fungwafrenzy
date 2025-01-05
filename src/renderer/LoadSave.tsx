import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../hooks/useSettingsStore';
import FrenzyNETHeader from './FrenzyNETHeader';
import { gameState, SaveGame } from './interfaces';

export default function LoadSave() {
  const { settings, updateSettings } = useSettingsStore();
  const openFolder = () => {
    console.log('clicked');
    window.electron.ipcRenderer.sendMessage(
      'open-path',
      settings.save_folder_path,
    );
  };

  const selectSave = (name: string) => {
    updateSettings({
      ...settings,
      selected_save: name,
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
    <div className="menuroot">
      <FrenzyNETHeader nav page="load save" />
      <div id="body">
        <div className="NETcontainer center">
          <Saves saves={saves} selectSave={selectSave}></Saves>
          <a className="NETheader cursor fullwidth" onClick={openFolder}>
            OPEN SAVES FOLDER
          </a>
        </div>
      </div>
    </div>
  );
}

interface SavesProps {
  saves: Array<SaveGame>;
  selectSave: (name: string) => void;
}

function Saves(props: SavesProps) {
  const arr: Array<React.JSX.Element> = [];
  props.saves.forEach((e: SaveGame) => {
    arr.push(
      <a onClick={(event) => props.selectSave(e.filename)}>
        <div className="NETsave cursor fullwidth">
          <div>{e.key}</div>
          <div>{e.impact}</div>
        </div>
      </a>,
    );
  });
  return arr;
}
