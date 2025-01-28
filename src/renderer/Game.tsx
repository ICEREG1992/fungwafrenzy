import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { Link, useNavigate } from 'react-router-dom';
import GameControls from './GameControls';
import {
  userSettings,
  Impact,
  impactBlock,
  gameState,
  blockTiming,
  gameFlags,
  blockFlags,
  blockTarget,
  blockVideo,
  blockCondition,
  GameProps,
  NetModalState,
  SaveGame,
  ModalState,
} from './interfaces';
import { fadeAudio } from './util/util';
import { handleFlags, handleSelect } from '../lib/GameLogic';
import { useSettingsStore } from '../hooks/useSettingsStore';
import SaveModal from './SaveModal';
import PopupMenu from './PopupMenu';
import DebugPane from './DebugPane';
import UseMusicVolume from './MusicVolume';

function getDefaultValue(t: string) {
  switch (t) {
    case 'bool':
      return false;
    case 'int':
      return 0;
    default:
      return 0;
  }
}

/* Game manages the following states/refs
state impact: holds all of the info for the impact, as read in by impact.json
state gameState: holds the current block the user has loaded, the current video that was loaded from that block, and all of the runtime variables the impact uses
state playing: determines whether the player is stopped or playing
state showControls: determines whether the controls (buttons) are shown or hidden. lock is used so that the controls don't reappear during the closing animation
state fader: controls fade-out for the players
ref gamePlayer: ref to the video player so we can do things like move to next video after the current video ends, and raise controls at the right time
ref gameControls: ref to the controls so we can raise and lower them at will
ref gameCurtain: ref to the div that we use as a "curtain" to fade to black and such
ref gameSkip: ref to the skip button
*/
export default function Game(props: GameProps) {
  const navigate = useNavigate();
  const { settings, setSettings } = useSettingsStore();
  const [localImpact, setLocalImpact] = useState<Impact>(() => {
    return {
      info: {
        game: 'Fung-Wa Frenzy',
        title: 'DATAFAULT!',
        subtitle: 'DATAFAULT!',
        description: '',
        length: '',
        author: '',
      },
      meta: {
        flags: {},
        start: '',
      },
      blocks: {},
      music: {},
    };
  });

  const [localGameState, setLocalGameState] = useState<gameState>({
    block: {
      title: '',
      videos: [],
    },
    currentVideo: {
      title: 'Diskfault!',
      path: localImpact.meta.diskfault,
    },
    playingMusic: '',
    flags: {},
    seen: [],
  });

  const [localModalState, setLocalModalState] = useState<ModalState>({
    type: 'quit',
    visible: false,
  });

  const [playing, setPlaying] = useState<boolean>(true);

  const [fader, setFader] = useState<number>(100);

  const musicVolume = UseMusicVolume({
    targetVolume: localGameState.currentVideo.music
      ? localImpact.music[localGameState.currentVideo.music as string].volume
      : 0,
  });

  interface ControlsLock {
    show: boolean;
    lock: boolean;
  }

  const [showControls, setShowControls] = useState<ControlsLock>({
    show: false,
    lock: false,
  });

  const gamePlayer = useRef<ReactPlayer | null>(null);
  const gameCurtain = useRef<HTMLDivElement>(null);
  const gameSkip = useRef<HTMLDivElement>(null);
  const gameControl = useRef<typeof GameControls | null>(null);

  async function initializeGame() {
    try {
      const imp: Impact = await window.electron.ipcRenderer.invoke(
        'get-impact',
        settings.selected_impact,
        settings.impact_folder_path,
      );
      setLocalImpact(imp);
      // Initialize flags
      const flags: gameFlags = {};
      Object.keys(imp.meta.flags).forEach((f) => {
        flags[f] = getDefaultValue(imp.meta.flags[f]);
      });

      // figure out first video given block and flags
      const [firstBlock, firstVideo] = handleSelect(
        localGameState,
        imp.blocks[imp.meta.start],
        settings,
        imp,
      );

      // if music does not exist, send null so it plays nothing
      let initialMusic = '';
      if (firstVideo.music && !firstVideo.timing?.music) {
        initialMusic = imp.music[firstVideo.music].path;
      }

      setLocalGameState((prev: gameState) => ({
        ...prev,
        seen: [imp.meta.start, `${imp.meta.start}_${firstVideo.path}`],
        block: firstBlock,
        currentVideo: firstVideo,
        playingMusic: initialMusic,
        flags,
      }));
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  }

  async function loadFromSave() {
    try {
      // start by loading impact
      const imp: Impact = await window.electron.ipcRenderer.invoke(
        'get-impact',
        settings.selected_impact,
        settings.impact_folder_path,
      );
      setLocalImpact(imp);
      // now pull game state from save file
      const sav: SaveGame = await window.electron.ipcRenderer.invoke(
        'get-savedata',
        settings.selected_save,
        settings.save_folder_path,
      );
      setLocalGameState(sav.gameState);
    } catch (error) {
      console.error('Failed to initialize game from save:', error);
    }
  }

  useEffect(() => {
    if (props.continue) {
      loadFromSave();
    } else {
      initializeGame();
    }
    // tell main process to block exit
    window.electron.ipcRenderer.sendMessage('block-close');
    // Create listener for exit confirmation
    window.electron.ipcRenderer.on('ask-to-close', () => {
      // tell main process to allow exit
      window.electron.ipcRenderer.sendMessage('allow-close');
      if (localModalState.visible) {
        // user is clicking again, go ahead and close
        window.electron.ipcRenderer.sendMessage('close-app');
      }
      setLocalModalState((prev) => ({
        ...prev,
        visible: true,
      }));
    });
  }, []);

  const confirmMenu = useCallback(async () => {
    if (props.continue) {
      // start by checking if gamestate differs from saved gamestate
      const sav: SaveGame = await window.electron.ipcRenderer.invoke(
        'get-savedata',
        settings.selected_save,
        settings.save_folder_path,
      );
      if (
        sav.gameState.currentVideo.path === localGameState.currentVideo.path
      ) {
        navigate('/');
      } else {
        setLocalModalState((prev) => ({
          type: 'menu',
          visible: true,
        }));
      }
    } else {
      if (
        localGameState.block.title ===
        localImpact.blocks[localImpact.meta.start].title
      ) {
        navigate('/');
      } else {
        setLocalModalState((prev) => ({
          type: 'menu',
          visible: true,
        }));
      }
    }
  }, [settings, localGameState, localImpact]);

  const restartGame = useCallback(() => {
    initializeGame();
    gamePlayer.current?.seekTo(0);
    setPlaying(true);
    // hide and unlock controls so they can show up later
    setShowControls({
      show: false,
      lock: false,
    });
  }, [initializeGame, gamePlayer]);

  const confirmRestart = useCallback(() => {
    if (props.continue) {
      setLocalModalState((prev) => ({
        type: 'restart',
        visible: true,
      }));
    } else {
      if (
        localGameState.block.title ===
        localImpact.blocks[localImpact.meta.start].title
      ) {
        restartGame();
      } else {
        setLocalModalState((prev) => ({
          type: 'restart',
          visible: true,
        }));
      }
    }
  }, [settings, localGameState, restartGame, localImpact]);

  const saveGame = useCallback(() => {
    // build save game
    const newDate = new Date();
    const filename = newDate.getTime().toString();
    const newSave: SaveGame = {
      key: newDate.toLocaleString(),
      filename,
      date: newDate,
      impact: settings.selected_impact,
      gameState: localGameState,
    };
    window.electron.ipcRenderer.invoke(
      'save-savedata',
      newSave,
      settings.save_folder_path,
    );
    // set newly created save as currently selected
    setSettings({
      ...settings,
      selected_save: filename,
    });
  }, [localGameState, settings]);

  // determines how videos change when a user clicks a button
  const selectBlock = (target: blockTarget) => {
    setShowControls({
      show: false,
      lock: true, // lock the controls so they don't get put back up by handleOnProgress
    });
    // handle button flags
    const newFlags = localGameState.flags;
    if (target.flags) {
      handleFlags(newFlags, target.flags);
    }

    if (target.target.toString() === 'restart') {
      console.log('restarting game');
      restartGame();
      return;
    }

    if (target.target.toString() === 'menu') {
      console.log('returning to menu');
      navigate('/');
      return;
    }

    // fade out video
    gameCurtain.current?.setAttribute('style', 'background-color: black;');

    // figure out next video given block and flags
    const [nextBlock, nextVideo] = handleSelect(
      localGameState,
      localImpact.blocks[target.target],
      settings,
      localImpact,
    );

    // if the music changes, fade out audio
    if (
      nextVideo.music &&
      localGameState.playingMusic !== localImpact.music[nextVideo.music].path
    ) {
      console.log(`${localGameState.playingMusic} ${nextVideo.music}`);
      fadeAudio(fader, setFader, false);
    }
    // wait 500 ms then change video
    setTimeout(() => {
      // now that we know block and video, handle block and video flags
      // handle block flags
      if (nextBlock.flags) {
        handleFlags(newFlags, nextBlock.flags as blockFlags);
      }
      if (nextVideo.flags) {
        handleFlags(newFlags, nextVideo.flags);
      }
      // if music does not exist, or doesn't start at video start, send null so it plays nothing
      let nextMusic = '';
      if (nextVideo.music && !nextVideo.timing?.music) {
        nextMusic = localImpact.music[nextVideo.music].path;
      }
      // if video doesn't change, seek back to the beginning so it can play again
      if (nextVideo.path === localGameState.currentVideo.path) {
        gamePlayer.current?.seekTo(0);
      }
      // switch to new video
      console.log(newFlags);
      setLocalGameState((prev) => ({
        ...prev,
        seen: [
          ...prev.seen,
          target.target,
          `${target.target} ${nextVideo.path}`,
        ],
        flags: newFlags,
        block: nextBlock,
        currentVideo: nextVideo,
        playingMusic: nextMusic,
      }));
      console.log(localGameState.seen);
      setShowControls({
        show: nextVideo.timing?.targets === 0,
        lock: false,
      });
      // fade in video
      gameCurtain.current?.removeAttribute('style');
      // if the music changes, fade in audio
      if (
        nextVideo.music &&
        localGameState.playingMusic !== localImpact.music[nextVideo.music].path
      ) {
        console.log('fading in audio');
        // this works as intended due to state weirdness with setTimeout
        fadeAudio(fader, setFader, true);
      }
    }, 1000);
  };

  // determines how videos change when it ends and starts a new video
  const handleNextBlock = (target: string) => {
    // no need to lower/lock controls as they shouldn't be up
    // fade out video
    gameCurtain.current?.setAttribute('style', 'background-color: black;');

    // figure out next video given block and flags
    const [nextBlock, nextVideo] = handleSelect(
      localGameState,
      localImpact.blocks[target],
      settings,
      localImpact,
    );

    // if the music changes, fade out audio
    if (
      nextVideo.music &&
      localGameState.playingMusic !== localImpact.music[nextVideo.music].path
    ) {
      console.log(`${localGameState.playingMusic} ${nextVideo.music}`);
      fadeAudio(fader, setFader, false);
    }

    // wait 500 ms then change video
    setTimeout(() => {
      // now that we know video and block, handle video and block flags
      // no need to handle target flags because there are no targets
      const newFlags = localGameState.flags;
      if (nextBlock.flags) {
        handleFlags(newFlags, nextBlock.flags);
      }
      if (nextVideo.flags) {
        handleFlags(newFlags, nextVideo.flags);
      }
      // if music does not exist, or doesn't start at video start, send null so it plays nothing
      let nextMusic = '';
      if (nextVideo.music && !nextVideo.timing?.music) {
        nextMusic = localImpact.music[nextVideo.music].path;
      }
      // if video doesn't change, seek back to the beginning so it can play again
      if (nextVideo.path === localGameState.currentVideo.path) {
        gamePlayer.current?.seekTo(0);
      }
      // switch to new video
      console.log(newFlags);
      setLocalGameState((prev) => ({
        ...prev,
        seen: [...prev.seen, target, `${target} ${nextVideo.path}`],
        flags: newFlags,
        block: nextBlock,
        currentVideo: nextVideo,
        playingMusic: nextMusic,
      }));
      console.log(localGameState.seen);
      setShowControls({
        show: nextVideo.timing?.targets === 0,
        lock: false,
      });
      // fade in video
      gameCurtain.current?.removeAttribute('style');
      // if the music changes, fade in audio
      if (
        nextVideo.music &&
        localGameState.playingMusic !== localImpact.music[nextVideo.music].path
      ) {
        // this works as intended due to state weirdness with setTimeout
        fadeAudio(fader, setFader, true);
      }
    }, 1000);
  };

  const handleOnEnded = () => {
    if (gamePlayer.current) {
      if (localGameState.currentVideo.targets) {
        // this is inconsistent
        console.log(
          `video loops at ${localGameState.currentVideo.timing?.loop}`,
        );
        gamePlayer.current.seekTo(0);
        gamePlayer.current.seekTo(
          localGameState.currentVideo.timing?.loop as number,
        );
      } else if (localGameState.currentVideo.next) {
        handleNextBlock(localGameState.currentVideo.next);
      } else if (localGameState.block.targets) {
        // this is inconsistent
        console.log(
          `video loops at ${localGameState.currentVideo.timing?.loop}`,
        );
        gamePlayer.current.seekTo(0);
        gamePlayer.current.seekTo(
          localGameState.currentVideo.timing?.loop as number,
        );
      } else if (localGameState.block.next) {
        handleNextBlock(localGameState.block.next);
      }
    } else {
      console.log("can't get player ref");
    }
  };

  const skipVideo = () => {
    // only run if the skip button should be visible
    if (gameSkip.current?.hasAttribute('style')) {
      // now if there are targets to be shown, skip to them. prioritize video-specific rules
      if (gamePlayer.current) {
        if (localGameState.currentVideo.targets) {
          gamePlayer.current.seekTo(
            localGameState.currentVideo.timing?.targets as number,
          );
        } else if (localGameState.currentVideo.next) {
          handleNextBlock(localGameState.currentVideo.next);
        } else if (localGameState.block.targets) {
          console.log(
            `seeking to ${localGameState.currentVideo.timing?.targets}`,
          );
          gamePlayer.current.seekTo(
            localGameState.currentVideo.timing?.targets as number,
          );
        } else if (localGameState.block.next) {
          handleNextBlock(localGameState.block.next);
        }
      }
      // hide the skip button
      if (settings.skip_button && gameSkip.current) {
        gameSkip.current.removeAttribute('style');
      }
    }
  };

  interface progress {
    played: number;
    loaded: number;
    playedSeconds: number;
    loadedSeconds: number;
  }

  const handleOnProgress = (e: progress) => {
    // show targets on time
    if (
      localGameState.currentVideo.timing?.targets &&
      e.playedSeconds > localGameState.currentVideo.timing?.targets
    ) {
      if (!showControls.lock) {
        setShowControls({
          show: true,
          lock: false,
        });
      }
    }
    // cut out music on time
    if (
      localGameState.currentVideo.timing?.silence &&
      e.playedSeconds > localGameState.currentVideo.timing.silence
    ) {
      // fade out audio gracefully
      fadeAudio(fader, setFader, false);
      // set audio to blank in half a second
      setTimeout(() => {
        setLocalGameState((prev) => ({
          ...prev,
          playingMusic: '',
        }));
      }, 1000);
    }
    // start and cut out music on time
    if (
      (localGameState.currentVideo.timing?.music &&
        !localGameState.currentVideo.timing.silence &&
        e.playedSeconds > localGameState.currentVideo.timing.music) ||
      (localGameState.currentVideo.timing?.music &&
        localGameState.currentVideo.timing.silence &&
        e.playedSeconds > localGameState.currentVideo.timing.music &&
        e.playedSeconds < localGameState.currentVideo.timing.silence)
    ) {
      setLocalGameState((prev) => ({
        ...prev,
        playingMusic:
          localImpact.music[localGameState.currentVideo.music as string].path,
      }));
      fadeAudio(fader, setFader, true);
    }
    // show and hide skip button
    if (settings.skip_button) {
      if (localGameState.currentVideo.timing?.targets) {
        if (
          e.playedSeconds > settings.skip_timer &&
          e.playedSeconds < localGameState.currentVideo.timing.targets &&
          gameSkip.current
        ) {
          gameSkip.current.setAttribute('style', 'opacity: 1;');
        } else if (gameSkip.current) {
          gameSkip.current.removeAttribute('style');
        }
      } else {
        if (e.playedSeconds > settings.skip_timer && gameSkip.current) {
          gameSkip.current.setAttribute('style', 'opacity: 1;');
        } else if (e.playedSeconds < settings.skip_timer && gameSkip.current) {
          gameSkip.current.removeAttribute('style');
        }
      }
    }
  };

  const calculateVolume = () => {
    if (localGameState.currentVideo.music) {
      return (
        ((settings.volume_music * settings.volume_master) / 10000) *
        (fader / 100) *
        (musicVolume / 100)
      );
    } else {
      return (
        ((settings.volume_music * settings.volume_master) / 10000) *
        (fader / 100)
      );
    }
  };

  // prettier-ignore
  const classMap: { [key: string]: string } = {
    '#': 'Regulator',
    '$': 'Banker',
    '*': 'Senator',
  };

  switch (settings.player_theme) {
    case 'classic':
    case 'large':
      return (
        <div className="gameRoot">
          <div className="gameHeader">
            <div className={`gameTitlebar ${localImpact.meta.color}`}>
              <div className="gameTitling">
                <div className="gameTitle">
                  {localImpact.info.game.toUpperCase()} /{' '}
                  {localImpact.info.title.toUpperCase()}
                </div>
                <div className={`gameSubtitle ${localImpact.meta.color}`}>
                  {localImpact.info.subtitle}
                </div>
              </div>
              <a onClick={confirmMenu}>
                <div className="gameUser">
                  <div className="gameUsername">
                    {settings.username ? settings.username : 'MAIN MENU'}
                  </div>
                  <div className="gameUserclass">
                    {settings.class ? classMap[settings.class] : ''}
                  </div>
                </div>
              </a>
            </div>
            <div className={`gameBody ${settings.player_theme}`}>
              <div className={`gamePlayer ${settings.player_theme}`}>
                <div
                  className={`gameCurtain ${settings.player_theme}`}
                  ref={gameCurtain}
                ></div>
                <GameControls
                  state={localGameState}
                  show={showControls.show}
                  setter={selectBlock}
                ></GameControls>
                <ReactPlayer
                  className="gameVideo"
                  ref={gamePlayer}
                  onEnded={handleOnEnded}
                  onProgress={handleOnProgress}
                  progressInterval={250}
                  controls={false}
                  playing={playing}
                  height={settings.player_theme === 'large' ? '720px' : '360px'}
                  width={settings.player_theme === 'large' ? '1280px' : '640px'}
                  volume={
                    (settings.volume_video * settings.volume_master) / 10000
                  }
                  url={`impact://${encodeURIComponent(localGameState.currentVideo.path as string)}?path=${settings.impact_folder_path}&impact=${settings.selected_impact}`}
                />
                <ReactPlayer
                  width="0px"
                  height="0px"
                  playing={playing}
                  loop
                  controls={false}
                  volume={calculateVolume()}
                  url={`impact://${localGameState.playingMusic}?path=${settings.impact_folder_path}&impact=${settings.selected_impact}`}
                ></ReactPlayer>
                <div
                  className={`gameSkip ${settings.player_theme} ${localImpact.meta.color}`}
                  ref={gameSkip}
                  onClick={skipVideo}
                ></div>
              </div>
            </div>
            <div className="gameControls">
              <a
                onClick={() => {
                  setPlaying(!playing);
                }}
              >
                {playing ? 'Pause' : 'Play'}
              </a>{' '}
              · <a onClick={confirmRestart}>Restart</a> ·{' '}
              <a onClick={saveGame}>Save</a> · Video playback problems? Just
              refresh the page. You won&apos;t lose your place.
            </div>
          </div>
          <div className="gameFooter">
            <div className="gameFooterLeft">
              <div className="cdgLogo"></div>
              <div className="synydyneLogo"></div>
            </div>
            <div className="gameFooterRight">
              <div className="gameTaC">Terms & Conditions&nbsp;&nbsp;</div>
              <div>·&nbsp;&nbsp;©1995 Synydyne </div>
            </div>
          </div>
          <SaveModal
            modalState={localModalState}
            setter={setLocalModalState}
            save={saveGame}
            restart={restartGame}
            exit={() => {
              navigate('/');
            }}
          ></SaveModal>
          <DebugPane
            impact={localImpact}
            gameState={localGameState}
            setGameState={setLocalGameState}
          ></DebugPane>
        </div>
      );
    case 'fullscreen':
      return (
        <div className="gameRoot">
          <div className="gameBody fullscreen">
            <PopupMenu
              modalSetter={setLocalModalState}
              playing={playing}
              setPlaying={setPlaying}
              exit={confirmMenu}
              restart={confirmRestart}
              save={saveGame}
              skipRef={gameSkip}
              skip={skipVideo}
            ></PopupMenu>
            <div
              className={`gameCurtain ${settings.player_theme}`}
              ref={gameCurtain}
            ></div>
            <GameControls
              state={localGameState}
              show={showControls.show}
              setter={selectBlock}
            ></GameControls>
            <ReactPlayer
              className="gameVideo"
              ref={gamePlayer}
              onEnded={handleOnEnded}
              onProgress={handleOnProgress}
              progressInterval={250}
              controls={false}
              playing={playing}
              height="100%"
              width="100%"
              volume={(settings.volume_video * settings.volume_master) / 10000}
              url={`impact://${encodeURIComponent(localGameState.currentVideo.path as string)}?path=${settings.impact_folder_path}&impact=${settings.selected_impact}`}
            />
            <ReactPlayer
              width="0px"
              height="0px"
              playing={playing}
              loop
              controls={false}
              volume={calculateVolume()}
              url={`impact://${localGameState.playingMusic}?path=${settings.impact_folder_path}&impact=${settings.selected_impact}`}
            ></ReactPlayer>
          </div>
          <SaveModal
            modalState={localModalState}
            setter={setLocalModalState}
            save={saveGame}
            restart={restartGame}
            exit={() => {
              navigate('/');
            }}
          ></SaveModal>
          <DebugPane
            impact={localImpact}
            gameState={localGameState}
            setGameState={setLocalGameState}
          ></DebugPane>
        </div>
      );
    default:
      return (
        <div>
          You&aposve selected a bad theme somehow. Send this to ICEREG1992 along
          with your settings.json please!
        </div>
      );
  }
}
