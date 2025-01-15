import React, { useRef, useState, forwardRef } from 'react';
import { ModalState } from './interfaces';

interface PopupMenuProps {
  modalSetter: React.Dispatch<React.SetStateAction<ModalState>>;
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  exit: () => void;
  restart: () => void;
  save: () => void;
  skipRef: React.RefObject<HTMLDivElement>;
  skip: () => void;
}

const GameSkip = forwardRef<HTMLDivElement, { skip: () => void }>(
  (props, ref) => {
    return (
      <div
        className="gamePopupMiddleRightButton gamePopupButton"
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          props.skip();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          fill="currentColor"
          className="bi bi-arrow-right-circle"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"
          />
        </svg>
      </div>
    );
  },
);

export default function PopupMenu(props: PopupMenuProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseMove = () => {
    // Clear the existing timeout to reset the timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set visible to true
    setVisible(true);

    // Start a new timeout to set visible to false after 3 seconds
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 2000);
  };

  const handleMouseOut = () => {
    if (timeoutRef.current && props.playing) {
      clearTimeout(timeoutRef.current);
      setVisible(false);
    }
  };

  return (
    <div
      className="gamePopupMenu"
      onMouseOut={handleMouseOut}
      onMouseMove={handleMouseMove}
      style={visible ? { opacity: 1 } : { opacity: 0 }}
      onClick={() => {
        props.setPlaying((prev) => {
          return !prev;
        });
      }}
    >
      <div className="gamePopupTop">
        <div className="gamePopupTopLeft">
          <div
            className="gamePopupLeftButton gamePopupButton"
            onClick={(e) => {
              e.stopPropagation();
              props.exit();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              fill="currentColor"
              className="bi bi-box-arrow-left"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"
              />
              <path
                fillRule="evenodd"
                d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"
              />
            </svg>
          </div>
          <div
            className="gamePopupLeftButton gamePopupButton"
            onClick={(e) => {
              e.stopPropagation();
              props.restart();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              fill="currentColor"
              className="bi bi-arrow-counterclockwise"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"
              />
              <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466" />
            </svg>
          </div>
        </div>
        <div
          className="gamePopupRightButton gamePopupButton"
          onClick={(e) => {
            e.stopPropagation();
            props.save();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="42"
            height="42"
            fill="currentColor"
            className="bi bi-floppy2-fill"
            viewBox="0 0 16 16"
          >
            <path d="M12 2h-2v3h2z" />
            <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5V2.914a1.5 1.5 0 0 0-.44-1.06L14.147.439A1.5 1.5 0 0 0 13.086 0zM4 6a1 1 0 0 1-1-1V1h10v4a1 1 0 0 1-1 1zM3 9h10a1 1 0 0 1 1 1v5H2v-5a1 1 0 0 1 1-1" />
          </svg>
        </div>
      </div>
      <div className="gamePopupMiddle">
        <div
          className="gamePopupMiddleButton gamePopupButton"
          style={props.playing ? { opacity: 0 } : { opacity: 1 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="112"
            height="112"
            fill="currentColor"
            className="bi bi-pause"
            viewBox="0 0 16 16"
          >
            <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5" />
          </svg>
        </div>
        <GameSkip ref={props.skipRef} skip={props.skip}></GameSkip>
      </div>
      <div className="gamePopupBottom"></div>
    </div>
  );
}
