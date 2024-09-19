import React, { useState } from 'react';
import { impactBlock, gameState, blockTarget } from './interfaces';
import parse from 'html-react-parser';

interface GameControlsProps {
    block:impactBlock;
    state:gameState;
    show:boolean;
    setter: (target: blockTarget) => void;
}

export default function GameControls(props:GameControlsProps) {
    return(
        <div className="gameOverlay" style={(props.show && props.block.targets) ? {height: document.getElementsByClassName('gameButtons')[0].getBoundingClientRect().height} : {height: 0}}>
            <div className="gameButtons">
                <Buttons block={props.block} state={props.state} setter={props.setter}></Buttons>
            </div>
        </div>
    );
}

interface ButtonsProps {
    block:impactBlock;
    state:gameState;
    setter: (target: blockTarget) => void;
}

function Buttons(props:ButtonsProps) {
    const arr: Array<JSX.Element> = [];
    // get current video data
    var currentVideoTargets:Array<blockTarget> = [];
    props.block.videos.forEach(v => {
        if (v.path == props.state.currentVideo && v.targets) {
            currentVideoTargets = v.targets;
            return;
        }
    });
    if (currentVideoTargets.length != 0) {
        currentVideoTargets.forEach(t => {
            arr.push(
                <button className="gameButton" onClick={(event) => selectVideo(event, t, props.setter)}>{parse(t.text)}</button>
            )
        });
    } else {
        // return block targets
        if (props.block.targets) {
            props.block.targets.forEach(t => {
                arr.push(
                    <button className="gameButton" onClick={(event) => selectVideo(event, t, props.setter)}>{parse(t.text)}</button>
                )
            });
        }
    }
    return arr;
}

function stylizeText(s:string) {

}

const selectVideo = (event: React.MouseEvent<HTMLButtonElement>, target: blockTarget, setter: (name: blockTarget) => void) => {
    event.preventDefault();
    setter(target);
    return false;
}