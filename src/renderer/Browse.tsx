import React, { useState, useEffect } from 'react';
import FrenzyNETHeader from './FrenzyNETHeader';
import { userSettings } from './interfaces';

interface BrowseProps {
  path: string;
  selectImpact: (name: string) => void;
}

interface Impact {
  key: string;
  image: string;
}

export default function Browse(props: BrowseProps) {
  const openFolder = () => {
    console.log('clicked');
    window.electron.ipcRenderer.sendMessage('open-impacts-path', props.path);
  };

  const [impacts, setImpacts] = useState<Array<Impact>>([]);
  useEffect(() => {
    window.electron.ipcRenderer
      .invoke('get-impacts', props.path)
      .then((res) => {
        setImpacts(res);
        return res;
      })
      .catch((err) => {
        console.error('Failed to get impacts:', err);
      });
  }, [props.path]);
  return (
    <div className="menuroot">
      <FrenzyNETHeader nav page="browse impacts" />
      <div id="body">
        <div className="NETcontainer center">
          <Impacts
            impacts={impacts}
            selectImpact={props.selectImpact}
          ></Impacts>
          <a className="NETheader cursor fullwidth" onClick={openFolder}>
            OPEN IMPACTS FOLDER
          </a>
        </div>
      </div>
    </div>
  );
}

interface ImpactsProps {
  impacts: Array<Impact>;
  selectImpact: (name: string) => void;
}

function Impacts(props: ImpactsProps) {
  const arr: Array<React.JSX.Element> = [];
  if (props.impacts.length) {
    props.impacts.forEach((e: Impact) => {
      arr.push(
        <a onClick={(event) => selectImpact(event, e.key, props.selectImpact)}>
          <div className="NETimpact">
            {e.image ? (
              <img src={e.image}></img>
            ) : (
              <div className="NETimpacttext">{e.key}</div>
            )}
          </div>
        </a>,
      );
    });
  }
  return arr;
}

const selectImpact = (
  event: React.MouseEvent<HTMLAnchorElement>,
  name: string,
  setter: (name: string) => void,
) => {
  event.preventDefault();
  setter(name);
  return false;
};
