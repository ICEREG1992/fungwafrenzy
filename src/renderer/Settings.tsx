import FrenzyNETHeader from './FrenzyNETHeader';
import { userSettings } from './interfaces';

interface SettingsProps {
  settings: userSettings;
}

export default function Settings(props:SettingsProps) {
  console.log(props.settings)
  return (
    <div className="menuroot">
      <FrenzyNETHeader nav page="settings"/>
      <div id="body">
        <div className="NETcontainer">
          <div className="NETheader">
            GAME SETTINGS
          </div>
          <div className="NETbody">
            <div className = "NETline">
              <b>selected_impact:</b> {props.settings.selected_impact ? props.settings.selected_impact : "NONE"} <a>&lt;CHANGE&gt;</a>
            </div>
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
            USER SETTINGS
          </div>
          <div className="NETbody">
            <div className = "NETline">
              <b>username:</b> {props.settings.username ? props.settings.username : "NONE"} <a>&lt;CHANGE&gt;</a>
            </div>
            <div className = "NETline">
              <b>class:</b> {props.settings.class ? props.settings.class : "NONE"} <a>&lt;CHANGE&gt;</a>
            </div>
            <div className = "NETline">
              <b>location:</b> {props.settings.location ? props.settings.location : "NONE"} <a>&lt;CHANGE&gt;</a>
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