import React, { useState, useEffect, useRef } from 'react';
import { userSettings, impact, impactBlock, gameState, blockTiming, gameFlags, blockFlags, blockTarget, blockVideo, blockCondition } from './interfaces';
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
        seen: [],
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
            setGameState((prev:gameState) => ({
                ...prev,
                seen: [...prev.seen, res.meta.start, res.meta.start+"_"+res.blocks[res.meta.start].videos[0].path],
                block: res.blocks[res.meta.start],
                currentVideo: res.blocks[res.meta.start].videos[0].path,
                flags: flags,
            }));
        })
    }, []);

    /*
        Alters the state of our gameFlags according to a certain object's (block, target, or video) flags
        out: the current state of flags for this session
        flags: the flags for the intended object
    */
    function handleFlags(out:gameFlags, flags:blockFlags) {
        Object.keys(flags).forEach(flag => {
            // if flag is boolean, the value will either be "true", "false", or "flip"
            switch (typeof out[flag]) {
                case "boolean":
                    switch (flags[flag]) {
                        case "true": 
                            out[flag] = true;
                            break;
                        case "false":
                            out[flag] = false;
                            break;
                        case "flip":
                            out[flag] = !out[flag];
                            break;
                    }
                    break;
                case "number":
                    // if value ends in a "+" or "-", it is an operation, otherwise just assign the value
                    switch (flags[flag].slice(-1)) {
                        case "+":
                            out[flag] = out[flag] as number + parseInt(flags[flag].slice(0, -1));
                            break; 
                        case "-":
                            out[flag] = out[flag] as number - parseInt(flags[flag].slice(0, -1));
                            break;
                        default:
                            out[flag] = parseInt(flags[flag]);
                            break;
                    }
                    break;
            }
        });
    }

    function handleSelect(gameState:gameState, block:impactBlock) {
        // figure out if this is a chance block or a condition block
        if (block.videos[0].chance) {
            // if it is chance, make one chance calculation and run it against each video until it hits
            const rand = Math.random();
            var sum = 0;
            var selectedVideo = block.videos[0];
            block.videos.some(video => {
                sum += video.chance as number; // assert this exists always because the first video specifies chance
                if (rand <= sum) {
                    selectedVideo = video;
                    return true;
                }
            });
            return selectedVideo;
        } else {
            if (block.videos[0].conditions) {
                // this is now a flag check, watched check, time check, or location check
                // todo: logic here
                return block.videos[0];
            } else {
                // no chance or condition, return the first video in the set
                return block.videos[0];
            }
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
            handleFlags(newFlags, target.flags);
        }
        // handle block flags
        if (impact.blocks[target.target].flags) {
            handleFlags(newFlags, impact.blocks[target.target].flags as blockFlags);
        }
        // wait 500 ms then change video
        setTimeout(() => {
            // figure out next video given block and flags
            const nextVideo = handleSelect(gameState, impact.blocks[target.target]);
            // now that we know video, handle video flags
            if (nextVideo.flags) {
                handleFlags(newFlags, nextVideo.flags)
            }
            // switch to new video
            console.log(newFlags);
            setGameState((prev) => ({
                ...prev,
                seen: [...prev.seen, target.target, target.target+"_"+nextVideo.path],
                flags: newFlags,
                block: impact.blocks[target.target],
                currentVideo: nextVideo.path, // this will be replaced with game logic
            }));
            console.log(gameState.seen);
            setShowControls({
                show: false,
                lock: false,
            });
        }, 500)
    }

    const nextBlock = (target: string) => {
        // no need to lower/lock controls as they shouldn't be up
        // no need to handle target flags because there are no targets
        // handle block flags
        var newFlags = gameState.flags;
        if (impact.blocks[target].flags) {
            handleFlags(newFlags, impact.blocks[target].flags);
        }
        // wait 500 ms then change video
        setTimeout(() => {
            // figure out next video given block and flags
            const nextVideo = handleSelect(gameState, impact.blocks[target]);
            // now that we know video, handle video flags
            if (nextVideo.flags) {
                handleFlags(newFlags, nextVideo.flags)
            }
            // switch to new video
            setGameState((prev) => ({
                ...prev,
                seen: [...prev.seen, target, target+"_"+impact.blocks[target].videos[0].path],
                block: impact.blocks[target],
                currentVideo: impact.blocks[target].videos[0].path, // this will be replaced with game logic
            }));
            setShowControls({
                show: false,
                lock: false,
            });
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