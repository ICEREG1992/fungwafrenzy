import { impactBlock, gameState, blockTarget } from './interfaces';

interface GameControlsProps {
    block:impactBlock;
    state:gameState;
    setter: (target: string) => void;
}

export default function GameControls(props:GameControlsProps) {
    return(
        <div className="gameOverlay">
            <div className="gameButtons">
                <Buttons block={props.block} state={props.state} setter={props.setter}></Buttons>
            </div>
        </div>
    );
}

interface ButtonsProps {
    block:impactBlock;
    state:gameState;
    setter: (target: string) => void;
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
        currentVideoTargets.forEach(element => {
            arr.push(
                <button className="gameButton" onClick={(event) => selectVideo(event, element.target, props.setter)}>{element.text}</button>
            )
        });
    } else {
        // return block targets
        console.log("returning block targets!");
        if (props.block.targets) {
            props.block.targets.forEach(element => {
                arr.push(
                    <button className="gameButton" onClick={(event) => selectVideo(event, element.target, props.setter)}>{element.text}</button>
                )
            });
        }
    }
    return arr;
}

const selectVideo = (event: React.MouseEvent<HTMLButtonElement>, target: string, setter: (name: string) => void) => {
    event.preventDefault();
    setter(target);
    return false;
}