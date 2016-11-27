import { app, BrowserWindow } from 'electron';

app.on('ready', function(){
    let win = new BrowserWindow({
        autoHideMenuBar: false
    });
    win.loadURL(__dirname + '/index.html');
    win.show();
});

app.on('window-all-closed', function(){
    app.quit();
})