import FrenzyNETHeader from '../FrenzyNETHeader';

export default function Credits() {
  return (
    <div className="menuroot">
      <FrenzyNETHeader nav page="credits" />
      <div id="body">
        <div className="NETcontainer">
          <div className="NETheader">DEVELOPED BY</div>
          <div className="NETbody">
            <div className="NETline">
              <a
                href="https://github.com/ICEREG1992/"
                target="_blank"
                rel="noreferrer"
              >
                ICEREG1992
              </a>
            </div>
            <div className="NETline">
              <a
                href="https://github.com/Geeknerd1337/"
                target="_blank"
                rel="noreferrer"
              >
                GEEKNERD1337
              </a>
            </div>
          </div>
          <div className="NETheader">ORIGINAL CONCEPT BY</div>
          <div className="NETbody">
            <div className="NETline">Thomas Bender</div>
            <div className="NETline">
              <a
                href="https://jacobbakkila.com/"
                target="_blank"
                rel="noreferrer"
              >
                Jacob Bakilla
              </a>
            </div>
            <div className="NETline">Jamie Niemasik</div>
            <div className="NETline">
              The rest of the{' '}
              <a
                href="http://www.synydyne.com/"
                target="_blank"
                rel="noreferrer"
              >
                Synydyne
              </a>{' '}
              crew
            </div>
          </div>
          <div className="NETheader">SPECIAL THANKS TO</div>
          <div className="NETbody">
            <div className="NETline">400TACOS</div>
            <div className="NETline">LASERHAVER3</div>
            <div className="NETline">HUNDOBILLION</div>
            <div className="NETline"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
