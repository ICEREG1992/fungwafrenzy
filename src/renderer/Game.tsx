import React, { useState, useEffect } from 'react';
import { userSettings, userSave, impact } from './interfaces';
import ReactPlayer from 'react-player'
import { Link } from 'react-router-dom';
import { getRandomValues } from 'crypto';

interface GameProps {
    settings:userSettings;
    save?:userSave;
}

export default function Game(props:GameProps) {
    const [impact, setImpact] = useState<impact>();
    useEffect(() => {
        window.electron.ipcRenderer.invoke('get-impact', props.settings.selected_impact, props.settings.impact_folder_path).then((res) => {
            setImpact(res);
        })
    }, []);

    if (!impact) {
        return (
            <div>Impact was unable to be loaded from file.</div>
        )
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
                                <ReactPlayer controls={false} playing={true} url={"impact://" + impact.blocks[impact.meta.start].videos[0].path + "?path=" + props.settings.impact_folder_path + "&impact=" + props.settings.selected_impact}></ReactPlayer>
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