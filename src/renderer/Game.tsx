import React, { useState, useEffect, useRef } from 'react';
import { userSettings, impact, gameState, blockTiming, gameFlags, blockFlags, blockTarget } from './interfaces';
import GameControls from './GameControls';
import ReactPlayer from 'react-player'
import { Link } from 'react-router-dom';
import { getRandomValues } from 'crypto';

function getDefaultValue(t:string) {
    switch (t) {
        case "bool": return false;
        case "int": return 0;
        default: return 0;
    }
}

interface GameProps {
    settings:userSettings;
    save?:gameState;
}

/* Game manages the following states/refs
state impact: holds all of the info for the impact, as read in by impact.json
state gameState: holds the current block the user has loaded, the current video that was loaded from that block, and all of the runtime variables the impact uses
state playing: determines whether the player is stopped or playing
state showControls: determines whether the controls (buttons) are shown or hidden. lock is used so that the controls don't reappear during the closing animation
ref gamePlayer: ref to the video player so we can do things like move to next video after the current video ends, and raise controls at the right time
*/
export default function Game(props:GameProps) {

    const [impact, setImpact] = useState<impact>({
        info:{
            game: "",
            title: "",
            subtitle: "",
            description: "",
            length: "",
            author: "",
        },
        meta:{
            flags: {},
            start: "",
        },
        blocks:{},
        music:{},
    });

    const [gameState, setGameState] = useState<gameState>({
        block: {
            title:"",
            videos:[],
        },
        currentVideo: "",
        flags: {},
    });

    const [playing, setPlaying] = useState<boolean>(true);

    interface ControlsLock {
        show: boolean;
        lock: boolean;
    }

    const [showControls, setShowControls] = useState<ControlsLock>({
        show: false,
        lock: false,
    });

    useEffect(() => {
        window.electron.ipcRenderer.invoke('get-impact', props.settings.selected_impact, props.settings.impact_folder_path).then((res:impact) => {
            setImpact(res);
            // get variables
            var flags:gameFlags = {}
            Object.keys(res.meta.flags).forEach(f => {
                flags[f] = getDefaultValue(res.meta.flags[f]);
            });
            setGameState({
                block: res.blocks[res.meta.start],
                currentVideo: res.blocks[res.meta.start].videos[0].path,
                flags: flags,
            })
        })
    }, []);

    function handleFlags(flags:gameFlags, flag:string, target:string) {
        // if flag is boolean, the value will either be "true", "false", or "flip"
        switch (typeof flags[flag]) {
            case "boolean":
                switch ((impact.blocks[target].flags as blockFlags)[flag]) {
                    case "true": 
                        flags[flag] = true;
                        break;
                    case "false":
                        flags[flag] = false;
                        break;
                    case "flip":
                        flags[flag] = !flags[flag];
                        break;
                }
                break;
            case "number":
                // if value ends in a "+" or "-", it is an operation, otherwise just assign the value
                switch ((impact.blocks[target].flags as blockFlags)[flag].slice(-1)) {
                    case "+":
                        flags[flag] = flags[flag] as number + parseInt((impact.blocks[target].flags as blockFlags)[flag].slice(0, -1));
                        break; 
                    case "-":
                        flags[flag] = flags[flag] as number - parseInt((impact.blocks[target].flags as blockFlags)[flag].slice(0, -1));
                        break;
                    default:
                        flags[flag] = parseInt((impact.blocks[target].flags as blockFlags)[flag]);
                        break;
                }
                break;
        }
    }

    const selectBlock = (target: blockTarget) => {
        setShowControls({
            show: false,
            lock: true, // lock the controls so they don't get put back up by handleOnProgress
        });
        // handle button flags
        var newFlags = gameState.flags;
        if (target.flags) {
            Object.keys(target.flags).forEach(flag => {
                handleFlags(newFlags, flag, target.target);
            });
        }
        // handle block flags
        // var newFlags = gameState.flags;
        if (impact.blocks[target.target].flags) {
            Object.keys(impact.blocks[target.target].flags as blockFlags).forEach(flag => {
                handleFlags(newFlags, flag, target.target);
            });
        }
        // wait 500 ms then change video
        setTimeout(() => {
            // figure out next video given block and flags

            // now that we know video, handle video flags
            
            // switch to new video
            console.log(newFlags);
            setGameState(() => ({
                flags: newFlags,
                block: impact.blocks[target.target],
                currentVideo: impact.blocks[target.target].videos[0].path, // this will be replaced with game logic
            }));
            setShowControls({
                show: false,
                lock: false,
            });
        }, 500)
    }

    const nextBlock = (target: string) => {
        // no need to lower/lock controls as they shouldn't be up
        // handle block flags
        var newFlags = gameState.flags;
        if (impact.blocks[target].flags) {
            Object.keys(impact.blocks[target].flags as blockFlags).forEach(flag => {
                handleFlags(newFlags, flag, target);
            });
        }
        // wait 500 ms then change video
        setTimeout(() => {
            // figure out next video given block and flags

            // now that we know video, handle video flags
            
            // switch to new video
            setGameState((prev) => ({
                ...prev,
                block: impact.blocks[target],
                currentVideo: impact.blocks[target].videos[0].path, // this will be replaced with game logic
            }));
        }, 500)
    }

    if (!impact) {
        return (
            <div>Impact was unable to be loaded from file.</div>
        )
    }

    const gamePlayer = useRef<ReactPlayer | null>(null);

    const handleOnEnded = () => {
        if (gameState.block.next) {
            nextBlock(gameState.block.next);
        } else if (gamePlayer.current) {
            var currentVideoTiming:blockTiming = {targets:-1, loop:-1,};
            gameState.block.videos.forEach(v => {
                if (v.path == gameState.currentVideo && v.timing) {
                    currentVideoTiming = v.timing;
                    return;
                }
            });
            // this is inconsistent
            console.log("video loops at " + currentVideoTiming.loop);
            gamePlayer.current.seekTo(0);
            gamePlayer.current.seekTo(currentVideoTiming.loop);
        } else {
            console.log("can't get player ref");
        }
    }

    interface progress {
        played: number,
        loaded: number,
        playedSeconds: number,
        loadedSeconds: number,
    }

    const gameControl = useRef<typeof GameControls | null>(null);

    const handleOnProgress = (e:progress) => {
        var currentVideoTiming:blockTiming = {targets:-1, loop:-1,};
        gameState.block.videos.forEach(v => {
            if (v.path == gameState.currentVideo && v.timing) {
                currentVideoTiming = v.timing;
                return;
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
    }

    switch (props.settings.player_theme) {
        case "classic":
            return(
                <div className = "gameRoot">
                    <div className = "gameHeader">
                        <div className = "gameTitlebar">
                            <div className = "gameTitling">
                                <div className = "gameTitle">
                                    {impact.info.game.toUpperCase()} / {impact.info.title.toUpperCase()}
                                </div>
                                <div className = "gameSubtitle">
                                    {impact.info.subtitle}
                                </div>
                            </div>
                            <Link to="/"><div className = "gameUser">
                                <div className = "gameUsername">
                                    {props.settings.username ? props.settings.username : "MAIN MENU"}
                                </div>
                                <div className = "gameUserclass">
                                    {props.settings.class ? props.settings.class : ""}
                                </div>
                            </div></Link>
                        </div>
                        <div className = "gameBody">
                            <div className = "gamePlayer">
                                <GameControls block={gameState.block} state={gameState} show={showControls.show} setter={selectBlock}></GameControls>
                                <ReactPlayer ref={gamePlayer} onEnded={handleOnEnded} onProgress={handleOnProgress} progressInterval={250} controls={false} playing={playing} url={"impact://" + gameState.currentVideo + "?path=" + props.settings.impact_folder_path + "&impact=" + props.settings.selected_impact} />
                            </div>
                        </div>
                        <div className = "gameControls">
                            <a onClick={() => {setPlaying(!playing)}}>{playing ? "Pause" : "Play"}</a>  ·  <a>Restart</a>  ·  Video playback problems? Just refresh the page. You won't lose your place. 
                        </div>
                    </div>
                    <div className = "gameFooter">
                        <div className = "gameFooterLeft">
                            <div className = "cdgLogo"></div>
                            <div className = "synydyneLogo"></div>
                        </div>
                        <div className = "gameFooterRight">
                            <div className = "gameTaC">Terms & Conditions&nbsp;&nbsp;</div>
                            <div>·&nbsp;&nbsp;©1995 Synydyne </div>
                        </div>
                    </div>
                </div>
            );
        default:
            return(
                <div>No theme selected. Click <Link to="/">HERE</Link> to return to main menu.</div>
            )
    }
}