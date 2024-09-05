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