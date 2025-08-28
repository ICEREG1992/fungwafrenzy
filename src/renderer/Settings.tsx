import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FrenzyNETHeader from './FrenzyNETHeader';
import { NetModalState } from './interfaces';
import { useSettingsStore } from '../hooks/useSettingsStore';
import NetModal from './NetModal';
import MenuRoot from './MenuRoot';

export default function Settings() {
  const { settings, updateSettings } = useSettingsStore();
  const [localModalState, setLocalModalState] = useState<NetModalState>({
    title: 'TEST',
    desc: 'Testing modal state.',
    input: 'textarea',
    button: 'Confirm test',
    value: 'null',
    visible: false,
  });

  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && localModalState.visible) {
        changeSetting(
          localModalState.value,
          (document.getElementById('NETmodalvalue') as HTMLInputElement).value,
        );
      }
    };
    if (localModalState.visible) {
      window.addEventListener('keydown', handleEnter);
    } else {
      window.removeEventListener('keydown', handleEnter);
    }
  }, [localModalState]);

  function closeModal() {
    setLocalModalState((prev) => ({
      ...prev,
      visible: false,
    }));
  }

  function changeSetting(s: string, v: string | boolean) {
    updateSettings({
      ...settings,
      [s]: v,
    });
    closeModal();
  }

  function changePath(v: string, p: string) {
    window.electron.ipcRenderer
      .invoke('select-path', p)
      .then((res) => {
        if (res) {
          updateSettings({
            ...settings,
            [v]: res,
          });
        }
        return res;
      })
      .catch((err) => {
        console.error('Error selecting path:', err);
      });
  }

  console.log(settings);
  return (
    <MenuRoot background={settings.background}>
      <FrenzyNETHeader nav page="settings" />
      <div id="body">
        <div className="NETcontainer">
          <div className="NETheader">GAME SETTINGS</div>
          <div className="NETbody">
            <div className="NETline">
              <b>selected_impact:</b>{' '}
              {settings.selected_impact ? settings.selected_impact : 'NONE'}{' '}
              <Link to="/browse" state={{ prevPage: 'settings' }} tabIndex={-1}>
                <a>&lt;CHANGE&gt;</a>
              </Link>
            </div>
            <div className="NETline">
              <b>player_theme:</b> {settings.player_theme}{' '}
              <a
                onClick={() =>
                  setLocalModalState({
                    title: 'Change Theme',
                    desc: 'Change the FWF player theme.',
                    input: 'dropdown',
                    button: '✓ CHANGE THEME',
                    value: 'player_theme',
                    visible: true,
                  })
                }
              >
                &lt;CHANGE&gt;
              </a>
            </div>
            <div className="NETline">
              <b>impact_folder_path:</b> {settings.impact_folder_path}{' '}
              <a
                onClick={() =>
                  changePath('impact_folder_path', settings.impact_folder_path)
                }
              >
                &lt;CHANGE&gt;
              </a>
            </div>
            <div className="NETline">
              <b>save_folder_path:</b> {settings.save_folder_path}{' '}
              <a
                onClick={() =>
                  changePath('save_folder_path', settings.save_folder_path)
                }
              >
                &lt;CHANGE&gt;
              </a>
            </div>
            <div className="NETline">
              <b>skip_button:</b>{' '}
              {settings.skip_button ? 'ENABLED' : 'DISABLED'}{' '}
              <a
                onClick={() =>
                  changeSetting('skip_button', !settings.skip_button)
                }
              >
                &lt;CHANGE&gt;
              </a>
            </div>
            <div className="NETline">
              <b>skip_timer:</b> {settings.skip_timer}{' '}
              <a
                onClick={() =>
                  setLocalModalState({
                    title: 'Change Skip Timer',
                    desc: 'Set the duration that you need to wait until the skip button shows up.',
                    input: 'number',
                    button: '✓ CHANGE SKIP TIMER',
                    value: 'skip_timer',
                    visible: true,
                  })
                }
              >
                &lt;CHANGE&gt;
              </a>
            </div>
          </div>
          <div className="NETheader">UI SETTINGS</div>
          <div className="NETbody">
            <div className="NETline">
              <b>background:</b>{' '}
              {settings.background ? settings.background : 'DEFAULT'}{' '}
              <a
                onClick={() =>
                  setLocalModalState({
                    title: 'Change Background',
                    desc: 'Change the FrenzyNET background GIF.',
                    input: 'dropdown',
                    button: '✓ CHANGE BACKGROUND',
                    value: 'background',
                    visible: true,
                  })
                }
              >
                &lt;CHANGE&gt;
              </a>
            </div>
            <div className="NETline">
              <b>use_canonical_stats:</b>{' '}
              {settings.canonical ? 'ENABLED' : 'DISABLED'}{' '}
              <a
                onClick={() => {
                  changeSetting('canonical', !settings.canonical);
                }}
              >
                &lt;CHANGE&gt;
              </a>
            </div>
          </div>
          <div className="NETheader">USER SETTINGS</div>
          <div className="NETbody">
            <div className="NETline">
              <b>username:</b> {settings.username ? settings.username : 'NONE'}{' '}
              <a
                onClick={() =>
                  setLocalModalState({
                    title: 'Change Username',
                    desc: 'Change displayed username when using Classic theme.',
                    input: 'text',
                    button: '✓ CHANGE USERNAME',
                    value: 'username',
                    visible: true,
                  })
                }
              >
                &lt;CHANGE&gt;
              </a>
            </div>
            <div className="NETline">
              <b>class:</b> {settings.class ? settings.class : 'NONE'}{' '}
              <a
                onClick={() =>
                  setLocalModalState({
                    title: 'Change Class',
                    desc: 'Change your user class when using Classic theme.',
                    input: 'dropdown',
                    button: '✓ CHANGE CLASS',
                    value: 'class',
                    visible: true,
                  })
                }
              >
                &lt;CHANGE&gt;
              </a>
            </div>
            <div className="NETline">
              <b>location:</b> {settings.location ? settings.location : 'NONE'}{' '}
              <a
                onClick={() =>
                  setLocalModalState({
                    title: 'Change Location',
                    desc: 'Change your user location for certain location-based game effects.',
                    input: 'dropdown',
                    button: '✓ CHANGE LOCATION',
                    value: 'location',
                    visible: true,
                  })
                }
              >
                &lt;CHANGE&gt;
              </a>
            </div>
          </div>
          <div className="NETheader">VIDEO SETTINGS</div>
          <div className="NETbody">
            <div className="NETline">
              <b>fullscreen:</b> {settings.fullscreen ? 'ENABLED' : 'DISABLED'}{' '}
              <a
                onClick={() => {
                  window.electron.ipcRenderer.sendMessage(
                    'toggle-fullscreen',
                    !settings.fullscreen,
                  );
                  changeSetting('fullscreen', !settings.fullscreen);
                }}
              >
                &lt;CHANGE&gt;
              </a>
            </div>
          </div>
          <div className="NETheader">AUDIO SETTINGS</div>
          <div className="NETbody">
            <div className="NETline">
              <b>volume_master:</b> {settings.volume_master}{' '}
              <a
                onClick={() =>
                  setLocalModalState({
                    title: 'Change Master Volume',
                    input: 'number',
                    button: '✓ CHANGE MASTER VOLUME',
                    value: 'volume_master',
                    visible: true,
                  })
                }
              >
                &lt;CHANGE&gt;
              </a>
            </div>
            <div className="NETline">
              <b>volume_video:</b> {settings.volume_video}{' '}
              <a
                onClick={() =>
                  setLocalModalState({
                    title: 'Change Video Volume',
                    input: 'number',
                    button: '✓ CHANGE VIDEO VOLUME',
                    value: 'volume_video',
                    visible: true,
                  })
                }
              >
                &lt;CHANGE&gt;
              </a>
            </div>
            <div className="NETline">
              <b>volume_music:</b> {settings.volume_music}{' '}
              <a
                onClick={() =>
                  setLocalModalState({
                    title: 'Change Music Volume',
                    input: 'number',
                    button: '✓ CHANGE MUSIC VOLUME',
                    value: 'volume_music',
                    visible: true,
                  })
                }
              >
                &lt;CHANGE&gt;
              </a>
            </div>
          </div>
        </div>
      </div>
      <NetModal
        modalState={localModalState}
        setter={setLocalModalState}
      ></NetModal>
    </MenuRoot>
  );
}
