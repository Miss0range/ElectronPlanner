const {contextBridge, ipcMain,ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');

//close pop window
const closeWin = (windName) =>{
    ipcRenderer.send("window:close",windName);
}

const openWin = (windName) =>{
    ipcRenderer.send("window:open",windName);
}


//mainWindow function 
const addItem = (item,tState,init) => {
    ipcRenderer.on("item:add", item,tState,init)
}


//ask if edit
const editByIndex = (index, tState)=>{
    ipcRenderer.send("task:askEdit", index,tState);
}

//received new content for task edited
const editItem = (item) =>{
    ipcRenderer.on("item:edit",item)
}

const finishByIndex = (index) =>{
    ipcRenderer.send("task:done", index);
}

const unFinishByIndex = (index) =>{
    ipcRenderer.send("task:undone", index);
}

//ask if remove
const removeByIndex = (index,tState) =>{
    ipcRenderer.send("task:askRemove",index,tState);
}

//remove Confirmed task
const removeConfirmedItem = (confirmation) => {
    ipcRenderer.on("item:remove", confirmation);
}

//main Window: send request of refresh (actually, reload) 3 list displayed 
const refreshList = () =>{
    ipcRenderer.send("task:refresh");
}

//request full list of tasks for calendar page 
const requestCalendarList = () => {
    ipcRenderer.send("calendar: request");
}

//send full list of tasks for calendar page 
const sendCalendarList = (tList, dList, pList) => {
    ipcRenderer.on("calendar:send", tList, dList, pList);
}

//addWindow function
const sendTask = (taskInfo) =>{
    ipcRenderer.send("task:add", taskInfo);
}

//delWindow function
const sendConfirm = (confirmation) =>{
    ipcRenderer.send("del:confirm", confirmation);
}

//edit window function : send modify item info to edit Window
const askEdit = (item) =>{
    ipcRenderer.on('request:edit',item);
}

//editWindow function: send confirmation to main process to remove task
const confirmEdit = (item) =>{
    ipcRenderer.send('edit:confirm',item);
}


let indexBridge = {
    //general
    openWin : openWin,
    closeWin : closeWin,
    //mainWin
    //main process => main Window
    addItem : addItem,
    editItem : editItem,
    removeConfirmedItem : removeConfirmedItem,
    //main Window => main process
    finishByIndex : finishByIndex,
    unFinishByIndex : unFinishByIndex,
    editByIndex : editByIndex,
    removeByIndex : removeByIndex,
    refreshList : refreshList,
    //calendar page 
    //main Window => main process
    requestCalendarList : requestCalendarList,
    //main process => main Window
    sendCalendarList : sendCalendarList,
    //addWin
    //addWin => main process
    sendTask : sendTask,
    //delWin
    //delWin = > main process
    sendConfirm : sendConfirm,
    //editWin 
    //main process => editWin
    askEdit : askEdit,
    confirmEdit : confirmEdit
    
}


contextBridge.exposeInMainWorld("api", indexBridge);


