import React, { useState, useEffect, useRef, LegacyRef } from 'react';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';
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
} from './interfaces';

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

interface GameProps {
  settings: userSettings;
  save?: gameState;
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
  const audioPlayer = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const { selected_impact, impact_folder_path } = props.settings;

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
  }, [
    props.settings.selected_impact,
    props.settings.impact_folder_path,
    props.settings,
  ]);

  /*
        Alters the state of our gameFlags according to a certain object's (block, target, or video) flags
        out: the current state of flags for this session
        flags: the flags for the intended object
    */
  function handleFlags(out: gameFlags, flags: blockFlags) {
    Object.keys(flags).forEach((flag) => {
      // if flag is boolean, the value will either be "true", "false", or "flip"
      switch (typeof out[flag]) {
        case 'boolean':
          switch (flags[flag]) {
            case 'true':
              out[flag] = true;
              break;
            case 'false':
              out[flag] = false;
              break;
            case 'flip':
              out[flag] = !out[flag];
              break;
            default:
              break;
          }
          break;
        case 'number':
          // if value ends in a "+" or "-", it is an operation, otherwise just assign the value
          switch (flags[flag].slice(-1)) {
            case '+':
              out[flag] =
                (out[flag] as number) + parseInt(flags[flag].slice(0, -1), 10);
              break;
            case '-':
              out[flag] =
                (out[flag] as number) - parseInt(flags[flag].slice(0, -1), 10);
              break;
            default:
              out[flag] = parseInt(flags[flag], 10);
              break;
          }
          break;
        default:
          break;
      }
    });
  }

  function checkCondition(condition: blockCondition) {
    switch (condition.type.toLowerCase()) {
      case 'and':
        // eslint-disable-next-line no-use-before-define
        return checkConditions(condition.value as Array<blockCondition>, 'AND');
      case 'or':
        return checkConditions(condition.value as Array<blockCondition>, 'OR');
      case 'seen':
        return localGameState.seen.includes(condition.value as string);
      case 'notseen':
        return !localGameState.seen.includes(condition.value as string);
      case 'time':
        const now = new Date();
        const h = now.getHours();
        const c = splitCondition(condition.value as string); // assert this is a string because it's not an array
        switch (c[0]) {
          case '==':
            if (parseInt(c[1])) {
              // compare to a const
              return h === parseInt(c[1]);
            } else {
              // compare to another flag
              return h === localGameState.flags[condition.value as string];
            }
          case '<=':
            if (parseInt(c[1])) {
              return h <= parseInt(c[1]);
            } else {
              return (
                h <=
                (localGameState.flags[
                  condition.value as string
                ] as unknown as number)
              );
            }
          case '>=':
            if (parseInt(c[1])) {
              return h >= parseInt(c[1]);
            } else {
              return (
                h >=
                (localGameState.flags[
                  condition.value as string
                ] as unknown as number)
              );
            }
          case '<':
            if (parseInt(c[1])) {
              return h < parseInt(c[1]);
            } else {
              return (
                h <
                (localGameState.flags[
                  condition.value as string
                ] as unknown as number)
              );
            }
          case '>':
            if (parseInt(c[1])) {
              return h > parseInt(c[1]);
            } else {
              return (
                h >
                (localGameState.flags[
                  condition.value as string
                ] as unknown as number)
              );
            }
          default:
            // unknown operator, return false
            return false;
        }
      case 'state':
        return props.settings.location === condition.value;
      default:
        // interpret this as a flag check
        switch (typeof localGameState.flags[condition.type]) {
          case 'boolean':
            switch (condition.value) {
              case 'true':
                return localGameState.flags[condition.type] as boolean;
              case 'false':
                return !localGameState.flags[condition.type] as boolean;
              default:
                // compare to another flag
                return (
                  localGameState.flags[condition.type] ===
                  localGameState.flags[condition.value as string]
                );
            }
          case 'number':
            const c = splitCondition(condition.value as string); // assert this is a string because it's not an array
            switch (c[0]) {
              case '==':
                if (parseInt(c[1])) {
                  // compare to a const
                  return (
                    localGameState.flags[condition.type] === parseInt(c[1])
                  );
                } else {
                  // compare to another flag
                  return (
                    localGameState.flags[condition.type] ===
                    localGameState.flags[condition.value as string]
                  );
                }
              case '<=':
                if (parseInt(c[1])) {
                  return (
                    (localGameState.flags[condition.type] as number) <=
                    parseInt(c[1])
                  );
                } else {
                  return (
                    localGameState.flags[condition.type] <=
                    localGameState.flags[condition.value as string]
                  );
                }
              case '>=':
                if (parseInt(c[1])) {
                  return (
                    (localGameState.flags[condition.type] as number) >=
                    parseInt(c[1])
                  );
                } else {
                  return (
                    localGameState.flags[condition.type] >=
                    localGameState.flags[condition.value as string]
                  );
                }
              case '<':
                if (parseInt(c[1])) {
                  return (
                    (localGameState.flags[condition.type] as number) <
                    parseInt(c[1])
                  );
                } else {
                  return (
                    localGameState.flags[condition.type] <
                    localGameState.flags[condition.value as string]
                  );
                }
              case '>':
                if (parseInt(c[1])) {
                  return (
                    (localGameState.flags[condition.type] as number) >
                    parseInt(c[1])
                  );
                } else {
                  return (
                    localGameState.flags[condition.type] >
                    localGameState.flags[condition.value as string]
                  );
                }
              default:
                // unknown operator, return false
                return false;
            }
          default:
            return false;
        }
    }
  }

  function checkConditions(conditions: Array<blockCondition>, mode?: string) {
    let out: boolean;
    switch (mode) {
      case 'AND':
        out = true;
        conditions.forEach((condition) => {
          out = out && checkCondition(condition);
        });
        break;
      case 'OR':
        out = false;
        conditions.forEach((condition) => {
          out = out || checkCondition(condition);
        });
        break;
      default:
        out = true;
        conditions.forEach((condition) => {
          out = out && checkCondition(condition);
        });
    }
    return out;
  }

  function handleSelect(gameState: gameState, block: impactBlock) {
    // figure out if this is a chance block or a condition block
    if (block.videos[0].chance) {
      // if it is chance, make one chance calculation and run it against each video until it hits
      const rand = Math.random();
      console.log(rand);
      // eslint-disable-next-line vars-on-top
      let sum = 0;
      let selectedVideo = block.videos[0];
      block.videos.some((video) => {
        // for every video, perform this check, stop once we hit true
        sum += video.chance as number; // assert this exists always because the first video specifies chance
        if (rand <= sum) {
          selectedVideo = video;
          return true;
        }
        return false;
      });
      return selectedVideo;
    } else {
      // eslint-disable-next-line no-lonely-if
      if (block.videos[0].conditions) {
        // this is now a flag check, watched check, time check, or location check
        let selectedVideo = block.videos[0];
        block.videos.some((video) => {
          // for every video, perform this check, stop once we hit true
          if (checkConditions(video.conditions as Array<blockCondition>)) {
            selectedVideo = video;
            return true;
          }
          return false;
        });
        // todo: logic here
        return selectedVideo;
        // eslint-disable-next-line no-else-return
      } else {
        // no chance or condition, return the first video in the set
        return block.videos[0];
      }
    }
  }

  function splitCondition(c: string) {
    // use regex to split a comparison out from the string
    const match = /^(==|<=|>=|<|>)(.*)/.exec(c);
    // eslint-disable-next-line spaced-comment
    return (match as RegExpExecArray).slice(1); //assert this has a result
  }

  function fadeAudio(p: boolean) {
    const steps = 10;
    const delay = 500 / steps;
    const value = p ? 0 : 100;
    const target = p ? 100 : 0;
    const step = (target - value) / steps;
    for (let i = 1; i <= steps; i += 1) {
      const targetValue = value + step * i;
      setTimeout(() => {
        setFader(targetValue);
      }, delay * i);
    }
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
      fadeAudio(false);
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
        // this works as intended due to state weirdness with setTimeout
        fadeAudio(true);
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
      fadeAudio(false);
    }

    // wait 500 ms then change video
    setTimeout(() => {
      // now that we know video, handle video flags
      if (nextVideo.flags) {
        handleFlags(newFlags, nextVideo.flags);
      }
      // switch to new video
      setLocalGameState((prev) => ({
        ...prev,
        seen: [
          ...prev.seen,
          target,
          `${target} ${localImpact.blocks[target].videos[0].path}`,
        ],
        block: localImpact.blocks[target],
        currentVideo: nextVideo.path,
        currentMusic: localImpact.music[nextVideo.music].path,
      }));
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
        fadeAudio(true);
      }
    }, 1000);
  };

  if (!localImpact) {
    return <div>Impact was unable to be loaded from file.</div>;
  }

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
        //gamePlayer.current.seekTo(currentVideo.timing.targets);
      } else if (currentVideo.next) {
        nextBlock(currentVideo.next);
      } else if (localGameState.block.targets) {
        console.log(`seeking to ${currentVideo.timing.targets}`);
        //gamePlayer.current.seekTo(currentVideo.timing.targets);
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
    $: 'Banker',
    '*': 'Senator',
  };

  switch (props.settings.player_theme) {
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
                    {props.settings.username
                      ? props.settings.username
                      : 'MAIN MENU'}
                  </div>
                  <div className="gameUserclass">
                    {props.settings.class ? classMap[props.settings.class] : ''}
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
                  onEnded={handleOnEnded}
                  onProgress={handleOnProgress}
                  progressInterval={250}
                  ref={gamePlayer as any}
                  playing={playing}
                  volume={
                    (props.settings.volume_video *
                      props.settings.volume_master) /
                    10000
                  }
                  url={`impact://${localGameState.currentVideo}?path=${props.settings.impact_folder_path}&impact=${props.settings.selected_impact}`}
                />
                <audio
                  ref={audioPlayer}
                  src={`impact://${localGameState.currentMusic}?path=${props.settings.impact_folder_path}&impact=${props.settings.selected_impact}`}
                  autoPlay
                  loop
                  style={{ display: 'none' }}
                />
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
              · <a>Restart</a> · Video playback problems? Just refresh the page.
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
