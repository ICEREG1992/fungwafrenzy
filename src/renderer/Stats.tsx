import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../hooks/useSettingsStore';
import FrenzyNETHeader from './FrenzyNETHeader';
import { ImpactPreview, Impact } from './interfaces';
import MenuRoot from './MenuRoot';

export default function Stats() {
  const { settings } = useSettingsStore();

  const [impacts, setImpacts] = useState<Array<Impact>>([]);
  useEffect(() => {
    window.electron.ipcRenderer
      .invoke('get-impacts', settings.impact_folder_path)
      .then((res) => {
        console.log(res);
        const keys = Object.keys(res);
        return Promise.all(
          keys.map((key) =>
            window.electron.ipcRenderer.invoke(
              'get-impact',
              res[key].key,
              settings.impact_folder_path,
            ),
          ),
        );
      })
      .then((impacts: Impact[]) => {
        setImpacts(impacts);
        return impacts; // Explicitly return impacts
      })
      .catch((err) => {
        console.error('Failed to get impacts:', err);
        throw err; // Explicitly throw to propagate error if needed
      });
  }, []);

  return (
    <MenuRoot background={settings.background}>
      <FrenzyNETHeader nav page="stats" />
      <div id="body">
        <div className="NETcontainer">
          <ImpactsStats impacts={impacts} />
        </div>
      </div>
    </MenuRoot>
  );
}

interface ImpactsStatsProps {
  impacts: Array<Impact>;
}

function ImpactsStats(props: ImpactsStatsProps) {
  const arr: Array<React.JSX.Element> = [];
  if (props.impacts.length) {
    props.impacts.forEach((e: Impact) => {
      console.log('Impact:', e);
      arr.push(<ImpactStats impact={e} />);
    });
  } else {
    arr.push(<div key="no-impacts">No impacts found.</div>);
  }
  return arr;
}

interface ImpactStatsProps {
  impact: Impact;
}

function ImpactStats(props: ImpactStatsProps) {
  return (
    <div key={props.impact.info.title.toLowerCase()}>
      <div className="NETheader">{props.impact.info.title.toUpperCase()}</div>
      <div className="NETbody">
        <div className="NETline">
          <b>progress:</b>
        </div>
        <div className="NETline">
          <b>&nbsp;&nbsp;space:</b>
        </div>
        <div className="NETline">&nbsp;&nbsp;&nbsp;&nbsp;43.222 %</div>
        <div className="NETline">
          <b>&nbsp;&nbsp;time:</b>
        </div>
        <div className="NETline">&nbsp;&nbsp;&nbsp;&nbsp;10 HOURS</div>
      </div>
    </div>
  );
}
