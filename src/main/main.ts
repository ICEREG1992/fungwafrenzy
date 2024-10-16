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
import { app, BrowserWindow, protocol, shell, ipcMain, net, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import { pathToFileURL } from 'url';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.on('open-impacts-path', (event, arg) => {
  shell.openPath(arg);
})

ipcMain.handle('get-defaultappdatapaths', () => {
  return [
    path.join(app.getPath('appData'), 'fungwafrenzy', 'impacts'),
    path.join(app.getPath('appData'), 'fungwafrenzy', 'saves'),
  ];
});

ipcMain.handle('load-usersettings', () => {
  const settingsFile = fs.readdirSync(path.join(app.getPath('appData'), 'fungwafrenzy')).filter(file => /^settings\.json/.test(file));
  if (settingsFile.length) {
    const userSettings = fs.readFileSync(path.join(app.getPath('appData'), 'fungwafrenzy', 'settings.json'), 'utf-8');
    const json = JSON.parse(userSettings);
    return json;
  } else {
    return null;
  }
});

ipcMain.handle('get-impacts', (e, p:string) => {
  const impactFolders = fs.readdirSync(p);
  const out: Array<object> = [];
  impactFolders.forEach(i => {
    const icons = fs.readdirSync(path.join(p,i)).filter(file => /^icon\.(png|jpg|jpeg|gif|webp})/.test(file));
    var image = "";
    if (icons.length) {
      const firstIcon = path.join(p,i,icons[0]);
      const imageBuffer = fs.readFileSync(firstIcon);
      image = `data:image/png;base64,` + imageBuffer.toString('base64');
    } else {
      image = "";
    }
    out.push({'key':i, 'image':image});
  });
  return out;
});

ipcMain.handle('get-impact', (e, i:string, p:string) => {
  const data = fs.readFileSync(path.join(p,i,"impact.json"), 'utf-8');
  const json = JSON.parse(data)
  return json;
});

ipcMain.handle('select-path', async (e, p:string) => {
  const res = await dialog.showOpenDialog(mainWindow as BrowserWindow, {
    properties: ['openDirectory'],
    defaultPath: p,
  });
  return res.filePaths[0];
})

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
  const appDataPath = path.join(app.getPath('appData'), 'fungwafrenzy', 'impacts');
  const savesPath = path.join(app.getPath('appData'), 'fungwafrenzy', 'saves');
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
  }
  if (!fs.existsSync(savesPath)) {
    fs.mkdirSync(savesPath, { recursive: true });
  }
}

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
    }
  }
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
    protocol.handle("impact", (request) => {
      const url = new URL(request.url);
      const searchParams = new URLSearchParams(url.search);
      const videoName = url.hostname;
      const rootPath = searchParams.get('path');
      const impactName = searchParams.get('impact');
      if (rootPath && impactName) {
        if (videoName.endsWith('.mp4')) {
          const basePath = path.join(rootPath, impactName, 'video');
          const filePath = path.join(basePath, videoName);
          console.log(filePath);
          return net.fetch(pathToFileURL(filePath).toString());
        } else {
          // assume this is audio for now
          const basePath = path.join(rootPath, impactName, 'music');
          const filePath = path.join(basePath, videoName);
          console.log(filePath);
          return net.fetch(pathToFileURL(filePath).toString());
        }
        
      } else {
        return net.fetch(""); // return junk idk fix this later
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
