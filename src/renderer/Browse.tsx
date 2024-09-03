import React, { useState, useEffect } from 'react';
import FrenzyNETHeader from './FrenzyNETHeader';

interface BrowseProps {
    path: string;
}

export default function Browse(props:BrowseProps) {
    const [impacts, setImpacts] = useState<Array<String>>([]);
    useEffect(() => {
        window.electron.ipcRenderer.invoke('load-impacts', props.path).then((res) => {
            console.log(res);
            setImpacts(res);
        })
    }, []);
    return (
      <div>
        <FrenzyNETHeader nav page="browse impacts"/>
        <div id="body">
            <div className="NETcontainer">
                <Impacts impacts={impacts}></Impacts>
            </div>
        </div>
      </div>
    )
}

interface ImpactsProps {
    impacts: Array<String>;
}

function Impacts(props:ImpactsProps) {
    const arr: Array<JSX.Element> = [];
    console.log(props.impacts.length)
    props.impacts.forEach((e: String) => {
        arr.push(
            <div className="NETimpact">{e}</div>
        )
    });
    return arr;
}