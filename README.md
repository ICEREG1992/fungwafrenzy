# fungwafrenzy
Modern Offline Client for Indie FMV Hit "Fung-Wa Frenzy"

# installation
1. download the installer from the "Releases" tab on the right.
2. for Windows, run the installer and the game will open automatically.
3. move any downloaded impacts into your impact folder, unzipped.

# impacts
Fung-Wa Frenzy relies on packages named "impacts" to determine what content is played and when that content is played. In this repo I have included a test impact (Impact -1) in `assets/impacts/Impact -1.zip`, but no official impacts are currently being distributed. To load an impact, unzip it into your impacts folder. If you don't know where that is, click 'Open Impacts Folder' on the Browse Impacts screen.

# how to build
1. clone the repo
2. ensure npm is configured on your system
3. `npm install`
4. `npm run package`
5. locate the installer in `release/build/Fung-Wa Frenzy Setup x.x.x.exe`
6. double-click the installer

For development purposes, you can run the app using a dev environment with `npm run start`. It will live refresh the app when changes are saved.

# make your own impact
Impacts begin with an `impact.json` file. It is designed to be easy to be created by hand. There are 4 main sections:
1. info
2. meta
3. blocks
4. music

## Info
The info section holds basic information about what the impact is. It expects only 3 values, but there are more optional values which you can add.
```json
"info": {
    "game": "Game Name", // required
    "title": "Impact Title", // required
    "subtitle": "Impact Subtitle", // required
    "description": "",
    "length": "",
    "author": "",
    "version": ""
}
```

## Meta
The meta section contains important information about how your impact should run. It expects only 2 values, but there are optional values you can provide to make your impact unique.
```json
"meta": {
    "flags": { // required
        "flag1": "int",
        "flag2": "bool"
    },
    "start": "0101", // required
    "chapters": [],
    "datafault": "",
    "diskfault": "",
    "color": ""
}
```
### Flags
Flags are variables which are tracked throughout a playthrough. They can be either an integer or a boolean, and named whatever you like. Declare them in the flag block; they are initialized to `0` or `false` by default. If you want a different starting value, you can set the flags in your `start` block.
### Start
Start should indicate what the beginning block of your impact should be.
### Chapters
While Debug Mode is enabled, you have access to a Debug Pane which allows you to skip directly to different "chapters". Specify those chapter blocks here.
### Datafault and Diskfault
When something goes wrong, the datafault and diskfault videos are fallback videos which occur so the player knows something has gone wrong, and the program can fail safely. Specify the paths for those videos here.
### Color
Determine the UI color for your impact here. Does not apply to the fullscreen theme. Available colors are "blue", "green", and "red".

## Blocks
The blocks section is the main data for your impact. It defines logical blocks of videos that the player will move between. This allows for video variants based on chance, or the player's flags for that playthrough.
```json
"blocks": {
    "0101": {
        "title": "Scene 1",
        "videos": [{
            "path": "0101.mp4",
            "title": "Scene 1",
            "timing": {
                "targets": 15,
                "loop": 20
            },
            "music": "01"
        }],
        "targets": [{
            "target": "0201",
            "text": "Go To Scene 2A"
        },
        {
            "target": "0202",
            "text": "Go To Scene 2B"
        },
        {
            "target": "0203",
            "text": "Go To Scene 2C"
        }]
    },
    "0201": {
        "title": "Scene 2A",
        "videos": [{
            "path": "0201.mp4",
            "title": "Scene 2A",
            "music": "01"
        }],
        "next": "0301"
    }
}
```
Blocks are identified by a string key, which can be whatever you like. Every block has a `title`, a `videos`, and either a `targets` or a `next`. Titles help you keep track of where things are in your impact, but they do not affect anything.

### Videos
`Videos` is an array of video objects. Even if there is only one video, it should still be in an array. Every video object has a `title`, and usually has a `path`. Video titles are written alongside saved games to help players find out which save they want to choose. Video paths point to that video's file within the impact's /video folder. You can use subfolders by entering a double-backslash (\\) as a separator. Video objects also have some optional properties:
- `path`: this is optional in the case that you have a block that only plays a video under certain circumstances. flags are still updated if no video plays, but the player is immediately taken to the next block.
- `chance`: a decimal value representing the percentage chance this video will be selected for this block. Does not work alongside `condition` videos.
- `condition`: a video that only plays if certain conditions are met. More on this below. Does not work alongside `chance` videos.
- `timing`: an object that defines various timing values for how the controls and background music should be handled. More on this below.
- `music`: the key for the background music that should be played during this video
- `flags`: an object that defines how various flags should be modified when this video is played. More on this below.
- `question`: a string that will be displayed above the game controls
- `targets`: per-video override for the block's `targets` or `next` property.
- `next`: per-video override for the block's `targets` or `next` property.

#### Conditions
Conditions use a nested structure to encode logical statements. Videos are evaluated in the order they are written, and the first video to return True is played. You can have a "default" video by not having any `condition` block on the final video for a block, as this will always return true.
The base condition block looks like this:
```json
"condition": {
    "type": "",
    "value": ""
}
```
`type` here can be many things. here is a list of supported conditions and what they do, as well as what to provide for their `value`:
- `SEEN`: returns whether a user has seen a particular block (by key). you can check if a user has seen a particular video variant by also including the video's path after the block's key (i.e. "0201 0201.mp4")
- `TIME`: returns whether a user loaded that video within a particular hour (UTC 24hour time). use integer comparison symbols (==, >=, <=, >, <).
- `STATE`: returns whether a user is in a certain U.S. state, as determined by their location setting for the game. use two-character state abbreviations.
- `[flag name]`: allows you to compare a flag to an integer, or to another flag. use integer comparison symbols, or if the flag is a boolean, use "true" and "false".
- `AND`: returns whether multiple conditions are true at once. expects an array of conditions as its value.
- `OR`: returns whether any one of many conditions are true. expects an array of conditions as its value.
- `NOT`: returns the opposite of a certain condition. expects another condition as its value.

#### Timing
Timing defines some important cues which are used to play your video. If your video has targets, please provide timings for `targets` when the buttons should show up, and `loop` at which point the video should loop back to when it ends. For music effects, use `music` to determine when music should start (the video will then begin in silence) and `silence` to determine when it should stop.

#### Flags
Flags is an object that modifies your flags when a video is played.
```json
"flags": {
    "flag1": "2+",
    "flag2": "true"
}
```
Provide an integer and an operator (+ or -) to modify the current flag value, or just an integer to set a flag to that value. For booleans, provide "true", "false", or "flip".

### Targets/Next
There are two ways by which a block moves to the next block. One is by the video ending, and the next video beginning. The other is by a user choice (clicking a target). `targets` defines what those buttons say and what they take the player, while a `next` defines what the next block to play is.
`targets` is an array of target objects. A target object always has a `target` and a `text`. It can also have a `flags` if clicking a certain button should update the player's flags.
`next` is just a block key string.

## Music
Background music plays separately from the foreground videos of an impact. It allows music to be played contiguously while many videos play and loop and skip around. Every song has a string key, a plaintext `title`, a `path` which points to its filename in /music, and a `volume` value from 0 to 100. Background music will loop on its own while the user plays. If you make two songs with the same path but different volumes, the volume will slowly fade from one value to the next to allow for audio ducking.
```json
"music": {
    "00": {
        "title": "Song 0",
        "path": "00.ogg",
        "volume": 20
    },
    "00l": {
        "title": "Song 0 Loud",
        "path": "00.ogg",
        "volume": 50
    }
}
```

# other info
To enable Debug Mode, open your settings.json folder and set "debug" to `true`. Hitting X on the Debug Pane will disable Debug Mode.

# credits
Overwhelming thanks to Jacob Bakilla, Thomas Bender, and the [synydyne](http://www.synydyne.com) crew for creating [Bear Stearns Bravo](https://www.bearstearnsbravo.com).
Thanks to [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) for jumpstarting this project.
Thanks to 400TACOS and HUNDOBILLION for keeping the flame lit. Thanks to LASERHAVER3 for the archive. <3