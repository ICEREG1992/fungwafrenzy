import React, { useEffect, useRef, useState } from 'react';

import { NetModalState, userSettings } from './interfaces';
import { useSettingsStore } from '../hooks/useSettingsStore';

interface NetModalProps {
  modalState: NetModalState;
  setter: React.Dispatch<React.SetStateAction<NetModalState>>;
}

export default function NetModal(props: NetModalProps) {
  const { settings, updateSettings } = useSettingsStore();
  const modalValue = useRef<HTMLInputElement>(null);
  const selectValue = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    if (modalValue.current) {
      modalValue.current.value =
        settings[props.modalState.value as keyof userSettings].toString();
    }
    if (selectValue.current) {
      selectValue.current.value =
        settings[props.modalState.value as keyof userSettings].toString();
    }
  }, [props.modalState.value]);

  function closeModal() {
    props.setter((prev) => ({
      ...prev,
      visible: false,
    }));
  }

  function changeSetting(s: string, v: string | number | boolean) {
    updateSettings({
      ...settings,
      [s]: v,
    });
    closeModal();
  }

  switch (props.modalState.input) {
    case 'text':
      return (
        <div
          className="NETmodal"
          style={
            props.modalState.visible ? { opacity: '100%', display: 'flex' } : {}
          }
        >
          <div className="NETmodalcontainer">
            <div className="NETmodaltitle">{props.modalState.title}</div>
            <div className="NETmodaldesc">{props.modalState.desc}</div>
            <div className="NETmodalinput">
              <input
                type="text"
                id="NETmodalvalue"
                ref={modalValue}
                defaultValue={
                  settings[
                    props.modalState.value as keyof userSettings
                  ] as string
                }
              ></input>
            </div>
            <div className="NETmodalbuttons">
              <a onClick={closeModal}>
                <div>× CANCEL</div>
              </a>
              <a
                className="purple"
                onClick={() => {
                  const value = document.getElementById(
                    'NETmodalvalue',
                  ) as HTMLInputElement;
                  changeSetting(props.modalState.value, value.value);
                }}
              >
                <div>{props.modalState.button}</div>
              </a>
            </div>
          </div>
        </div>
      );
    case 'number':
      return (
        <div
          className="NETmodal"
          style={
            props.modalState.visible ? { opacity: '100%', display: 'flex' } : {}
          }
        >
          <div className="NETmodalcontainer">
            <div className="NETmodaltitle">{props.modalState.title}</div>
            <div className="NETmodaldesc">{props.modalState.desc}</div>
            <div className="NETmodalinput">
              <input
                type="number"
                id="NETmodalvalue"
                ref={modalValue}
                defaultValue={
                  settings[
                    props.modalState.value as keyof userSettings
                  ] as string
                }
              ></input>
            </div>
            <div className="NETmodalbuttons">
              <a onClick={closeModal}>
                <div>× CANCEL</div>
              </a>
              <a
                className="purple"
                onClick={() => {
                  const value = document.getElementById(
                    'NETmodalvalue',
                  ) as HTMLInputElement;
                  changeSetting(props.modalState.value, parseInt(value.value));
                }}
              >
                <div>{props.modalState.button}</div>
              </a>
            </div>
          </div>
        </div>
      );
    case 'dropdown':
      let dropdown;
      switch (props.modalState.value) {
        case 'class':
          dropdown = classDropdown;
          break;
        case 'location':
          dropdown = locationDropdown;
          break;
        case 'player_theme':
          dropdown = themeDropdown;
          break;
        default:
          dropdown = defaultDropdown;
          break;
      }
      return (
        <div
          className="NETmodal"
          style={
            props.modalState.visible ? { opacity: '100%', display: 'flex' } : {}
          }
        >
          <div className="NETmodalcontainer">
            <div className="NETmodaltitle">{props.modalState.title}</div>
            <div className="NETmodaldesc">{props.modalState.desc}</div>
            <div className="NETmodalinput">
              <select
                id="NETmodalvalue"
                ref={selectValue}
                defaultValue={
                  settings[
                    props.modalState.value as keyof userSettings
                  ] as string
                }
              >
                {dropdown.map((option: dropdownOption) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="NETmodalbuttons">
              <a onClick={closeModal}>
                <div>× CANCEL</div>
              </a>
              <a
                className="purple"
                onClick={() => {
                  const value = document.getElementById(
                    'NETmodalvalue',
                  ) as HTMLInputElement;
                  changeSetting(props.modalState.value, value.value);
                }}
              >
                <div>{props.modalState.button}</div>
              </a>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

interface dropdownOption {
  value: string;
  label: string;
}

const defaultDropdown: dropdownOption[] = [{ value: 'NONE', label: 'NONE' }];

const themeDropdown: dropdownOption[] = [
  { value: 'classic', label: 'classic' },
];

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
];
