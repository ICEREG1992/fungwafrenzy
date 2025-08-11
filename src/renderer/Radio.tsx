import { Link } from 'react-router-dom';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import FrenzyNETHeader from './FrenzyNETHeader';
import { useSettingsStore } from '../hooks/useSettingsStore';
import { Impact, impactMusic, impactSong, NetModalState } from './interfaces';
import NetModal from './NetModal';
import MenuRoot from './MenuRoot';

export default function Radio() {
  const { settings, updateSettings } = useSettingsStore();
  const [localSongState, setLocalSongState] = useState<impactSong>({
    title: '',
    path: '.mp3',
    volume: 0,
  });
  const [localSongSelectorState, setLocalSongSelectorState] =
    useState<boolean>(false);
  const [localImpactMusic, setLocalImpactMusic] = useState<impactMusic>({});

  useEffect(() => {
    async function getLocalImpactMusic() {
      const imp: Impact = await window.electron.ipcRenderer.invoke(
        'get-impact',
        settings.selected_impact,
        settings.impact_folder_path,
      );
      setLocalImpactMusic(imp.music);
    }
    getLocalImpactMusic();
  }, []);

  useEffect(() => {
    function loadSelectedSong() {
      const song = localImpactMusic[settings.selected_song];
      if (song) {
        setLocalSongState(song);
      }
    }
    loadSelectedSong();
  }, [localImpactMusic]);

  const setCurrentSong = useCallback(
    (s: string) => {
      setLocalSongState(localImpactMusic[s]);
      updateSettings({
        ...settings,
        selected_song: s,
      });
    },
    [localImpactMusic, settings],
  );

  const selectRandomSong = useCallback(() => {
    if (!settings.play_mode) {
      const keys = Object.keys(localImpactMusic);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      if (randomKey !== settings.selected_song) {
        setCurrentSong(randomKey);
      } else {
        selectRandomSong();
      }
    }
  }, [localImpactMusic, settings]);

  return (
    <MenuRoot background={settings.background}>
      <FrenzyNETHeader nav page="radio" />
      <div id="body">
        <div className="NETcontainer">
          <div className="NETheader">SOUNDTRACK PLAYER</div>
          <div className="NETbody">
            <div className="NETline">
              <b>selected_impact:</b>{' '}
              {settings.selected_impact ? settings.selected_impact : 'NONE'}{' '}
              <Link to="/browse" tabIndex={-1}>
                <a>&lt;CHANGE&gt;</a>
              </Link>
            </div>
            <div className="NETline">
              <b>selected_song:</b>{' '}
              <SongSelector
                song={settings.selected_song}
                state={localSongSelectorState}
                songs={localImpactMusic}
                stateSetter={setLocalSongSelectorState}
                songSetter={setCurrentSong}
              ></SongSelector>
            </div>
            <div className="NETline">
              <b>playback_mode:</b> {settings.play_mode ? 'LOOP' : 'SHUFFLE'}{' '}
              <a
                onClick={() => {
                  updateSettings({
                    ...settings,
                    play_mode: !settings.play_mode,
                  });
                }}
              >
                &lt;CHANGE&gt;
              </a>
            </div>
            <div className="NETplayer">
              <ReactPlayer
                controls
                height="54px"
                width="100%"
                playing
                loop={settings.play_mode}
                url={`impact://${localSongState.path}?path=${settings.impact_folder_path}&impact=${settings.selected_impact}`}
                volume={localSongState.volume / 100}
                onEnded={selectRandomSong}
              ></ReactPlayer>
            </div>
          </div>
        </div>
      </div>
    </MenuRoot>
  );
}

interface SongSelectorProps {
  songSetter: (s: string) => void;
  song: string;
  state: boolean;
  stateSetter: React.Dispatch<React.SetStateAction<boolean>>;
  songs: impactMusic;
}

function SongSelector(props: SongSelectorProps) {
  const selectValue = useRef<HTMLSelectElement>(null);
  if (props.state) {
    return (
      <span>
        <select id="NETmodalvalue" ref={selectValue} defaultValue={props.song}>
          {Object.entries(props.songs).map(([key, song]) => (
            <option key={key} value={key}>
              {song.title}
            </option>
          ))}
        </select>
        <a
          onClick={() => {
            props.songSetter(selectValue.current!.value);
            props.stateSetter(!props.state);
          }}
        >
          &lt;ACCEPT&gt;
        </a>
      </span>
    );
  } else {
    return (
      <span>
        {props.songs[props.song] ? props.songs[props.song].title : 'NONE'}{' '}
        <a
          onClick={() => {
            props.stateSetter(!props.state);
          }}
        >
          &lt;CHANGE&gt;
        </a>
      </span>
    );
  }
}
