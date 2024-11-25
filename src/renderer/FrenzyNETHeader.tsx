import { Link } from 'react-router-dom';
import Marquee from 'react-fast-marquee';

function closeApp() {
  window.electron.ipcRenderer.sendMessage('close-app');
}

interface FrenzyNETHeaderProps {
  nav?: boolean;
  page: string;
}

export default function FrenzyNETHeader(props: FrenzyNETHeaderProps) {
  return (
    <header id="header">
      <div id="titlebar">
        <div id="left">
          <Link to="/">FrenzyNET</Link>
        </div>
        <div id="right">
          {props.page === 'settings' ? (
            <div id="settings">
              <Link to="/">MAIN MENU</Link>
            </div>
          ) : (
            <div id="settings">
              <Link to="/settings">SETTINGS</Link>
            </div>
          )}
          <div id="separator">/</div>
          <div id="exit" onClick={closeApp}>
            <Link to="./">EXIT</Link>
          </div>
        </div>
      </div>
      <Marquee speed={25}>
        {' '}
        {/* TODO: get this to start at random location on render */}
        <span>
          Authorities warn of corruption within local utility companies: Water,
          Electric, etc. /
        </span>
        <span>
          Art collective Synydyne&apos;s &quot;Bear Stearns Bravo&quot; taken
          offline in unlisting scandal /
        </span>
        <span>Battle Club found! Was inside us all along? /</span>
        <span>JET sequel announced for 2027 /</span>
        <span>
          Bear Stearns unveils new line of consolation and greeting cards.
          &quot;I CARE&quot; SEZ JUDO JACKIE. /
        </span>
        <span>
          Cowboy Cafe celebrates 10 years of service, despite seeming lack of
          patronage /
        </span>
        <span>Thanks, * 400TACOS /</span>
        <span>Also try Bear Stearns Bravo! /</span>
        <span>
          Dark Netrider trashes entire city block playing Grand Theft Auto 3,
          still at large /
        </span>
        <span>Weeeeeeeeeeeeeeeeeee! /</span>
      </Marquee>
      {props.nav ? <HeaderNavigation page={props.page} /> : null}
    </header>
  );
}

interface HeaderNavigationProps {
  page: string;
}
function HeaderNavigation(props: HeaderNavigationProps) {
  return (
    <div id="navigation">
      <div id="navbox">
        <Link to="/">
          <button id="mainbutton">&lt; MAIN</button>
        </Link>
        <div id="location">You are in {props.page.toUpperCase()}</div>
      </div>
    </div>
  );
}
