import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Link, useNavigate } from 'react-router-dom';
import GameControls from './GameControls';
import {
  userSettings,
  impact,
  impactBlock,
  gameState,
  blockTiming,
  gameFlags,
  blockFlags,
  blockTarget,
  blockVideo,
  blockCondition,
  GameProps,
} from './interfaces';
import { fadeAudio } from './util/util';
import { handleFlags, handleSelect } from '../lib/GameLogic';
import { useSettingsStore } from '../hooks/useSettingsStore';

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
  const { settings } = useSettingsStore();
  const [localImpact, setLocalImpact] = useState<impact>({
    info: {
      game: '',
      title: '',
      subtitle: '',
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
  });

  const [localGameState, setLocalGameState] = useState<gameState>({
    block: {
      title: '',
      videos: [],
    },
    currentVideo: '',
    currentMusic: '',
    flags: {},
    seen: [],
  });

  const [playing, setPlaying] = useState<boolean>(true);

  const [fader, setFader] = useState<number>(100);

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

  useEffect(() => {
    const { selected_impact, impact_folder_path } = settings;

    const initializeGame = async () => {
      try {
        const res: impact = await window.electron.ipcRenderer.invoke(
          'get-impact',
          selected_impact,
          impact_folder_path,
        );
        setLocalImpact(res);
        // Initialize flags
        const flags: gameFlags = {};
        Object.keys(res.meta.flags).forEach((f) => {
          flags[f] = getDefaultValue(res.meta.flags[f]);
        });

        setLocalGameState((prev: gameState) => ({
          ...prev,
          seen: [
            ...prev.seen,
            res.meta.start,
            `${res.meta.start}_${res.blocks[res.meta.start].videos[0].path}`,
          ],
          block: res.blocks[res.meta.start],
          currentVideo: res.blocks[res.meta.start].videos[0].path,
          currentMusic:
            res.music[res.blocks[res.meta.start].videos[0].music].path,
          flags,
        }));
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };

    initializeGame();
  }, []);

  function restartGame() {
    const { meta, blocks, music } = localImpact;
    setLocalGameState((prev: gameState) => ({
      ...prev,
      seen: [
        ...prev.seen,
        meta.start,
        `${meta.start}_${blocks[meta.start].videos[0].path}`,
      ],
      block: blocks[meta.start],
      currentVideo: blocks[meta.start].videos[0].path,
      currentMusic: music[blocks[meta.start].videos[0].music].path,
      flags: {},
    }));
    setPlaying(true);
  }

  if (!localImpact) {
    return <div>Impact was unable to be loaded from file.</div>;
  }

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

    // handle block flags
    if (localImpact.blocks[target.target].flags) {
      handleFlags(
        newFlags,
        localImpact.blocks[target.target].flags as blockFlags,
      );
    }
    // fade out video
    gameCurtain.current?.setAttribute('style', 'background-color: black;');

    // figure out next video given block and flags
    const nextVideo = handleSelect(
      localGameState,
      localImpact.blocks[target.target],
    );

    // if the music changes, fade out audio
    if (
      localGameState.currentMusic !== localImpact.music[nextVideo.music].path
    ) {
      console.log(`${localGameState.currentMusic} ${nextVideo.music}`);
      fadeAudio(fader, setFader, false);
    }
    // wait 500 ms then change video
    setTimeout(() => {
      // now that we know video, handle video flags
      if (nextVideo.flags) {
        handleFlags(newFlags, nextVideo.flags);
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
        block: localImpact.blocks[target.target],
        currentVideo: nextVideo.path,
        currentMusic: localImpact.music[nextVideo.music].path,
      }));
      console.log(localGameState.seen);
      setShowControls({
        show: false,
        lock: false,
      });
      // fade in video
      gameCurtain.current?.removeAttribute('style');
      // if the music changes, fade in audio
      if (
        localGameState.currentMusic !== localImpact.music[nextVideo.music].path
      ) {
        console.log('fading in audio');
        // this works as intended due to state weirdness with setTimeout
        fadeAudio(fader, setFader, true);
      }
    }, 1000);
  };

  // determines how videos change when it ends and starts a new video
  const nextBlock = (target: string) => {
    // no need to lower/lock controls as they shouldn't be up
    // no need to handle target flags because there are no targets
    // handle block flags
    const newFlags = localGameState.flags;
    // fade out video
    gameCurtain.current?.setAttribute('style', 'background-color: black;');
    if (localImpact.blocks[target].flags) {
      handleFlags(newFlags, localImpact.blocks[target].flags);
    }
    // figure out next video given block and flags
    const nextVideo = handleSelect(localGameState, localImpact.blocks[target]);

    // if the music changes, fade out audio
    if (
      localGameState.currentMusic !== localImpact.music[nextVideo.music].path
    ) {
      console.log(`${localGameState.currentMusic} ${nextVideo.music}`);
      fadeAudio(fader, setFader, false);
    }
    
    // wait 500 ms then change video
    setTimeout(() => {
      // now that we know video, handle video flags
      if (nextVideo.flags) {
        handleFlags(newFlags, nextVideo.flags);
      }
      // switch to new video
      console.log(newFlags);
      setLocalGameState((prev) => ({
        ...prev,
        seen: [
          ...prev.seen,
          target,
          `${target} ${localImpact.blocks[target].videos[0].path}`,
        ],
        flags: newFlags,
        block: localImpact.blocks[target],
        currentVideo: nextVideo.path,
        currentMusic: localImpact.music[nextVideo.music].path,
      }));
      console.log(localGameState.seen);
      setShowControls({
        show: false,
        lock: false,
      });
      // fade in video
      gameCurtain.current?.removeAttribute('style');
      // if the music changes, fade in audio
      if (
        localGameState.currentMusic !== localImpact.music[nextVideo.music].path
      ) {
        // this works as intended due to state weirdness with setTimeout
        fadeAudio(fader, setFader, true);
      }
    }, 1000);
  };

  const handleOnEnded = () => {
    // get current video
    let currentVideo: blockVideo = localGameState.block.videos[0]; // placeholder value to prevent typing issues
    localGameState.block.videos.forEach((v) => {
      if (v.path === localGameState.currentVideo) {
        currentVideo = v;
      }
    });
    if (gamePlayer.current) {
      if (currentVideo.targets) {
        // this is inconsistent
        console.log(`video loops at ${currentVideo.timing.loop}`);
        gamePlayer.current.seekTo(0);
        gamePlayer.current.seekTo(currentVideo.timing.loop);
      } else if (currentVideo.next) {
        nextBlock(currentVideo.next);
      } else if (localGameState.block.targets) {
        // this is inconsistent
        console.log(`video loops at ${currentVideo.timing.loop}`);
        gamePlayer.current.seekTo(0);
        gamePlayer.current.seekTo(currentVideo.timing.loop);
      } else if (localGameState.block.next) {
        nextBlock(localGameState.block.next);
      }
    } else {
      console.log("can't get player ref");
    }
  };

  const skipVideo = () => {
    // get current video
    let currentVideo: blockVideo = localGameState.block.videos[0]; // placeholder value to prevent typing issues
    localGameState.block.videos.forEach((v) => {
      if (v.path === localGameState.currentVideo) {
        currentVideo = v;
      }
    });
    // now if there are targets to be shown, skip to them. prioritize video-specific rules
    if (gamePlayer.current) {
      if (currentVideo.targets) {
        gamePlayer.current.seekTo(currentVideo.timing.targets);
      } else if (currentVideo.next) {
        nextBlock(currentVideo.next);
      } else if (localGameState.block.targets) {
        console.log(`seeking to ${currentVideo.timing.targets}`);
        gamePlayer.current.seekTo(currentVideo.timing.targets);
      } else if (localGameState.block.next) {
        nextBlock(localGameState.block.next);
      }
    }
    // hide the skip button
    if (gameSkip.current) {
      gameSkip.current.removeAttribute('style');
    }
  };

  interface progress {
    played: number;
    loaded: number;
    playedSeconds: number;
    loadedSeconds: number;
  }

  const handleOnProgress = (e: progress) => {
    let currentVideoTiming: blockTiming = { targets: -1, loop: -1 };
    localGameState.block.videos.forEach((v) => {
      if (v.path === localGameState.currentVideo && v.timing) {
        currentVideoTiming = v.timing;
      }
    });
    if (e.playedSeconds > currentVideoTiming.targets) {
      if (!showControls.lock) {
        setShowControls({
          show: true,
          lock: false,
        });
      }
    }
    if (e.playedSeconds > 3 && gameSkip.current) {
      gameSkip.current.setAttribute('style', 'opacity: 1;');
    }
  };

  const classMap: { [key: string]: string } = {
    '#': 'Regulator',
    '$': 'Banker',
    '*': 'Senator',
  };

  switch (settings.player_theme) {
    case 'classic':
      return (
        <div className="gameRoot">
          <div className="gameHeader">
            <div className="gameTitlebar">
              <div className="gameTitling">
                <div className="gameTitle">
                  {localImpact.info.game.toUpperCase()} /{' '}
                  {localImpact.info.title.toUpperCase()}
                </div>
                <div className="gameSubtitle">{localImpact.info.subtitle}</div>
              </div>
              <Link to="/">
                <div className="gameUser">
                  <div className="gameUsername">
                    {settings.username ? settings.username : 'MAIN MENU'}
                  </div>
                  <div className="gameUserclass">
                    {settings.class ? classMap[settings.class] : ''}
                  </div>
                </div>
              </Link>
            </div>
            <div className="gameBody">
              <div className="gamePlayer">
                <div className="gameCurtain" ref={gameCurtain}></div>
                <GameControls
                  block={localGameState.block}
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
                  volume={
                    (settings.volume_video * settings.volume_master) / 10000
                  }
                  url={`impact://${localGameState.currentVideo}?path=${settings.impact_folder_path}&impact=${settings.selected_impact}`}
                />
                <ReactPlayer
                  width="0px"
                  height="0px"
                  playing={playing}
                  loop
                  controls={false}
                  volume={
                    ((settings.volume_music * settings.volume_master) / 10000) *
                    (fader / 100)
                  }
                  url={`impact://${localGameState.currentMusic}?path=${settings.impact_folder_path}&impact=${settings.selected_impact}`}
                ></ReactPlayer>
                <div
                  className="gameSkip"
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
              · <a onClick={restartGame}>Restart</a> · Video playback problems?
              You won&apos;t lose your place.
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
        </div>
      );
    default:
      return (
        <div>
          No theme selected. Click <Link to="/">HERE</Link> to return to main
          menu.
        </div>
      );
  }
}
