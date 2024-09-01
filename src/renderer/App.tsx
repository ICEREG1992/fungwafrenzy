import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Marquee from "react-fast-marquee";
import './App.css';


function Hello() {
  return (
    <div>
      <header id="header">
        <div id="titlebar">
          <div id="title">
            Fung-Wa Frenzy
          </div>
          <div id="exit">
            EXIT
          </div>
        </div>
        <Marquee>
          <span>Art collective Synydyne's "Bear Stearns Bravo" taken offline in unlisting scandal /</span>
          <span>Officials warn of fraud with local utility companies: Water, Electic, etc. /</span>
          <span>Battle Club found! Was inside us all along? /</span>
        </Marquee>
      </header>
      <div id="body">
        <div id="grid">
          <div className="button"></div>
          <div className="button"></div>
          <div className="button"></div>
          <div className="button"></div>
          <div className="button"></div>
          <div className="button"></div>
          <div className="button"></div>
          <div className="button"></div>
          <div className="button"></div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}