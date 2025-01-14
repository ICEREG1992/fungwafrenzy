import { css } from '@emotion/react';
import { useSettingsStore } from '../hooks/useSettingsStore';
import React, { useState } from 'react';
import parse from 'html-react-parser';
import { impactBlock, gameState, blockTarget } from './interfaces';

interface GameControlsProps {
  state: gameState;
  show: boolean;
  setter: (target: blockTarget) => void;
}

export default function GameControls(props: GameControlsProps) {
  const { settings, setSettings } = useSettingsStore();

  const gameOverlayStyle = css`
    left: ${settings.player_theme === "large" ? "320px" : ""};
    border-radius: ${settings.player_theme === "large" ? "12px 12px 0px 0px" : ""};
  `

  return (
    <div
      className="gameOverlay"
      css={gameOverlayStyle}
      style={
        props.show &&
        (props.state.block.targets || props.state.currentVideo.targets)
          ? {
              height: document
                .getElementsByClassName('gameButtons')[0]
                .getBoundingClientRect().height,
            }
          : { height: 0 }
      }
    >
      <div className="gameOverlayBorder"></div>
      <div className="gameButtons">
        <Buttons state={props.state} setter={props.setter}></Buttons>
      </div>
    </div>
  );
}

interface ButtonsProps {
  state: gameState;
  setter: (target: blockTarget) => void;
}
function Buttons(props: ButtonsProps) {
  const arr: Array<React.JSX.Element> = [];
  // add question
  if (props.state.currentVideo.question) {
    arr.push(
      <div className="gameQuestion">
        {parse(props.state.currentVideo.question)}
      </div>,
    );
  }
  // add targets
  if (props.state.currentVideo.targets) {
    props.state.currentVideo.targets.forEach((t) => {
      arr.push(
        <button
          className="gameButton"
          onClick={(event) => selectVideo(event, t, props.setter)}
        >
          {parse(t.text)}
        </button>,
      );
    });
  } else {
    // return block targets
    if (props.state.block.targets) {
      props.state.block.targets.forEach((t) => {
        arr.push(
          <button
            className="gameButton"
            onClick={(event) => selectVideo(event, t, props.setter)}
          >
            {parse(t.text)}
          </button>,
        );
      });
    }
  }
  return arr;
}

const selectVideo = (
  event: React.MouseEvent<HTMLButtonElement>,
  target: blockTarget,
  setter: (name: blockTarget) => void,
) => {
  event.preventDefault();
  setter(target);
  return false;
};
