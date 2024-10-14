import FrenzyNETHeader from './FrenzyNETHeader';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { userSettings, modalState } from './interfaces';

interface SettingsProps {
  settings: userSettings;
  setter: (value: React.SetStateAction<userSettings>) => void;
}

export default function Settings(props:SettingsProps) {
  
  const [modalState, setModalState] = useState<modalState>({
    title:"TEST",
    desc:"Testing modal state.",
    input:"textarea",
    button:"Confirm test",
    value:"null",
    visible: false,
  });

  function closeModal() {
    setModalState((prev) => ({
      ...prev,
      visible: false,
    }));
  }

  function changeSetting(s:string, v:string) {
    props.setter((prev) => ({
      ...prev,
      [s]: v
    }));
    closeModal();
  }

  function changePath(v:string, p:string) {
    window.electron.ipcRenderer.invoke('select-path', p).then((res) => {
      if (res) {
        props.setter((prev) => ({
          ...prev,
          [v]: res,
        }));
      }
    });
  }

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
              <b>selected_impact:</b> {props.settings.selected_impact ? props.settings.selected_impact : "NONE"} <Link to="/browse" tabIndex={-1}><a>&lt;CHANGE&gt;</a></Link>
            </div>
            <div className = "NETline">
              <b>player_theme:</b> {props.settings.player_theme} <a onClick={() => setModalState({
                title: "Change Theme",
                desc: "Change the FWF player theme.",
                input: "dropdown",
                button: "✓ CHANGE THEME",
                value:"player_theme",
                visible: true,
              })}>&lt;CHANGE&gt;</a>
            </div>
            <div className = "NETline">
              <b>impact_folder_path:</b> {props.settings.impact_folder_path} <a onClick={() => changePath("impact_folder_path", props.settings.impact_folder_path)}>&lt;CHANGE&gt;</a>
            </div>
            <div className = "NETline">
              <b>save_folder_path:</b> {props.settings.save_folder_path} <a onClick={() => changePath("save_folder_path", props.settings.save_folder_path)}>&lt;CHANGE&gt;</a>
            </div>
          </div>
          <div className="NETheader">
            USER SETTINGS
          </div>
          <div className="NETbody">
            <div className = "NETline">
              <b>username:</b> {props.settings.username ? props.settings.username : "NONE"} <a onClick={() => setModalState({
                title: "Change Username",
                desc: "Change displayed username when using Classic theme.",
                input: "text",
                button: "✓ CHANGE USERNAME",
                value:"username",
                visible: true,
              })}>&lt;CHANGE&gt;</a>
            </div>
            <div className = "NETline">
              <b>class:</b> {props.settings.class ? props.settings.class : "NONE"} <a onClick={() => setModalState({
                title: "Change Class",
                desc: "Change your user class when using Classic theme.",
                input: "dropdown",
                button: "✓ CHANGE CLASS",
                value:"class",
                visible: true,
              })}>&lt;CHANGE&gt;</a>
            </div>
            <div className = "NETline">
              <b>location:</b> {props.settings.location ? props.settings.location : "NONE"} <a onClick={() => setModalState({
                title: "Change Location",
                desc: "Change your user location for certain location-based game effects.",
                input: "dropdown",
                button: "✓ CHANGE LOCATION",
                value:"location",
                visible: true,
              })}>&lt;CHANGE&gt;</a>
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
              <b>volume_master:</b> {props.settings.volume_master} <a onClick={() => setModalState({
                title: "Change Master Volume",
                input: "number",
                button: "✓ CHANGE MASTER VOLUME",
                value:"volume_master",
                visible: true,
              })}>&lt;CHANGE&gt;</a>
            </div>
            <div className = "NETline">
              <b>volume_video:</b> {props.settings.volume_video} <a onClick={() => setModalState({
                title: "Change Video Volume",
                input: "number",
                button: "✓ CHANGE VIDEO VOLUME",
                value:"volume_video",
                visible: true,
              })}>&lt;CHANGE&gt;</a>
            </div>
            <div className = "NETline">
              <b>volume_music:</b> {props.settings.volume_music} <a onClick={() => setModalState({
                title: "Change Music Volume",
                input: "number",
                button: "✓ CHANGE MUSIC VOLUME",
                value:"volume_music",
                visible: true,
              })}>&lt;CHANGE&gt;</a>
            </div>
          </div>
        </div>
      </div>
      <NetModal modalState={modalState} setter={changeSetting} close={closeModal} curr={props.settings}></NetModal>
    </div>
  )
}

interface ModalProps {
  modalState: modalState,
  curr: userSettings,
  setter:(s: string, v: string) => void,
  close:() => void,
}

function NetModal(props:ModalProps) {
  switch (props.modalState.input) {
    case "text":
      return (
        <div className="NETmodal" style={props.modalState.visible ? {opacity: "100%", display: "flex"} : {}}>
          <div className="NETmodalcontainer">
            <div className="NETmodaltitle">{props.modalState.title}</div>
            <div className="NETmodaldesc">{props.modalState.desc}</div>
            <div className="NETmodalinput">
              <input type="text" id="NETmodalvalue" defaultValue={props.curr[props.modalState.value as keyof userSettings] as string}></input>
            </div>
            <div className="NETmodalbuttons">
              <a onClick={props.close}>
                <div>× CANCEL</div>
              </a>
              <a className="purple" onClick={() => {
                const value = document.getElementById("NETmodalvalue") as HTMLInputElement;
                props.setter(props.modalState.value, value.value)}}>
                <div>{props.modalState.button}</div>
              </a>
            </div>
          </div>
        </div>
      )
    case "number":
      return (
        <div className="NETmodal" style={props.modalState.visible ? {opacity: "100%", display: "flex"} : {}}>
          <div className="NETmodalcontainer">
            <div className="NETmodaltitle">{props.modalState.title}</div>
            <div className="NETmodaldesc">{props.modalState.desc}</div>
            <div className="NETmodalinput">
              <input type="number" id="NETmodalvalue" defaultValue={props.curr[props.modalState.value as keyof userSettings] as string}></input>
            </div>
            <div className="NETmodalbuttons">
              <a onClick={props.close}>
                <div>× CANCEL</div>
              </a>
              <a className="purple" onClick={() => {
                const value = document.getElementById("NETmodalvalue") as HTMLInputElement;
                props.setter(props.modalState.value, value.value)}}>
                <div>{props.modalState.button}</div>
              </a>
            </div>
          </div>
        </div>
      )
    case "dropdown":
      var dropdown;
      switch (props.modalState.value) {
        case "class":
          dropdown = classDropdown;
          break;
        case "location":
          dropdown = locationDropdown;
          break;
        case "player_theme":
          dropdown = themeDropdown;
          break;
        default:
          dropdown = defaultDropdown;
          break;
      }
      return (
        <div className="NETmodal" style={props.modalState.visible ? {opacity: "100%", display: "flex"} : {}}>
          <div className="NETmodalcontainer">
            <div className="NETmodaltitle">{props.modalState.title}</div>
            <div className="NETmodaldesc">{props.modalState.desc}</div>
            <div className="NETmodalinput">
              <select id="NETmodalvalue" defaultValue={props.curr[props.modalState.value as keyof userSettings] as string}>
                {dropdown.map((option: dropdownOption) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="NETmodalbuttons">
              <a onClick={props.close}>
                <div>× CANCEL</div>
              </a>
              <a className="purple" onClick={() => {
                const value = document.getElementById("NETmodalvalue") as HTMLInputElement;
                props.setter(props.modalState.value, value.value)}}>
                <div>{props.modalState.button}</div>
              </a>
            </div>
          </div>
        </div>
      )

  } 
}

interface dropdownOption {
  value: string,
  label: string,
}

const defaultDropdown: dropdownOption[] = [
  { value: 'NONE', label: 'NONE' },
]

const themeDropdown: dropdownOption[] = [
  { value: 'classic', label: 'classic' },
]

const classDropdown: dropdownOption[] = [
  { value: 'NONE', label: 'NONE' },
  { value: '#', label: 'Regulator' },
  { value: '$', label: 'Banker' },
  { value: '*', label: 'Senator' },
];

const locationDropdown: dropdownOption[] = [
  { value: 'NONE', label: 'NONE' },
  { value: 'AL', label: 'AL' },
  { value: 'AK', label: 'AK' },
  { value: 'AZ', label: 'AZ' },
  { value: 'AR', label: 'AR' },
  { value: 'CA', label: 'CA' },
  { value: 'CO', label: 'CO' },
  { value: 'CT', label: 'CT' },
  { value: 'DE', label: 'DE' },
  { value: 'FL', label: 'FL' },
  { value: 'GA', label: 'GA' },
  { value: 'HI', label: 'HI' },
  { value: 'ID', label: 'ID' },
  { value: 'IL', label: 'IL' },
  { value: 'IN', label: 'IN' },
  { value: 'IA', label: 'IA' },
  { value: 'KS', label: 'KS' },
  { value: 'KY', label: 'KY' },
  { value: 'LA', label: 'LA' },
  { value: 'ME', label: 'ME' },
  { value: 'MD', label: 'MD' },
  { value: 'MA', label: 'MA' },
  { value: 'MI', label: 'MI' },
  { value: 'MN', label: 'MN' },
  { value: 'MS', label: 'MS' },
  { value: 'MO', label: 'MO' },
  { value: 'MT', label: 'MT' },
  { value: 'NE', label: 'NE' },
  { value: 'NV', label: 'NV' },
  { value: 'NH', label: 'NH' },
  { value: 'NJ', label: 'NJ' },
  { value: 'NM', label: 'NM' },
  { value: 'NY', label: 'NY' },
  { value: 'NC', label: 'NC' },
  { value: 'ND', label: 'ND' },
  { value: 'OH', label: 'OH' },
  { value: 'OK', label: 'OK' },
  { value: 'OR', label: 'OR' },
  { value: 'PA', label: 'PA' },
  { value: 'RI', label: 'RI' },
  { value: 'SC', label: 'SC' },
  { value: 'SD', label: 'SD' },
  { value: 'TN', label: 'TN' },
  { value: 'TX', label: 'TX' },
  { value: 'UT', label: 'UT' },
  { value: 'VT', label: 'VT' },
  { value: 'VA', label: 'VA' },
  { value: 'WA', label: 'WA' },
  { value: 'WV', label: 'WV' },
  { value: 'WI', label: 'WI' },
  { value: 'WY', label: 'WY' },
]