import FrenzyNETHeader from './FrenzyNETHeader';
import { userSettings } from './interfaces';

interface OptionsProps {
    settings: userSettings;
}

export default function Options(props:OptionsProps) {
    return (
      <div>
        <FrenzyNETHeader nav page="options"/>
        <div id="body">
          <div className="NETcontainer">
            <div className="NETheader">
              GAME SETTINGS
            </div>
            <div className="NETbody">
              <div className = "NETline">
                <b>player_theme:</b> {props.settings.player_theme} <a>&lt;CHANGE&gt;</a>
              </div>
              <div className = "NETline">
                <b>impact_folder_path:</b> {props.settings.impact_folder_path} <a>&lt;CHANGE&gt;</a>
              </div>
              <div className = "NETline">
                <b>save_folder_path:</b> {props.settings.save_folder_path} <a>&lt;CHANGE&gt;</a>
              </div>
            </div>
            <div className="NETheader">
              VIDEO SETTINGS
            </div>
            <div className="NETbody">
              <div className = "NETline">
                <b>resolution:</b> {props.settings.resolution_x}x{props.settings.resolution_y} <a>&lt;CHANGE&gt;</a>
              </div>
              <div className = "NETline">
                <b>fullscreen:</b> {props.settings.fullscreen ? "ENABLED" : "DISABLED"} <a>&lt;CHANGE&gt;</a>
              </div>
            </div>
            <div className="NETheader">
              AUDIO SETTINGS
            </div>
            <div className="NETbody">
              <div className = "NETline">
                <b>volume_master:</b> {props.settings.volume_master} <a>&lt;CHANGE&gt;</a>
              </div>
              <div className = "NETline">
                <b>volume_video:</b> {props.settings.volume_video} <a>&lt;CHANGE&gt;</a>
              </div>
              <div className = "NETline">
                <b>volume_music:</b> {props.settings.volume_music} <a>&lt;CHANGE&gt;</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }