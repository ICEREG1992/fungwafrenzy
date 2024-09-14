import React, { useState, useEffect, useRef } from 'react';
import { userSettings, userSave, impact, gameState, blockTiming } from './interfaces';
import GameControls from './GameControls';
import ReactPlayer from 'react-player'
import { Link } from 'react-router-dom';
import { getRandomValues } from 'crypto';

interface GameProps {
    settings:userSettings;
    save?:userSave;
}

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
            variables: [],
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
        variables: {},
    });

    const [showControls, setShowControls] = useState<boolean>(false);

    useEffect(() => {
        window.electron.ipcRenderer.invoke('get-impact', props.settings.selected_impact, props.settings.impact_folder_path).then((res:impact) => {
            setImpact(res);
            setGameState({
                block: res.blocks[res.meta.start],
                currentVideo: res.blocks[res.meta.start].videos[0].path,
                variables: {},
            })
        })
    }, []);

    const selectBlock = (target: string) => {
        console.log(target);
        console.log(impact.blocks[target]);
        setGameState((prev) => ({
            ...prev,
            block: impact.blocks[target],
            currentVideo: impact.blocks[target].videos[0].path,
        }));
        setShowControls(false);
    }

    if (!impact) {
        return (
            <div>Impact was unable to be loaded from file.</div>
        )
    }

    const gamePlayer = useRef<ReactPlayer | null>(null);

    const handleOnEnded = () => {
        if (gameState.block.next) {
            selectBlock(gameState.block.next);
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
            setShowControls(true);
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
                                <GameControls block={gameState.block} state={gameState} show={showControls} setter={selectBlock}></GameControls>
                                <ReactPlayer ref={gamePlayer} onEnded={handleOnEnded} onProgress={handleOnProgress} progressInterval={250} controls={false} playing={true} url={"impact://" + gameState.currentVideo + "?path=" + props.settings.impact_folder_path + "&impact=" + props.settings.selected_impact} />
                            </div>
                        </div>
                        <div className = "gameControls">
                            <a>Pause</a>  ·  <a>Restart</a>  ·  Video playback problems? Just refresh the page. You won't lose your place. 
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