import { ReactNode } from 'react';
import baliDusk from '../../assets/images/title/bali-dusk.gif';
import laDay from '../../assets/images/title/la-day.gif';
import laNoon from '../../assets/images/title/la-noon.gif';
import laAfternoon from '../../assets/images/title/la-afternoon.gif';
import laDusk from '../../assets/images/title/la-dusk.gif';
import laNight from '../../assets/images/title/la-night.gif';

interface MenuRootProps {
  background: string;
  children: ReactNode[];
}

export default function MenuRoot(props: MenuRootProps) {
  let background: string;

  switch (props.background) {
    case 'bali-dusk':
      background = baliDusk;
      break;
    case 'la-day':
      background = laDay;
      break;
    case 'la-noon':
      background = laNoon;
      break;
    case 'la-afternoon':
      background = laAfternoon;
      break;
    case 'la-dusk':
      background = laDusk;
      break;
    case 'la-night':
      background = laNight;
      break;
    default:
      // get hour
      const hour = new Date().getHours();
      console.log(hour);
      // set background based on hour
      switch (hour) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          background = laNight;
          break;
        case 6:
          background = laDusk;
          break;
        case 7:
        case 8:
          background = laAfternoon;
          break;
        case 9:
          background = laNoon;
          break;
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
        case 17:
          background = laDay;
          break;
        case 18:
        case 19:
          background = laNoon;
          break;
        case 20:
          background = laAfternoon;
          break;
        case 21:
          background = laDusk;
          break;
        case 22:
        case 23:
          background = laNight;
          break;
        default:
          background = laDay;
          break;
      }
  }
  return (
    <div
      className="menuroot"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      {props.children}
    </div>
  );
}
