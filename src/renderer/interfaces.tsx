export interface userSettings {
  selected_impact: string;
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
}

export interface impact {
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
  path: string;
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

interface impactMusic {
  [key: string]: impactSong;
}

interface impactSong {
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

export interface modalState {
  title: string;
  desc?: string;
  default?: string;
  input: string;
  button: string;
  value: string;
  visible: boolean;
}

export interface GameProps {
  save?: gameState;
}
