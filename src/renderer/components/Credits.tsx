import FrenzyNETHeader from '../FrenzyNETHeader';
import '../styles/Credits.css';

export default function Credits() {
  return (
    <div className="menuroot">
      <FrenzyNETHeader nav page="credits" />
      <div className="credits-container">
        <div className="NETcontainer">
          <div className="NETheader">CREDITS</div>
          <div className="NETbody">
            <div className="NETline">
              Original Creators: Jamie Niemasik, Thomas Bender, Jacob Bakkila,
              and the rest of the Synydyne team
              <br />
              <br />
              <div className="NETline">
                Programming: ICEREG1992, Josh Wilson
              </div>
              <div className="NETline">
                Special Thanks: 400TACOS, HUNDOBILLION, and LASERHAVER3
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
