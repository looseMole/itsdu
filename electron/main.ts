import { app, BrowserWindow, Menu, nativeTheme, protocol, session, Tray } from "electron"
import path from 'path'
import {
    AuthService,
    getItslearningOAuthUrl,
    ITSLEARNING_CLIENT_ID,
    ITSLEARNING_OAUTH_TOKEN_URL,
    REFRESH_ACCESS_TOKEN_INTERVAL,
} from "./services/itslearning/auth/auth-service.ts"
import darkModeHandlerInitializer from "./handlers/dark-mode-handlers.ts";
import appHandlerInitializer from "./handlers/app-handler.ts";
import initAuthIpcHandlers from "./handlers/auth-handler.ts";
import axios from "axios";
import { GrantType } from "./services/itslearning/auth/types/grant_type.ts";
import * as fs from "fs";
import { themeStore } from "./services/theme/theme-service.ts";
import { WindowOptionsService } from './services/window-options/window-options-service';
import { startProxyDevServer } from "./utils/proxy-dev-server.ts";
import initDownloadHandlers from "./handlers/download-handler.ts";

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')
const isDev = !app.isPackaged


let win: BrowserWindow | null
let authWindow: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

darkModeHandlerInitializer()
appHandlerInitializer()
initDownloadHandlers()
initAuthIpcHandlers()

const authService = AuthService.getInstance()
const startUpTheme = themeStore.get('theme')

protocol.registerSchemesAsPrivileged([{
    scheme: 'itsl-itslearning-file',
    privileges: {
        standard: true,
        secure: true
    }
}]);

// to load the application, setup and stuff
async function createMainWindow() {
    const windowService = new WindowOptionsService()
    const windowOptions = windowService.getWindowOptions()
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            devTools: isDev,
        },
        autoHideMenuBar: true,
        alwaysOnTop: false,
        minHeight: 640,
        minWidth: 800,
        // show: false,
        darkTheme: startUpTheme === 'dark',
        frame: false,
        ...windowOptions,
    })

    if (windowOptions.maximized) {
        win.maximize()
    }

    win.on('resize', () => {
        if (!win) return
        windowService.saveWindowOptions(win)
    })

    win.on('maximize', () => {
        if (!win) return
        windowService.saveWindowOptions(win)
    })

    win.on('unmaximize', () => {
        if (!win) return
        windowService.saveWindowOptions(win)
    })

    win.on('move', () => {
        if (!win) return
        windowService.saveWindowOptions(win)
    })


    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.show()
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    nativeTheme.on('updated', () => {
        const backgroundColor = nativeTheme.shouldUseDarkColors ? 'black' : 'white'
        win?.setBackgroundColor(backgroundColor)
    })

    if (VITE_DEV_SERVER_URL) {
        await win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        await win.loadFile(path.join(process.env.DIST, 'index.html'))
    }
}

async function createAuthWindow() {
    authWindow = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),
        autoHideMenuBar: true,
        resizable: false,
        height: 600,
        width: 800,
        // alwaysOnTop: true,
        darkTheme: startUpTheme === 'dark',
        focusable: true,
    })

    await authWindow.loadURL(getItslearningOAuthUrl())
    await authWindow?.webContents.executeJavaScript(`__doPostBack('ctl00$ContentPlaceHolder1$federatedLoginButtons$ctl00$ctl00','')`)
    setTimeout(async () => {
        await authWindow?.webContents.executeJavaScript(`document.getElementsByClassName('table')[0].click()`)
    }, 1000)
}

if (process.platform === 'win32') {
    app.setAppUserModelId('itslearning')
}

if (!app.isDefaultProtocolClient('itsl-itslearning')) {
    // Define custom protocol handler. Deep linking works on packaged versions of the application!
    app.setAsDefaultProtocolClient('itsl-itslearning')
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
})

const gotTheLock = app.requestSingleInstanceLock()
if (gotTheLock) {
    app.on('second-instance', (_, argv) => {
        console.log('second-instance', argv)
        // Someone tried to run a second instance, we should focus our window.
        if (win) {
            if (win.isMinimized()) {
                win.restore()
                win.focus()
            }
        }

        /*// Protocol handler for win32
        // argv: An array of the second instance’s (command line / deep linked) arguments
        if (process.platform == 'win32') {
            // Keep only command line / deep linked arguments
            const commandArgument = argv.slice(1)
            const regex = /itsl-itslearning:\/\/login\/\?state=damn&code=(.*)/gm;
            const matches = regex.exec(commandArgument.join(' '))
            if (matches) {
                deeplinkingUrl = matches[1]
            }
        }
        if (win) {
            logEverywhere('app.makeSingleInstance# ' + 'setting code to localStorage...')
            logEverywhere('app.makeSingleInstance# ' + 'code ' + deeplinkingUrl)
            win.webContents.executeJavaScript(`window.localStorage.setItem('code', '${deeplinkingUrl}')`)
        }*/
    })
} else {
    app.quit()
    win = null
}

app.on('will-finish-launching', function () {
    // Protocol handler for osx
    app.on('open-url', function (event, url) {
        event.preventDefault()
        /*deeplinkingUrl = url
        logEverywhere('open-url# ' + deeplinkingUrl)*/
    })
})

function logEverywhere(s: string) {
    console.log(s)
    win?.webContents.send('main-process-message', s)
}

function logEverywhereError(s: string) {
    console.error(s)
    win?.webContents.send('main-process-error', s)
}

app.whenReady().then(async () => {
    if (VITE_DEV_SERVER_URL) {
        await startProxyDevServer()
    }

    const ses = session.defaultSession
    ses.protocol.registerBufferProtocol('itsl-itslearning-file', (request, callback) => {
        // get image file path
        const url = request.url.replace('itsl-itslearning-file://', '')
        const filePath = path.join(process.env.VITE_PUBLIC, url)
        // read image file
        fs.readFile(filePath, (error, data) => {
            if (error) {
                console.error(`Failed to read ${filePath} on ${request.url}`)
                console.error(error)
            }
            const extension = path.extname(filePath).toLowerCase()
            let mimeType = ''
            if (extension === '.svg') {
                mimeType = 'image/svg+xml'
            } else if (extension === '.png') {
                mimeType = 'image/png'
            } else if (extension === '.jpg' || extension === '.jpeg') {
                mimeType = 'image/jpeg'
            } else if (extension === '.gif') {
                mimeType = 'image/gif'
            } else if (extension === '.webp') {
                mimeType = 'image/webp'
            }
            callback({ mimeType, data })
        })
    })

    // @ts-ignore
    protocol.handle('itsl-itslearning', async (req) => {
        const code = authService.getAuthCodeFromURI(req.url);
        if (code) {
            axios.post(ITSLEARNING_OAUTH_TOKEN_URL, {
                "grant_type": GrantType.AUTHORIZATION_CODE,
                "code": code,
                "client_id": ITSLEARNING_CLIENT_ID,
            }, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            }).then(async res => {
                const { access_token, refresh_token } = res.data
                authService.setToken('access_token', access_token)
                authService.setToken('refresh_token', refresh_token)
                authWindow?.close()
                await createMainWindow()
            }).catch(async err => {
                await createAuthWindow()
                logEverywhereError('protocol.handle# ' + err)
            })
        } else {
            await createAuthWindow()
        }
    })

    try {
        await authService.refreshAccessToken()
        await createMainWindow()
        // setup interval for refreshing access token
        setInterval(async () => {
            await authService.refreshAccessToken()
        }, REFRESH_ACCESS_TOKEN_INTERVAL) // 45 minutes
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show App', click: function (e) {
                    win?.show();
                    e.enabled = false
                }
            },
            {
                label: 'Quit', click: function () {
                    win?.close()
                    win?.destroy()
                    app?.exit(0)
                }
            }
        ]);

        win?.on('close', (e) => {
            e.preventDefault()
            if (!win) return
            // TODO: have some preferences and follow those
            require('electron').dialog.showMessageBox(win, {
                type: 'question',
                buttons: ['Yes', 'Minimize', 'No'],
                title: 'Confirm',
                message: 'Are you sure you want to quit?',
                icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),
                noLink: true,
            }).then(result => {
                if (result.response === 0) {
                    win?.close()
                    win?.destroy()
                    app.quit()
                } else if (result.response === 1) {
                    win?.hide()
                    contextMenu.items[0].enabled = true
                } else if (result.response === 2) {
                    e.preventDefault()
                }
            }).catch(err => {
                console.log(err)
                app.exit(0)
            })
        })

        const tray = new Tray(path.join(process.env.VITE_PUBLIC, 'icon.ico'))

        tray.on('double-click', () => {
            win?.show()
        })

        tray.setToolTip('itslearning')
        tray.on('right-click', () => {
            tray.focus()
            console.log(win?.isVisible())
            contextMenu.items[0].enabled = !win?.isVisible()
            tray.setContextMenu(contextMenu)
            setTimeout(() => {
                tray.popUpContextMenu(contextMenu)
            }, 250)
        })
    } catch (e) {
        await createAuthWindow()
    }
})
