const electron = require('electron');
const url = require('url');
const path = require('path');
const { type } = require('os');
const TaskStorage = require('./storage.js');

const {app,BrowserWindow,Menu,ipcMain} = electron;
const { webContents } = require('electron');

// SET ENV 
//process.env.NODE_ENV = 'production';

let mainWindow = null;
let addWindow = null;
let editWindow = null;
let delWindow = null;

//indicate which page is loaded
//

let taskList = [];
let doneList = [];
let pastList = [];

// Listen for app to be ready
app.on('ready',function(){
    //Create new window
    mainWindow = new BrowserWindow({
        //autoHideMenuBar:true,
        webPreferences: {
            //defaultFontFamily: "monospace",
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule:false,
            preload: path.join(__dirname,"preload.js")
        },
    });
    //Load storage json file
    file = new TaskStorage(path.join(app.getPath('userData'),'./task.json'));

    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'web/mainWindow.html'),
        protocol:'file',
        slashes: true
    }));
    //load tasks from json file.
    mainWindow.webContents.on('dom-ready',()=>{
        loadMainPage(file);
    });
    //Show window on ready.
    mainWindow.once('ready-to-show', ()=>{
        //mainWindow.removeMenu();
        mainWindow.show();
    });

    // Quit app when closed
    mainWindow.on('closed',function(){
        mainWindow = null;
        const newStorage = {
            todo:taskList,
            done:doneList,
            past:pastList
        }
        file.writeTask(newStorage);
        app.quit()
    })
    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});

//open add task window
function createAddWindow(){
    //Create new window if window has not been created
    if(addWindow === null){
        addWindow = new BrowserWindow({
            width: 400,
            height: 330,
            title:"Add Item",
            parent: mainWindow,
            frame:false,
            modal:true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule:false,
                preload: path.join(__dirname,"preload.js")
            }
        });
        //Load html into window
        addWindow.loadURL(url.format({
           // pathname: path.join(__dirname,'web/addWindow.html'),
            pathname: path.join(__dirname,'web/addTask.html'),
            protocol:'file',
            slashes: true
        }))
        //Garbage collection handle
        addWindow.on('close',function(){
            addWindow = null;
        })
    }
}

//open edit task window
function createEditWindow(){
    //Create new window if window has not been created
    if(editWindow === null){
        editWindow = new BrowserWindow({
            width: 400,
            height: 330,
            title:"Add Item",
            parent: mainWindow,
            frame:false,
            modal:true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule:false,
                preload: path.join(__dirname,"preload.js")
            }
        });
        //Load html into window
        editWindow.loadURL(url.format({
            pathname: path.join(__dirname,'web/editTask.html'),
            protocol:'file',
            slashes: true
        }))
        //Garbage collection handle
        editWindow.on('close',function(){
            editWindow = null;
        })
    }
}

//Open delete task window
function createDeleteWindow(){
    //Create new window if window has not been created
    if(delWindow === null){
        delWindow = new BrowserWindow({
            width: 400,
            height: 240,
            title:"Delete Item",
            parent: mainWindow,
            frame:false,
            modal:true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule:false,
                preload: path.join(__dirname,"preload.js")
            }
        });
        //Load html into window
        delWindow.loadURL(url.format({
            pathname: path.join(__dirname,'web/deleteTask.html'),
            protocol:'file',
            slashes: true
        }))
        //Garbage collection handle
        delWindow.on('close',function(){
            delWindow = null;
        })
    }
}

//support function for mainWindow (list page)

//load Tasks from json file
function loadMainPage(file){
    //read stored task from task.json
    file = new TaskStorage(path.join(app.getPath('userData'),'./task.json'));
    let lists = file.readTask();
    if(lists !== null){
        taskList = lists.todo;
        doneList = lists.done;
        pastList = lists.past;
    }
    updateAndPopulate();
}


//update taskList and doneList up to date and populate 3 list on renderer
function updateAndPopulate(){
    //update 2 list
    taskListUpdate(taskList);
    taskListUpdate(doneList);
    //sort pastList 
    pastList.sort(sortOrder);
    //populate list on screen
    populateList(taskList,"todo");
    populateList(doneList,"done");
    populateList(pastList,"past");
}

//Convert mil seconds to {days,hours,}
function milToDate(item){
    const {tName,tDate,tTime} = item;
    const d = new Date(tDate + "T" + tTime + ":00");
    const now = Date.now();
    const milsec = d.getTime() - now;
    let days = 0;
    let hours = 0;
    let mins = 0;
    if(milsec>0){
        days = Math.floor(milsec/ 86400000);
        hours = Math.floor((milsec - days * 86400000)/3600000);
        mins = Math.floor((milsec - days * 86400000 - hours * 3600000)/60000);
    }else{
        days = tDate;
        hours = tTime;
        mins = -1;
    }
    return {tName,days,hours,mins}; 
}

//update the task list according to 
function taskListUpdate(modifiedList){
    const now = Date.now();
    for(let i=modifiedList.length-1;i>=0;i--){
        const {tName,tDate,tTime} = modifiedList[i];
        const d = new Date(tDate + "T" + tTime + ":00");
        if(d.getTime() <= now){
            pastList.push(modifiedList[i]);
            modifiedList.splice(i,1);
        }
    };
}

//Load Task lists content on main window
function populateList(thisList,tState){
    thisList.forEach((element,index,arr) => {
        const {tName,days,hours,mins} = milToDate(element);
        mainWindow.webContents.send('item:add',{tName,days,hours,mins},tState,1);
    });
}

//

//Use function below to catch event from/send event to frontends.

//Catch item:add
ipcMain.on('task:add',function(e,item){
    //convert dates to timeleft
    const {tName,days,hours,mins} = milToDate(item);
    //Add property id to item
    taskList.push(item);
    taskList.sort(sortOrder);
    mainWindow.webContents.send('item:add',{tName,days,hours,mins},"todo",0);
    addWindow.close();
});

//Catch item:done 
ipcMain.on("task:done", (e,index)=> {
    doneList.push(taskList[index]);
    doneList.sort(sortOrder);
    taskList.splice(index,1);
})

//Catch item:undone 
ipcMain.on("task:undone", (e,index)=> {
    taskList.push(doneList[index]);
    taskList.sort(sortOrder);
    doneList.splice(index,1);
})

//Catch open window
ipcMain.on('window:open',function(e,windName){
    if(windName === "add")
        createAddWindow();
    if(windName === "del")
        createDeleteWindow();
    if(windName === "edit")
        createEditWindow();
});

//Catch close window
ipcMain.on('window:close',function(e,windName){
    if(windName === "add")
        addWindow.close();
    if(windName === "del")
        delWindow.close();
    if(windName === "edit")
        editWindow.close();
});

//Catch edit task by name of list and index
ipcMain.on("task:askEdit",function(e,index,tState){
    lastIndex = index;
    lastTState = tState;
    let item = null;
    if(lastTState == "list-todo"){
        item = taskList[lastIndex];
    }
    else if(lastTState == "list-done"){
        item = doneList[lastIndex];

    }
    editWindow.webContents.on('dom-ready',()=>{
        editWindow.webContents.send('request:edit',item);
    });

});

//Catch modified task returned by editWindow
ipcMain.on("edit:confirm", (e,item) =>{
    let newItem = null;
    if(item !== null){
        if(lastTState == "list-todo"){
            taskList[lastIndex]=item;
            taskList.sort(sortOrder);
        }
        else if(lastTState == "list-done"){
            doneList[lastIndex]=item;
            doneList.sort(sortOrder);
        }
        newItem = milToDate(item);
    }
    lastIndex = null;
    lastTState = null;
    mainWindow.webContents.send("item:edit",newItem);
})

//Catch remove task by index
let lastIndex = null;
let lastTState = null;
ipcMain.on("task:askRemove",function(e,index,tState){
    lastIndex = index;
    lastTState = tState;
});


//Catch confirmation returned by delwindow
ipcMain.on("del:confirm", (e,boo) =>{
    if(boo){
        if(lastTState == "list-todo"){
            taskList.splice(lastIndex,1);
        }
        else if(lastTState == "list-done"){
            doneList.splice(lastIndex,1);
        }
        else if(lastTState == "list-past"){
            pastList.splice(lastIndex,1);
        }
    }
    lastIndex = null;
    lastTState = null;
    mainWindow.webContents.send("item:remove",boo);
})

//catch task list request from main window for load calendar
ipcMain.on("calendar: request",(e)=>{
    mainWindow.webContents.send("calendar:send",taskList,doneList,pastList);
});

//catch mainWindow refresh request
ipcMain.on("task:refresh",(e)=>{
    updateAndPopulate();
});
    

function sortOrder(a,b){
    a = a.tDate.split('-').join('') + a.tTime.split(":").join('');
    b = b.tDate.split('-').join('') + b.tTime.split(":").join('');
    return a > b ? 1 : a < b ? -1 : 0;
}
//other

//Create menu template
const mainMenuTemplate = [
    {
        label:"File",
        submenu:[
            {
                label:'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label:'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label:'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                'Ctrl+Q',
                click(){
                    app.quit()
                }
            }
        ]
    }
];

//If mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod 
if(process.env.NODE_ENV !=='production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' :
                'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role:'reload'
            }
        ]
    });
}

