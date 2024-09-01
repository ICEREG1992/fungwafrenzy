import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Marquee from "react-fast-marquee";
import './App.css';

function Title() {
  return (
    <div>
      <FrenzyNETHeader page="mainmenu"/>
      <div id="body">
        <div id="grid">
          <button type="button">Browse Impacts</button>
          <button type="button">Load Custom Impact</button>
          <button type="button">?</button>
          <button type="button">Continue Game</button>
          <button type="button">Start New Game</button>
          <button type="button">Load Game</button>
          <button type="button">?</button>
          <button type="button">Credits</button>
          <button type="button">?</button>
        </div>
      </div>
    </div>
  );
}

function Options() {
  return (
    <div>
      <FrenzyNETHeader nav page="options"/>
      <div id="body">
        
      </div>
    </div>
  )
}

interface FrenzyNETHeaderProps {
  nav?: boolean;
  page: string;
}

function FrenzyNETHeader(props:FrenzyNETHeaderProps) {
  return (
    <header id="header">
      <div id="titlebar">
        <div id="left">
          FrenzyNET
        </div>
        <div id="right">
          {props.page === "options" ? <div id="options"><Link to="/">MAIN MENU</Link></div> : <div id="options"><Link to="/options">OPTIONS</Link></div>}
          <div id="separator">/</div>
          <div id="exit" onClick={closeApp}>
            EXIT
          </div>
        </div>
      </div>
      <Marquee speed={25}>
        <span>Officials warn of corruption within local utility companies: Water, Electric, etc. /</span>
        <span>Art collective Synydyne's "Bear Stearns Bravo" taken offline in unlisting scandal /</span>
        <span>Battle Club found! Was inside us all along? /</span>
      </Marquee>
      {props.nav ? <HeaderNavigation page="options"/> : null}
    </header>
  )
}

interface HeaderNavigationProps {
  page: string;
}
function HeaderNavigation(props:HeaderNavigationProps) {
  return(
    <div id="navigation">
      <Link to="/" ><button id="mainbutton">&lt; MAIN</button></Link>
      <div id="location">You are in {props.page.toUpperCase()}</div>
    </div>
  )
}

function closeApp() {
  window.electron.ipcRenderer.sendMessage("close-app");
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Title />} />
        <Route path="/options" element={<Options />} />
      </Routes>
    </Router>
  );
}