import {
  blockCondition,
  blockFlags,
  blockVideo,
  gameFlags,
  gameState,
  Impact,
  impactBlock,
  ImpactStats,
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
  condition: blockCondition | undefined,
  localGameState: gameState,
  settings: userSettings,
): boolean {
  if (!condition) {
    // if a video doesn't have a condition, then shortcircuit and return true
    return true;
  }
  switch (condition.type.toLowerCase()) {
    case 'and':
      // eslint-disable-next-line no-use-before-define
      return checkConditions(
        condition.value as Array<blockCondition>,
        localGameState,
        settings,
        'and',
      );
    case 'or':
      return checkConditions(
        condition.value as Array<blockCondition>,
        localGameState,
        settings,
        'or',
      );
    case 'not':
      return !checkCondition(
        condition.value as blockCondition,
        localGameState,
        settings,
      );
    case 'seen':
      return localGameState.seen.includes(condition.value as string);
    case 'time':
      const now = new Date();
      const h = now.getUTCHours();
      const c = splitCondition(condition.value as string); // assert this is a string because it's not an array
      switch (c[0]) {
        case '==':
          if (!Number.isNaN(parseInt(c[1]))) {
            // compare to a const
            return h === parseInt(c[1]);
          } else {
            // compare to another flag
            return h === localGameState.flags[condition.value as string];
          }
        case '<=':
          if (!Number.isNaN(parseInt(c[1]))) {
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
          if (!Number.isNaN(parseInt(c[1]))) {
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
          if (!Number.isNaN(parseInt(c[1]))) {
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
          if (!Number.isNaN(parseInt(c[1]))) {
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
          if (c[0]) {
            switch (c[0]) {
              case '==':
                if (!Number.isNaN(parseInt(c[1]))) {
                  // compare to a const
                  return (
                    localGameState.flags[condition.type] === parseInt(c[1])
                  );
                } else {
                  // compare to another flag
                  return (
                    localGameState.flags[condition.type] ===
                    localGameState.flags[condition.value as string]
                  );
                }
              case '<=':
                if (!Number.isNaN(parseInt(c[1]))) {
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
                if (!Number.isNaN(parseInt(c[1]))) {
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
                if (!Number.isNaN(parseInt(c[1]))) {
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
                if (!Number.isNaN(parseInt(c[1]))) {
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
          } else {
            // interpret this as an == check
            if (!Number.isNaN(parseInt(c[1]))) {
              // compare to a const
              return localGameState.flags[condition.type] === parseInt(c[1]);
            } else {
              // compare to another flag
              return (
                localGameState.flags[condition.type] ===
                localGameState.flags[condition.value as string]
              );
            }
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
  mode: string,
) {
  let out: boolean;
  switch (mode.toLowerCase()) {
    case 'and':
      out = true;
      conditions.forEach((condition) => {
        out = out && checkCondition(condition, localGameState, settings);
      });
      break;
    case 'or':
      out = false;
      conditions.forEach((condition) => {
        out = out || checkCondition(condition, localGameState, settings);
      });
      break;
    default:
      console.log(`unexpected mode: ${mode}`);
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
  impact: Impact,
): [impactBlock, blockVideo, string | undefined] {
  let selectedVideo = {
    title: 'Datafault!',
    path: impact.meta.datafault,
  } as blockVideo;
  let selectedBlock = block;
  let selected = undefined;
  // figure out if this is a chance block or a condition block
  if (block.videos[0].chance) {
    // if it is chance, make one chance calculation and run it against each video until it hits
    const rand = Math.random();
    console.log(rand);
    let sum = 0;
    block.videos.some((video) => {
      // for every video, perform this check, stop once we hit true
      sum += video.chance as number; // assert this exists always because the first video specifies chance
      if (rand <= sum) {
        selectedVideo = video;
        return true;
      }
      return false;
    });
    selectedBlock = block;
  } else {
    if (block.videos[0].condition) {
      // this is now a check of some kind
      for (let i = 0; i < block.videos.length; i += 1) {
        // for every video, perform this check, stop once we hit true
        const video = block.videos[i];
        if (
          checkCondition(video.condition as blockCondition, gameState, settings)
        ) {
          selectedVideo = video;
          break;
        }
      }
      // eslint-disable-next-line no-else-return
    } else {
      // no chance or condition, return the first video in the set
      [selectedVideo] = block.videos;
    }
  }
  // as a final check, make sure selected video has a video
  if (!selectedVideo.path) {
    // no video! handle flags from this video then move to the next
    if (selectedVideo.flags) {
      handleFlags(gameState.flags, selectedVideo.flags);
    }
    console.log(selectedVideo);
    selected = selectedVideo.next;
    // assert this blank block has a next in either video-scope or block-scope
    const [newBlock, newVideo, newSelected] = handleSelect(
      gameState,
      impact.blocks[
        (selectedVideo.next as string)
          ? (selectedVideo.next as string)
          : (block.next as string)
      ],
      settings,
      impact,
    );
    selectedBlock = newBlock;
    selectedVideo = newVideo;
    if (newSelected !== undefined) {
      selected = newSelected;
    }
  }
  return [selectedBlock, selectedVideo, selected];
}

function splitCondition(c: string) {
  // use regex to split a comparison out from the string
  const match = /^(==|<=|>=|<|>)?(.*)/.exec(c);
  // eslint-disable-next-line spaced-comment
  return (match as RegExpExecArray).slice(1); //assert this has a result
}

export function handleAchievements(
  gameState: gameState,
  impact: Impact,
  stats: ImpactStats,
) {
  const settings = useSettingsStore.getState().settings;
  if (impact.meta.achievements) {

    impact.meta.achievements.forEach((achievement) => {
      console.log(`testing achievement: ${achievement.title}`);
      if (
        !stats.achievements.includes(achievement.title) && // not already achieved
        checkCondition(achievement.condition, gameState, settings) // condition is met
      ) {
        window.electron.ipcRenderer.invoke("post-stats", impact.info.shortname, 0, "", achievement.title);
      }
    });
  }
}