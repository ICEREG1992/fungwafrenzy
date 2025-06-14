export interface userSettings {
  selected_impact: string;
  selected_save: string;
  player_theme: string;
  impact_folder_path: string;
  save_folder_path: string;
  skip_button: boolean;
  skip_timer: number;
  username: string;
  class: string;
  location: string;
  resolution_x: number;
  resolution_y: number;
  fullscreen: boolean;
  volume_master: number;
  volume_video: number;
  volume_music: number;
  selected_song: string;
  play_mode: boolean;
  debug: boolean;
}

export interface Impact {
  info: impactInfo;
  meta: impactMeta;
  blocks: impactBlocks;
  music: impactMusic;
}

interface impactInfo {
  game: string;
  title: string;
  subtitle: string;
  description: string;
  length: string;
  author: string;
}

interface impactMeta {
  flags: metaFlags;
  start: string;
  chapters?: string[];
  datafault?: string;
  diskfault?: string;
  color?: string;
}

interface metaFlags {
  [key: string]: 'bool' | 'int';
}

export interface gameFlags {
  [key: string]: boolean | number;
}

export interface impactBlocks {
  [key: string]: impactBlock;
}

export interface impactBlock {
  title: string;
  videos: Array<blockVideo>;
  flags?: blockFlags;
  targets?: Array<blockTarget>;
  next?: string;
}

export interface blockVideo {
  path?: string;
  title: string;
  chance?: number;
  condition?: blockCondition;
  timing?: blockTiming;
  music?: string;
  flags?: blockFlags;
  question?: string;
  targets?: Array<blockTarget>;
  next?: string;
}

export interface blockCondition {
  type: string;
  value: string | blockCondition | Array<blockCondition>;
}

export interface blockTiming {
  targets?: number;
  loop?: number;
  music?: number;
  silence?: number;
}

export interface blockTarget {
  target: string;
  text: string;
  flags?: blockFlags;
}

export interface blockFlags {
  [name: string]: string;
}

export interface impactMusic {
  [key: string]: impactSong;
}

export interface impactSong {
  title: string;
  path: string;
  volume: number;
}

export interface gameState {
  block: impactBlock;
  currentVideo: blockVideo;
  playingMusic: string;
  flags: gameFlags;
  seen: Array<string>;
}

export interface NetModalState {
  title: string;
  desc?: string;
  default?: string;
  input: string;
  button: string;
  value: string;
  visible: boolean;
}

export interface ModalState {
  type: string;
  visible: boolean;
}

export interface GameProps {
  continue?: boolean;
}

export interface SaveGame {
  key: string;
  filename: string;
  date: Date;
  impact: string;
  gameState: gameState;
}
