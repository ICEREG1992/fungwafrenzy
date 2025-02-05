import React, { useEffect, useRef, useState } from 'react';
import { NetModalState, ModalState } from './interfaces';
import { useSettingsStore } from '../hooks/useSettingsStore';

interface SaveModalProps {
  modalState: ModalState;
  setter: React.Dispatch<React.SetStateAction<ModalState>>;
  save: () => void;
  restart: () => void;
  exit: () => void;
}

export default function NetModal(props: SaveModalProps) {
  function closeModal() {
    props.setter((prev) => ({
      ...prev,
      type: 'quit',
      visible: false,
    }));
  }

  switch (props.modalState.type) {
    case 'menu':
      return (
        <div
          className="Modal"
          style={
            props.modalState.visible ? { opacity: '100%', display: 'flex' } : {}
          }
        >
          <div className="ModalContainer">
            <div className="ModalTitle">Return to Main Menu</div>
            <div className="ModalDesc">
              Would you like to save your progress?
            </div>
            <div className="ModalButtons" style={{ justifyContent: 'end' }}>
              <a
                onClick={() => {
                  props.save();
                  props.exit();
                }}
              >
                <div>Save and Exit</div>
              </a>
              <a
                onClick={() => {
                  props.exit();
                }}
              >
                <div>Exit Without Saving</div>
              </a>
              <a
                className="purple"
                onClick={() => {
                  closeModal();
                  window.electron.ipcRenderer.sendMessage('block-close');
                }}
              >
                <div>Cancel</div>
              </a>
            </div>
          </div>
        </div>
      );
    case 'restart':
      return (
        <div
          className="Modal"
          style={
            props.modalState.visible ? { opacity: '100%', display: 'flex' } : {}
          }
        >
          <div className="ModalContainer">
            <div className="ModalTitle">Restart Impact</div>
            <div className="ModalDesc">
              Would you like to save your progress before returning to the
              beginning of the Impact?
            </div>
            <div className="ModalButtons" style={{ justifyContent: 'end' }}>
              <a
                onClick={() => {
                  props.save();
                  props.restart();
                }}
              >
                <div>Save and Restart</div>
              </a>
              <a
                onClick={() => {
                  props.restart();
                  closeModal();
                }}
              >
                <div>Restart Without Saving</div>
              </a>
              <a
                className="purple"
                onClick={() => {
                  closeModal();
                  window.electron.ipcRenderer.sendMessage('block-close');
                }}
              >
                <div>Cancel</div>
              </a>
            </div>
          </div>
        </div>
      );
    case 'quit':
      return (
        <div
          className="Modal"
          style={
            props.modalState.visible ? { opacity: '100%', display: 'flex' } : {}
          }
        >
          <div className="ModalContainer">
            <div className="ModalTitle">Quit Game</div>
            <div className="ModalDesc">
              Would you like to save your progress?
            </div>
            <div className="ModalButtons" style={{ justifyContent: 'end' }}>
              <a
                onClick={() => {
                  props.save();
                  window.electron.ipcRenderer.sendMessage('close-app');
                }}
              >
                <div>Save and Quit</div>
              </a>
              <a
                onClick={() => {
                  window.electron.ipcRenderer.sendMessage('close-app');
                }}
              >
                <div>Quit Without Saving</div>
              </a>
              <a
                className="purple"
                onClick={() => {
                  closeModal();
                  window.electron.ipcRenderer.sendMessage('block-close');
                }}
              >
                <div>Cancel</div>
              </a>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div
          className="Modal"
          style={
            props.modalState.visible ? { opacity: '100%', display: 'flex' } : {}
          }
        >
          <div className="ModalContainer">
            <div className="ModalTitle">Unexpected State Reached</div>
            <div className="ModalDesc">
              Something weird happened. Please let ICEREG1992 know. The buttons
              below should still work.
            </div>
            <div className="ModalButtons" style={{ justifyContent: 'end' }}>
              <a
                onClick={() => {
                  window.electron.ipcRenderer.sendMessage('save-savedata');
                  window.electron.ipcRenderer.sendMessage('close-app');
                }}
              >
                <div>Save and Quit</div>
              </a>
              <a
                onClick={() => {
                  window.electron.ipcRenderer.sendMessage('close-app');
                }}
              >
                <div>Quit Without Saving</div>
              </a>
              <a
                className="purple"
                onClick={() => {
                  closeModal();
                  window.electron.ipcRenderer.sendMessage('block-close');
                }}
              >
                <div>Cancel</div>
              </a>
            </div>
          </div>
        </div>
      );
  }
}
