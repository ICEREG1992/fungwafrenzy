import React, { useEffect, useRef, useState } from 'react';
import { NetModalState, SaveModalState } from './interfaces';
import { useSettingsStore } from '../hooks/useSettingsStore';

interface SaveModalProps {
  modalState: SaveModalState;
  setter: React.Dispatch<React.SetStateAction<SaveModalState>>;
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
          className="SaveModal"
          style={
            props.modalState.visible ? { opacity: '100%', display: 'flex' } : {}
          }
        >
          <div className="SaveModalContainer">
            <div className="SaveModalTitle">Save Before Leaving?</div>
            <div className="SaveModalDesc">
              Would you like to save your progress?
            </div>
            <div className="SaveModalButtons" style={{ justifyContent: 'end' }}>
              <a
                onClick={() => {
                  props.save();
                  props.exit();
                }}
              >
                <div>Save and Quit</div>
              </a>
              <a
                onClick={() => {
                  props.exit();
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
    case 'restart':
      return (
        <div
          className="SaveModal"
          style={
            props.modalState.visible ? { opacity: '100%', display: 'flex' } : {}
          }
        >
          <div className="SaveModalContainer">
            <div className="SaveModalTitle">Save Before Restarting?</div>
            <div className="SaveModalDesc">
              Would you like to save your progress?
            </div>
            <div className="SaveModalButtons" style={{ justifyContent: 'end' }}>
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
          className="SaveModal"
          style={
            props.modalState.visible ? { opacity: '100%', display: 'flex' } : {}
          }
        >
          <div className="SaveModalContainer">
            <div className="SaveModalTitle">Save Before Quitting?</div>
            <div className="SaveModalDesc">
              Would you like to save your progress?
            </div>
            <div className="SaveModalButtons" style={{ justifyContent: 'end' }}>
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
          className="SaveModal"
          style={
            props.modalState.visible ? { opacity: '100%', display: 'flex' } : {}
          }
        >
          <div className="SaveModalContainer">
            <div className="SaveModalTitle">Unexpected State Reached</div>
            <div className="SaveModalDesc">
              Something weird happened. Please let ICEREG1992 know. The buttons
              below should still work.
            </div>
            <div className="SaveModalButtons" style={{ justifyContent: 'end' }}>
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
