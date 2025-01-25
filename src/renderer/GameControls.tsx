import React, { useEffect, useRef, useState } from 'react';
import parse from 'html-react-parser';
import { useSettingsStore } from '../hooks/useSettingsStore';
import { impactBlock, gameState, blockTarget } from './interfaces';

interface GameControlsProps {
  state: gameState;
  show: boolean;
  setter: (target: blockTarget) => void;
}

export default function GameControls(props: GameControlsProps) {
  const { settings, setSettings } = useSettingsStore();
  const gameButtons = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);
  useEffect(() => {
    if (
      gameButtons.current &&
      props.show &&
      (props.state.block.targets || props.state.currentVideo.targets)
    ) {
      setHeight(gameButtons.current.getBoundingClientRect().height);
    } else {
      setHeight(0);
    }
  }, [props]);
  return (
    <div className={`gameOverlay ${settings.player_theme}`} style={{ height }}>
      <div className="gameOverlayBorder"></div>
      <div className="gameButtons" ref={gameButtons}>
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
