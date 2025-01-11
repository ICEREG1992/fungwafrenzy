import React, { useEffect, useRef, useState } from 'react';
import { NetModalState, ModalState } from './interfaces';
import { useSettingsStore } from '../hooks/useSettingsStore';

interface MenuModalProps {
  modalState: ModalState;
  setter: React.Dispatch<React.SetStateAction<ModalState>>;
  loadImpact: () => void;
  loadSave: () => void;
  start: () => void;
  continue: () => void;
}

export default function MenuModal(props: MenuModalProps) {
  function closeModal() {
    props.setter((prev) => ({
      ...prev,
      type: 'quit',
      visible: false,
    }));
  }

  switch (props.modalState.type) {
    case 'start':
      return (
        <div
          className="Modal"
          style={
            props.modalState.visible ? { opacity: '100%', display: 'flex' } : {}
          }
        >
          <div className="ModalContainer">
            <div className="ModalTitle">Impact Not Selected</div>
            <div className="ModalDesc">
              You haven&apos;t selected an Impact yet. Would you like to select
              an Impact to play?
            </div>
            <div className="ModalButtons" style={{ justifyContent: 'end' }}>
              <a
                onClick={() => {
                  props.loadImpact();
                }}
              >
                <div>Select Impact</div>
              </a>
              <a
                onClick={() => {
                  props.start();
                }}
              >
                <div>Continue Anyway</div>
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
    case 'continue':
      return (
        <div
          className="Modal"
          style={
            props.modalState.visible ? { opacity: '100%', display: 'flex' } : {}
          }
        >
          <div className="ModalContainer">
            <div className="ModalTitle">Save Not Selected</div>
            <div className="ModalDesc">
              You haven&apos;t selected a save file yet. Would you like to
              select a save file to load?
            </div>
            <div className="ModalButtons" style={{ justifyContent: 'end' }}>
              <a
                onClick={() => {
                  props.loadSave();
                }}
              >
                <div>Select Save</div>
              </a>
              <a
                onClick={() => {
                  props.continue();
                }}
              >
                <div>Continue Anyway</div>
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
                  props.loadImpact();
                }}
              >
                <div>Select Impact</div>
              </a>
              <a
                onClick={() => {
                  props.start();
                }}
              >
                <div>Continue Anyway</div>
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
