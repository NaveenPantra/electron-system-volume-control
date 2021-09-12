const electron = require('electron')
const path = require('path')
let { exec, execFile } = require('child_process')

const { ipcMain, remote } = electron

function getMainWindow() {
  let mainWindow = null
  try {
    const window = remote.BrowserWindow.getAllWindows()
    mainWindow = window[1]
  } catch (err) {}
  return mainWindow
}

ipcMain.on('get-volume', () => {
  try {
    const mainWindow = getMainWindow()
    if (process.platform === 'win32') {
      let cmd = `${path.join(__dirname, 'executables\\windowsSystemVolume.exe')}`
      execFile(cmd, (err, stdout) => {
        if (err) {
        } else {
          let [volume, isMuted] = stdout.split(' ')
          volume = Number(volume)
          isMuted = Boolean(Number(isMuted))
          if (isMuted) {
            mainWindow?.webContents?.send?.('get-volume', 0)
          } else {
            mainWindow?.webContents?.send?.('get-volume', volume)
          }
        }
      })
    } else {
      exec(`osascript -e 'output muted of (get volume settings)'`, (err, stdout) => {
        if (err) {
        } else {
          if (stdout.startsWith('true')) {
            mainWindow?.webContents?.send?.('get-volume', 0)
            return
          }
          exec(`osascript -e 'output volume of (get volume settings)'`, (err, stdout) => {
            if (err) {
              // handle error
            } else {
              mainWindow?.webContents?.send?.('get-volume', stdout)
            }
          })
        }
      })
    }
  } catch (e) {}
})


ipcMain.on('set-volume', (event, volume) => {
  try {
    const mainWindow = getMainWindow()
    if (process.platform === 'win32') {
      const muteCommand = volume === 0 ? 'mute' : 'unmute'
      let cmd = `${path.join(__dirname, 'executables\\windowsSystemVolume.exe')}`
      execFile(cmd, [muteCommand], (err) => {
        if (err) {
        } else {
          cmd = `${path.join(__dirname, 'executables\\windowsSystemVolume.exe')}`
          execFile(cmd, [volume], (err, stdout) => {
            if (err) {
            } else {
              let [volume] = stdout.split(' ')
              volume = Number(volume)
              mainWindow?.webContents?.send?.('set-volume', volume)
            }
          })
        }
      })
    } else {
      exec(`osascript -e "set volume output volume ${volume}"`, (err, stdout) => {
        if (err) {
          // handle error
        } else {
          mainWindow?.webContents?.send?.('set-volume', stdout)
        }
      })
    }
  } catch (e) {}
})
