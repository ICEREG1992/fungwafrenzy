import React, { useState, useEffect } from 'react';
import FrenzyNETHeader from './FrenzyNETHeader';
import { userSettings } from './interfaces';

interface BrowseProps {
    path: string;
    selectImpact: (name: string) => void;
}

export default function Browse(props:BrowseProps) {
    const [impacts, setImpacts] = useState<Array<Array<string>>>([]);
    useEffect(() => {
        window.electron.ipcRenderer.invoke('get-impacts', props.path).then((res) => {
            setImpacts(res);
        })
    }, []);
    return (
      <div>
        <FrenzyNETHeader nav page="browse impacts"/>
        <div id="body">
            <div className="NETcontainer">
                <Impacts impacts={impacts} selectImpact={props.selectImpact}></Impacts>
            </div>
        </div>
      </div>
    )
}

interface ImpactsProps {
    impacts: Array<Array<string>>;
    selectImpact: (name: string) => void;
}

function Impacts(props:ImpactsProps) {
    const arr: Array<JSX.Element> = [];
    if (props.impacts.length) {
        props.impacts.forEach((e: Array<string>) => {
            arr.push(
                <a onClick={(event) => selectImpact(event, e[0], props.selectImpact)}>
                    <div className="NETimpact">
                        {e[1] ? <img src={e[1]}></img> : <div className = "NETimpacttext">{e[0]}</div>}
                    </div>
                </a>
            )
        });
    }
    return arr;
}

const selectImpact = (event: React.MouseEvent<HTMLAnchorElement>, name: string, setter: (name: string) => void) => {
    event.preventDefault();
    setter(name);
    return false;
}