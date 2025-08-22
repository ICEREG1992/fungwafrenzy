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
      arr.push(<ImpactStatsView impact={e} />);
    });
  } else {
    arr.push(<div key="no-impacts">No impacts found.</div>);
  }
  return arr;
}

interface ImpactStatsProps {
  impact: Impact;
}

interface ImpactStats {
  time: number;
  seen: String[];
}

function ImpactStatsView(props: ImpactStatsProps) {
  const [stats, setStats] = useState<ImpactStats>({ time: 0, seen: [] });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          'get-stats',
          props.impact.info.shortname,
        );
        setStats(res);
      } catch (err) {
        console.log('Failed to load stats', err);
        setStats({ time: 0, seen: [] }); // Reset stats on error
      }
    };
    loadStats();
  }, [props.impact.info.shortname]);

  if (!stats) return <div className="NETheader">LOADING...</div>;

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
        <div className="NETline">
          &nbsp;&nbsp;&nbsp;&nbsp;
          {getProgress(props.impact, stats.seen)
            .toFixed(4)
            .replace(/\.?0+$/, '')}{' '}
          %
        </div>
        <div className="NETline">
          <b>&nbsp;&nbsp;time:</b>
        </div>
        <div className="NETline">
          &nbsp;&nbsp;&nbsp;&nbsp;{secondsToText(stats.time)}
        </div>
      </div>
    </div>
  );
}

function secondsToText(seconds: number): string {
  const format = (n: number, unit: string) => {
    const val = parseFloat(n.toFixed(0)); // trims to 4 decimals, removes trailing zeros
    return `${val} ${unit}${val === 1 ? '' : 'S'}`;
  };

  if (seconds < 60) {
    return format(seconds, 'SECOND');
  } else if (seconds < 3600) {
    return format(seconds / 60, 'MINUTE');
  } else {
    return format(seconds / 3600, 'HOUR');
  }
}

function getProgress(impact: Impact, seen: String[]): number {
  if (impact.info.videos) {
    return (seen.length / impact.info.videos) * 100;
  } else {
    // calculate based on number of videos in each block that has a path
    const videos = Object.values(impact.blocks).reduce((count, block) => {
      if (block.videos) {
        return (
          count +
          Object.values(block.videos).filter((video) => video.path).length
        );
      }
      return count;
    }, 0);
    console.log(`${impact.info.shortname} ${videos.toString()}`);
    if (videos === 0) return 0; // Avoid division by zero
    // Return the percentage of seen videos
    return (seen.length / videos) * 100;
  }
}
