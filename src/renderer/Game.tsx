import { userSettings, userSave } from './interfaces';
import ReactPlayer from 'react-player'
import { Link } from 'react-router-dom';

interface GameProps {
    settings:userSettings;
    save?:userSave;
}

export default function Game(props:GameProps) {
    switch (props.settings.player_theme) {
        case "classic":
            return(
                <div className = "gameRoot">
                    <div className = "gameHeader">
                        <div className = "gameTitlebar">
                            <div className = "gameTitling">
                                <div className = "gameTitle">
                                    BEAR STEARNS BRAVO / FIRST IMPACT
                                </div>
                                <div className = "gameSubtitle">
                                    LA Nights, Love of the City
                                </div>
                            </div>
                            <Link to="/"><div className = "gameUser">
                                <div className = "gameUsername">
                                    ICEREG1992
                                </div>
                                <div className = "gameUserclass">
                                    Regulator
                                </div>
                            </div></Link>
                        </div>
                        <div className = "gameBody">
                            <div className = "gamePlayer">
                                <ReactPlayer controls={true} playing={true} url={"impact://" + props.settings.selected_impact + "/" + "video" + "/" + "0101.mp4"}></ReactPlayer>
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