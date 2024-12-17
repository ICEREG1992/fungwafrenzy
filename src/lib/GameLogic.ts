import {
  blockCondition,
  blockFlags,
  gameFlags,
  gameState,
  impactBlock,
  userSettings,
} from '../renderer/interfaces';
import { useSettingsStore } from '../hooks/useSettingsStore';

/*
        Alters the state of our gameFlags according to a certain object's (block, target, or video) flags
        out: the current state of flags for this session
        flags: the flags for the intended object
    */
export function handleFlags(out: gameFlags, flags: blockFlags) {
  Object.keys(flags).forEach((flag) => {
    // if flag is boolean, the value will either be "true", "false", or "flip"
    switch (typeof out[flag]) {
      case 'boolean':
        switch (flags[flag]) {
          case 'true':
            out[flag] = true;
            break;
          case 'false':
            out[flag] = false;
            break;
          case 'flip':
            out[flag] = !out[flag];
            break;
          default:
            break;
        }
        break;
      case 'number':
        // if value ends in a "+" or "-", it is an operation, otherwise just assign the value
        switch (flags[flag].slice(-1)) {
          case '+':
            out[flag] =
              (out[flag] as number) + parseInt(flags[flag].slice(0, -1), 10);
            break;
          case '-':
            out[flag] =
              (out[flag] as number) - parseInt(flags[flag].slice(0, -1), 10);
            break;
          default:
            out[flag] = parseInt(flags[flag], 10);
            break;
        }
        break;
      default:
        break;
    }
  });
}

export function checkCondition(
  condition: blockCondition,
  localGameState: gameState,
  settings: userSettings,
) {
  switch (condition.type.toLowerCase()) {
    case 'and':
      // eslint-disable-next-line no-use-before-define
      return checkConditions(
        condition.value as Array<blockCondition>,
        localGameState,
        settings,
        'AND',
      );
    case 'or':
      return checkConditions(
        condition.value as Array<blockCondition>,
        localGameState,
        settings,
        'OR',
      );
    case 'seen':
      return localGameState.seen.includes(condition.value as string);
    case 'notseen':
      return !localGameState.seen.includes(condition.value as string);
    case 'time':
      const now = new Date();
      const h = now.getHours();
      const c = splitCondition(condition.value as string); // assert this is a string because it's not an array
      switch (c[0]) {
        case '==':
          if (parseInt(c[1])) {
            // compare to a const
            return h === parseInt(c[1]);
          } else {
            // compare to another flag
            return h === localGameState.flags[condition.value as string];
          }
        case '<=':
          if (parseInt(c[1])) {
            return h <= parseInt(c[1]);
          } else {
            return (
              h <=
              (localGameState.flags[
                condition.value as string
              ] as unknown as number)
            );
          }
        case '>=':
          if (parseInt(c[1])) {
            return h >= parseInt(c[1]);
          } else {
            return (
              h >=
              (localGameState.flags[
                condition.value as string
              ] as unknown as number)
            );
          }
        case '<':
          if (parseInt(c[1])) {
            return h < parseInt(c[1]);
          } else {
            return (
              h <
              (localGameState.flags[
                condition.value as string
              ] as unknown as number)
            );
          }
        case '>':
          if (parseInt(c[1])) {
            return h > parseInt(c[1]);
          } else {
            return (
              h >
              (localGameState.flags[
                condition.value as string
              ] as unknown as number)
            );
          }
        default:
          // unknown operator, return false
          return false;
      }
    case 'state':
      return settings.location === condition.value;
    default:
      // interpret this as a flag check
      switch (typeof localGameState.flags[condition.type]) {
        case 'boolean':
          switch (condition.value) {
            case 'true':
              return localGameState.flags[condition.type] as boolean;
            case 'false':
              return !localGameState.flags[condition.type] as boolean;
            default:
              // compare to another flag
              return (
                localGameState.flags[condition.type] ===
                localGameState.flags[condition.value as string]
              );
          }
        case 'number':
          const c = splitCondition(condition.value as string); // assert this is a string because it's not an array
          switch (c[0]) {
            case '==':
              if (parseInt(c[1])) {
                // compare to a const
                return localGameState.flags[condition.type] === parseInt(c[1]);
              } else {
                // compare to another flag
                return (
                  localGameState.flags[condition.type] ===
                  localGameState.flags[condition.value as string]
                );
              }
            case '<=':
              if (parseInt(c[1])) {
                return (
                  (localGameState.flags[condition.type] as number) <=
                  parseInt(c[1])
                );
              } else {
                return (
                  localGameState.flags[condition.type] <=
                  localGameState.flags[condition.value as string]
                );
              }
            case '>=':
              if (parseInt(c[1])) {
                return (
                  (localGameState.flags[condition.type] as number) >=
                  parseInt(c[1])
                );
              } else {
                return (
                  localGameState.flags[condition.type] >=
                  localGameState.flags[condition.value as string]
                );
              }
            case '<':
              if (parseInt(c[1])) {
                return (
                  (localGameState.flags[condition.type] as number) <
                  parseInt(c[1])
                );
              } else {
                return (
                  localGameState.flags[condition.type] <
                  localGameState.flags[condition.value as string]
                );
              }
            case '>':
              if (parseInt(c[1])) {
                return (
                  (localGameState.flags[condition.type] as number) >
                  parseInt(c[1])
                );
              } else {
                return (
                  localGameState.flags[condition.type] >
                  localGameState.flags[condition.value as string]
                );
              }
            default:
              // unknown operator, return false
              return false;
          }
        default:
          return false;
      }
  }
}

export function checkConditions(
  conditions: Array<blockCondition>,
  localGameState: gameState,
  settings: userSettings,
  mode?: string,
) {
  let out: boolean;
  switch (mode) {
    case 'AND':
      out = true;
      conditions.forEach((condition) => {
        out = out && checkCondition(condition, localGameState, settings);
      });
      break;
    case 'OR':
      out = false;
      conditions.forEach((condition) => {
        out = out || checkCondition(condition, localGameState, settings);
      });
      break;
    default:
      out = true;
      conditions.forEach((condition) => {
        out = out && checkCondition(condition, localGameState, settings);
      });
  }
  return out;
}

export function handleSelect(
  gameState: gameState,
  block: impactBlock,
  settings: userSettings,
) {
  // figure out if this is a chance block or a condition block
  if (block.videos[0].chance) {
    // if it is chance, make one chance calculation and run it against each video until it hits
    const rand = Math.random();
    console.log(rand);
    // eslint-disable-next-line vars-on-top
    let sum = 0;
    let selectedVideo = block.videos[0];
    block.videos.some((video) => {
      // for every video, perform this check, stop once we hit true
      sum += video.chance as number; // assert this exists always because the first video specifies chance
      if (rand <= sum) {
        selectedVideo = video;
        return true;
      }
      return false;
    });
    return selectedVideo;
  } else {
    // eslint-disable-next-line no-lonely-if
    if (block.videos[0].conditions) {
      // this is now a flag check, watched check, time check, or location check
      let selectedVideo = block.videos[0];
      block.videos.some((video) => {
        // for every video, perform this check, stop once we hit true
        if (
          checkConditions(
            video.conditions as Array<blockCondition>,
            gameState,
            settings,
          )
        ) {
          selectedVideo = video;
          return true;
        }
        return false;
      });
      // todo: logic here
      return selectedVideo;
      // eslint-disable-next-line no-else-return
    } else {
      // no chance or condition, return the first video in the set
      return block.videos[0];
    }
  }
}

function splitCondition(c: string) {
  // use regex to split a comparison out from the string
  const match = /^(==|<=|>=|<|>)(.*)/.exec(c);
  // eslint-disable-next-line spaced-comment
  return (match as RegExpExecArray).slice(1); //assert this has a result
}
