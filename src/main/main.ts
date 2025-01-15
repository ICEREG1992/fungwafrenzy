/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path, { resolve } from 'path';
import fs from 'fs';
import {
  app,
  BrowserWindow,
  protocol,
  shell,
  ipcMain,
  net,
  dialog,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import { pathToFileURL } from 'url';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { userSettings, SaveGame } from '../renderer/interfaces';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let readyToClose: boolean = true;
ipcMain.on('block-close', () => {
  readyToClose = false;
});

ipcMain.on('allow-close', () => {
  readyToClose = true;
});

ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.on('open-path', (event, arg) => {
  shell.openPath(arg);
});

// Handle 'toggle-fullscreen' message from the renderer process
ipcMain.on('toggle-fullscreen', (event, isFullscreen: boolean) => {
  if (mainWindow) {
    if (isFullscreen) {
      mainWindow.setFullScreen(true); // Enter fullscreen
    } else {
      mainWindow.setFullScreen(false); // Exit fullscreen
    }
  }
});

ipcMain.handle('get-defaultappdatapaths', () => {
  return [
    path.join(app.getPath('appData'), 'fungwafrenzy', 'impacts'),
    path.join(app.getPath('appData'), 'fungwafrenzy', 'saves'),
  ];
});

ipcMain.handle('save-usersettings', (e, s: userSettings) => {
  const filePath = path.join(
    app.getPath('appData'),
    'fungwafrenzy',
    'settings.json',
  );
  try {
    // Convert the object to a JSON string
    const jsonData = JSON.stringify(s, null, 2); // The `null, 2` adds pretty printing to the JSON file
    // Write the JSON data to the file
    fs.writeFileSync(filePath, jsonData, 'utf-8');
    console.log(`Data successfully saved to ${filePath}`);
  } catch (error) {
    console.error(`Failed to save file: ${error}`);
  }
});

ipcMain.handle('save-savedata', (e, s: SaveGame, p: string) => {
  console.log('saving game...');
  const filePath = path.join(p, `${s.date.getTime()}.json`);
  try {
    // Convert the object to a JSON string
    const jsonData = JSON.stringify(s, null, 2); // The `null, 2` adds pretty printing to the JSON file
    // Write the JSON data to a new file
    fs.writeFileSync(filePath, jsonData, 'utf-8');
    console.log(`Data successfully saved to ${filePath}`);
  } catch (error) {
    console.error(`Failed to save file: ${error}`);
  }
});

ipcMain.handle('load-usersettings', () => {
  const settingsFile = fs
    .readdirSync(path.join(app.getPath('appData'), 'fungwafrenzy'))
    .filter((file) => /^settings\.json/.test(file));
  if (settingsFile.length) {
    const userSettings = fs.readFileSync(
      path.join(app.getPath('appData'), 'fungwafrenzy', 'settings.json'),
      'utf-8',
    );
    const json = JSON.parse(userSettings);
    return json;
  } else {
    return null;
  }
});

ipcMain.handle('get-impacts', (e, p: string) => {
  const impactFolders = fs.readdirSync(p);
  const out: Array<object> = [];
  impactFolders.forEach((i) => {
    const icons = fs
      .readdirSync(path.join(p, i))
      .filter((file) => /^icon\.(png|jpg|jpeg|gif|webp})/.test(file));
    let image = '';
    if (icons.length) {
      const firstIcon = path.join(p, i, icons[0]);
      const imageBuffer = fs.readFileSync(firstIcon);
      image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } else {
      image = '';
    }
    out.push({ key: i, image });
  });
  return out;
});

ipcMain.handle('get-saves', (e, p: string) => {
  const saves = fs.readdirSync(p);
  const out: Array<object> = [];
  saves.forEach((save) => {
    const saveBuffer = fs.readFileSync(path.join(p, save), 'utf-8');
    const json = JSON.parse(saveBuffer);
    out.push(json);
  });
  return out;
});

ipcMain.handle('get-savedata', (e, s: string, p: string) => {
  const data = fs.readFileSync(path.join(p, `${s}.json`), 'utf-8');
  const json = JSON.parse(data);
  return json;
});

ipcMain.handle('get-impact', (e, i: string, p: string) => {
  const data = fs.readFileSync(path.join(p, i, 'impact.json'), 'utf-8');
  const json = JSON.parse(data);
  return json;
});

ipcMain.handle('select-path', async (e, p: string) => {
  const res = await dialog.showOpenDialog(mainWindow as BrowserWindow, {
    properties: ['openDirectory'],
    defaultPath: p,
  });
  return res.filePaths[0];
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const ensureAppDataDir = () => {
  const appDataPath = path.join(
    app.getPath('appData'),
    'fungwafrenzy',
    'impacts',
  );
  const savesPath = path.join(app.getPath('appData'), 'fungwafrenzy', 'saves');
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
  }
  if (!fs.existsSync(savesPath)) {
    fs.mkdirSync(savesPath, { recursive: true });
  }
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', async (e) => {
    if (!readyToClose) {
      e.preventDefault(); // Prevent the default close action
      console.log('exit intercepted');
      // Send a message to the renderer and wait for a response
      mainWindow?.webContents.send('ask-to-close');
    }
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Kill menu with weird workaround
  mainWindow.removeMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'impact',
    privileges: {
      bypassCSP: true,
      stream: true,
    },
  },
]);
/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    ensureAppDataDir();
    // create custom file protocol to serve videos

    protocol.handle('impact', async (request) => {
      const url = new URL(request.url);
      const { searchParams } = url;
      const videoName = decodeURIComponent(url.hostname);
      const rootPath = searchParams.get('path');
      const impactName = searchParams.get('impact');

      if (rootPath && impactName) {
        let basePath;
        let filePath;
        let contentType;
        console.log(videoName);
        if (videoName.endsWith('.mp4')) {
          basePath = path.join(rootPath, impactName, 'video');
          filePath = path.join(basePath, videoName);
          contentType = 'video/mp4';
        } else {
          basePath = path.join(rootPath, impactName, 'music');
          filePath = path.join(basePath, videoName);
          contentType = 'audio/mpeg'; // Assuming audio is in MP3 format
        }

        try {
          const stat = fs.statSync(filePath);
          const fileSize = stat.size;

          // Retrieve the "range" header from the request
          const range = request.headers.get('range');

          if (range) {
            // Parse the range header
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            if (start >= fileSize || end >= fileSize) {
              // Return 416 if the range is not satisfiable
              return new Response('Requested Range Not Satisfiable', {
                status: 416,
                headers: {
                  'Content-Range': `bytes */${fileSize}`,
                },
              });
            }

            const chunksize = end - start + 1;

            // Use Node.js Buffer to read the file chunk manually
            const fileChunk = await new Promise<Buffer>((resolve, reject) => {
              const buffer = Buffer.alloc(chunksize);
              const fileStream = fs.createReadStream(filePath, { start, end });
              let bytesRead = 0;

              fileStream.on('data', (chunk: Buffer) => {
                chunk.copy(buffer, bytesRead);
                bytesRead += chunk.length;
              });

              fileStream.on('end', () => resolve(buffer));
              fileStream.on('error', (err) => reject(err));
            });

            return new Response(fileChunk, {
              status: 206,
              headers: {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize.toString(),
                'Content-Type': contentType,
              },
            });
          } else {
            // Serve the whole file
            const fileBuffer = fs.readFileSync(filePath);

            return new Response(fileBuffer, {
              headers: {
                'Content-Length': fileSize.toString(),
                'Content-Type': contentType,
              },
            });
          }
        } catch (err) {
          console.error('Error reading file:', err);
          return new Response('File not found', { status: 404 });
        }
      } else {
        return net.fetch(''); // return junk idk fix this later
      }
    });

    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
