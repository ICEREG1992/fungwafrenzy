import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Marquee from "react-fast-marquee";
import './App.css';

function Browse() {
  return (
    <div>
      <FrenzyNETHeader nav page="browse impacts"/>
      <div>

      </div>
    </div>
  )
}

function LoadImpact() {
  return (
    <div>
      <FrenzyNETHeader nav page="load custom impact"/>
      <div>

      </div>
    </div>
  )
}

function LoadGame() {
  return (
    <div>
      <FrenzyNETHeader nav page="load game"/>
      <div>

      </div>
    </div>
  )
}

function Game() {
  return (
    <div>

    </div>
  )
}

function Credits() {
  return (
    <div>
      <FrenzyNETHeader nav page="credits"/>
      <div>

      </div>
    </div>
  )
}

function closeApp() {
  window.electron.ipcRenderer.sendMessage("close-app");
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
          <Link to="/">FrenzyNET</Link>
        </div>
        <div id="right">
          {props.page === "options" ? <div id="options"><Link to="/">MAIN MENU</Link></div> : <div id="options"><Link to="/options">OPTIONS</Link></div>}
          <div id="separator">/</div>
          <div id="exit" onClick={closeApp}>
            <Link to="./">EXIT</Link>
          </div>
        </div>
      </div>
      <Marquee speed={25}>
        <span>Authorities warn of corruption within local utility companies: Water, Electric, etc. /</span>
        <span>Art collective Synydyne's "Bear Stearns Bravo" taken offline in unlisting scandal /</span>
        <span>Battle Club found! Was inside us all along? /</span>
        <span>JET sequel announced for 2027 /</span>
        <span>Bear Stearns unveils new line of consolation and greeting cards. "I CARE" SEZ JUDO JACKIE. /</span>
      </Marquee>
      {props.nav ? <HeaderNavigation page={props.page}/> : null}
    </header>
  )
}

interface HeaderNavigationProps {
  page: string;
}
function HeaderNavigation(props:HeaderNavigationProps) {
  return(
    <div id="navigation">
      <div id="navbox">
        <Link to="/" ><button id="mainbutton">&lt; MAIN</button></Link>
        <div id="location">You are in {props.page.toUpperCase()}</div>
      </div>
    </div>
  )
}

function Options() {
  return (
    <div>
      <FrenzyNETHeader nav page="options"/>
      <div id="body">
        <div className="NETcontainer">
          <div className="NETheader">
            GAME SETTINGS
          </div>
          <div className="NETbody">
            <div className = "NETline">
              <b>player_theme:</b> classic <a>&lt;CHANGE&gt;</a>
            </div>
            <div className = "NETline">
              <b>impact_folder_path:</b> C:\dummyfolderlocation <a>&lt;CHANGE&gt;</a>
            </div>
            <div className = "NETline">
              <b>user_save_path:</b> C:\dummyfolderlocation <a>&lt;CHANGE&gt;</a>
            </div>
          </div>
          <div className="NETheader">
            VIDEO SETTINGS
          </div>
          <div className="NETbody">
            <div className = "NETline">
              <b>resolution:</b> 720x480 <a>&lt;CHANGE&gt;</a>
            </div>
            <div className = "NETline">
              <b>fullscreen:</b> disabled <a>&lt;CHANGE&gt;</a>
            </div>
          </div>
          <div className="NETheader">
            AUDIO SETTINGS
          </div>
          <div className="NETbody">
            <div className = "NETline">
              <b>master_volume:</b> 100 <a>&lt;CHANGE&gt;</a>
            </div>
            <div className = "NETline">
              <b>video_volume:</b> 100 <a>&lt;CHANGE&gt;</a>
            </div>
            <div className = "NETline">
              <b>music_volume:</b> 80 <a>&lt;CHANGE&gt;</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Title() {
  return (
    <div>
      <FrenzyNETHeader page="mainmenu"/>
      <div id="body">
        <div id="grid">
          <Link to="/browse" tabIndex={-1}><button type="button">Browse Impacts</button></Link>
          <Link to="/loadimpact" tabIndex={-1}><button type="button">Load Custom Impact</button></Link>
          <button type="button" disabled>???</button>
          <button type="button" onClick={LoadGame}>Continue Game</button>
          <button type="button">Start New Game</button>
          <Link to="/loadgame" tabIndex={-1}><button type="button">Load Game</button></Link>
          <button type="button" disabled>???</button>
          <Link to="/credits" tabIndex={-1}><button type="button">Credits</button></Link>
          <button type="button" disabled>???</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Title />} />
        <Route path="/options" element={<Options />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/loadimpact" element={<LoadImpact />} />
        <Route path="/loadgame" element={<LoadGame />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}