import { Link } from 'react-router-dom';
import Marquee from 'react-fast-marquee';

function closeApp() {
  window.electron.ipcRenderer.sendMessage('close-app');
}

interface FrenzyNETHeaderProps {
  nav?: boolean;
  page: string;
}

function shuffle(arr: Array<String>) {
  for (let i = 0; i < arr.length; i += 1) {
    const rand = Math.floor(Math.random() * arr.length);
    const a = arr[i];
    const b = arr[rand];
    arr[i] = b;
    arr[rand] = a;
  }
}

export default function FrenzyNETHeader(props: FrenzyNETHeaderProps) {
  const tickerText = [
    'Authorities warn of corruption within local utility companies: Water, Electric, etc. / ',
    'Art collective Synydyne\'s "Bear Stearns Bravo" taken offline in unlisting scandal / ',
    'Battle Club found! Was inside us all along? / ',
    'JET sequel announced for 2027 / ',
    'Bear Stearns unveils new line of consolation and greeting cards. "I CARE" SEZ JUDO JACKIE. / ',
    'Cowboy Cafe celebrates 10 years of service, despite seeming lack of patronage / ',
    'Thanks, * 400TACOS / ',
    'Thanks, * LASERHAVER3 / ',
    'Also try Bear Stearns Bravo! / ',
    'Dark Netrider trashes entire city block playing Grand Theft Auto 3, still at large / ',
    'Weeeeeeeeeeeeeeeeeee! / ',
  ];

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
          <div
            id="exit"
            onClick={() => {
              // tell main process to allow exit
              window.electron.ipcRenderer.sendMessage('allow-close');
              closeApp();
            }}
          >
            <Link to="./">EXIT</Link>
          </div>
        </div>
      </div>
      <Marquee speed={25}>
        <HeaderTicker text={tickerText}></HeaderTicker>
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

interface HeaderTickerProps {
  text: Array<String>;
}
function HeaderTicker(props: HeaderTickerProps) {
  shuffle(props.text);
  return props.text;
}
