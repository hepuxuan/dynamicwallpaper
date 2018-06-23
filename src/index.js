const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const AutoLaunch = require('auto-launch');
const path = require('path');
const {
  setWallpaper,
  updateZipCode,
  updateCountry,
  getZipcode,
} = require('./wallpaper');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const init = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'favicon.ico'),
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  const appIcon = new Tray(path.join(__dirname, 'icon.png'));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
      },
    }, {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  appIcon.setContextMenu(contextMenu);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('show', () => {
    appIcon.setHighlightMode('always');
  });

  if (getZipcode()) {
    mainWindow.hide();
  }

  setWallpaper();

  setInterval(setWallpaper, 30 * 60 * 1000);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', init);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('zipcode-update', (event, arg) => {
  // Reply on async message from renderer process
  updateZipCode(arg);
  setWallpaper();
});

ipcMain.on('country-update', (event, arg) => {
  // Reply on async message from renderer process
  updateCountry(arg);
  setWallpaper();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const autoLauncher = new AutoLaunch({
  name: 'dynamicwallpaper',
});

ipcMain.on('get-autoboot', (event) => {
  autoLauncher.isEnabled().then((isEnabled) => {
    event.sender.send('update-autoboot', isEnabled);
  });
});


ipcMain.on('update-autorun', (event, arg) => {
  autoLauncher.isEnabled()
    .then((isEnabled) => {
      if (arg) {
        if (isEnabled) {
          return;
        }
        console.log('enable');
        autoLauncher.enable();
      } else {
        if (!isEnabled) {
          return;
        }
        console.log('disable');
        autoLauncher.disable();
      }
    }).catch(() => {});
});
