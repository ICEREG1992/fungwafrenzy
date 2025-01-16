import Draggable from 'react-draggable';
import React from 'react';
import { gameState, Impact } from './interfaces';
import { useSettingsStore } from '../hooks/useSettingsStore';

interface DebugPaneProps {
  impact: Impact;
  gameState: gameState;
  setGameState: React.Dispatch<React.SetStateAction<gameState>>;
}

export default function DebugPane(props: DebugPaneProps) {
  const { settings, updateSettings } = useSettingsStore();
  if (settings.debug) {
    return (
      <Draggable>
        <div className="debugPane">
          <div className="debugPaneTitle">
            <div className="left">Debug Pane</div>
            <div
              className="right"
              onClick={() => {
                updateSettings({ debug: false });
              }}
            >
              X
            </div>
          </div>
          <div className="debugPaneBody">
            <Chapters
              impact={props.impact}
              gameState={props.gameState}
              setGameState={props.setGameState}
            ></Chapters>
          </div>
        </div>
      </Draggable>
    );
  } else {
    return null;
  }
}

function Chapters(props: DebugPaneProps) {
  function skipToChapter(c: string, i: Impact, gs: gameState) {
    const block = i.blocks[c];
    if (block.next || block.videos[0].next) {
      props.setGameState({
        block,
        currentVideo: block.videos[0],
        playingMusic: block.videos[0].music
          ? i.music[block.videos[0].music].path
          : '',
        flags: gs.flags,
        seen: gs.seen,
      });
    } else if (block.targets || block.videos[0].targets) {
      props.setGameState({
        block,
        currentVideo: block.videos[0],
        playingMusic: block.videos[0].music
          ? i.music[block.videos[0].music].path
          : '',
        flags: gs.flags,
        seen: gs.seen,
      });
    }
  }

  const out: Array<React.JSX.Element> = [];
  if (props.impact.meta.chapters) {
    props.impact.meta.chapters.forEach((c: string) => {
      out.push(
        <div
          className="debugPaneLine"
          onClick={() => {
            skipToChapter(c, props.impact, props.gameState);
          }}
        >
          {c} ({props.impact.blocks[c].videos[0].title})
        </div>,
      );
    });
  }
  return out;
}
