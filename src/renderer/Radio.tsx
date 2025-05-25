import { Link } from 'react-router-dom';
import { useState } from 'react';
import ReactPlayer from 'react-player';
import FrenzyNETHeader from './FrenzyNETHeader';
import { useSettingsStore } from '../hooks/useSettingsStore';
import { impactSong, NetModalState } from './interfaces';
import NetModal from './NetModal';

export default function Radio() {
  const { settings, updateSettings } = useSettingsStore();
  const [localSongState, setLocalSongState] = useState<impactSong>({
    title: '',
    path: '',
    volume: 0,
  });
  const [playMode, setLocalPlayMode] = useState<boolean>(true);

  return (
    <div className="menuroot">
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
              {localSongState.title ? localSongState.title : 'NONE'}{' '}
              <a>&lt;CHANGE&gt;</a>
            </div>
            <div className="NETline">
              <b>playback_mode:</b> {playMode ? 'LOOP' : 'SHUFFLE'}{' '}
              <a
                onClick={() => {
                  setLocalPlayMode(!playMode);
                }}
              >
                &lt;CHANGE&gt;
              </a>
            </div>
            <div className="NETplayer">
              <ReactPlayer controls loop={playMode}></ReactPlayer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
