export interface userSettings {
    selected_impact: string;
    player_theme: string;
    impact_folder_path: string;
    save_folder_path: string;
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

export interface userSave {
    impact: string;
    variables: object;
    block: string;
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
    variables: Array<variable>;
    start: string;
}

interface variable {
    name: string;
    type: string;
}

interface impactBlocks {
    [key: string]: impactBlock;
}

interface impactBlock {
    title: string;
    videos: Array<blockVideo>;
    targets: Array<blockTarget> | blockNext;
    flags?: Array<blockFlag>;
}

interface blockVideo {
    path: string;
    title: string;
    condition: blockCondition;
    timing: blockTiming;
    music: string;
    targets?: Array<blockTarget> | blockNext;
}

interface blockCondition {
    type: string;
    value: string;
}

interface blockTiming {
    targets: number;
    loop: number
}

interface blockTarget {
    target: string;
    text: string;
}

interface blockNext {
    target: string;
}

interface blockFlag {
    name: string;
    value: string;
}

interface impactMusic {
    [key: string]: impactSong;
}

interface impactSong {
    title: string;
    path: string;
}