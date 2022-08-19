let ul = null;
const cset1 = ["#FFB7B2","#FFDAC1","#E2F0CB","#B5EAD7","#C7CEEA"];
const cset2 = ["#A9D1EA","#C6E1F2","#E1F0FA","#e8ebf2","#F7E0E3","#FDB7C2","#E68FAE"];
let displayTag = "tag-todo";
let displayDiv = "list-todo";

document.getElementById(displayTag).click();
document.getElementById("menu-calendar").addEventListener("click",loadCalendar);


function loadToDoList(e){
    let calendarPage = document.getElementById("calendar-page");
    let todoPage = document.getElementById("list-page");
    calendarPage.style.display = "none";
    todoPage.style.display = "block";
    
    e.target.removeEventListener('click',loadToDoList);
    document.getElementById("menu-calendar").addEventListener("click",loadCalendar);
    document.getElementById("scroll-btn").style.display = "none";
}

function loadCalendar(e){
    let calendarPage = document.getElementById("calendar-page");
    let todoPage =document.getElementById("list-page");
    todoPage.style.display = "none";
    calendarPage.style.display = "grid";
    e.target.removeEventListener('click',loadCalendar);
    document.getElementById("menu-list").addEventListener("click",loadToDoList);
    scrBtn = document.getElementById("scroll-btn")
    scrBtn.style.display = "block";
    scrBtn.style.left = (window.innerWidth - 2*scrBtn.offsetWidth) +"px";
    scrBtn.style.top = (window.innerHeight - 2*scrBtn.offsetHeight) +"px";
    getListsForCalendar();
}


// Add item
window.api.addItem((e,item,tState,init) => {
    const {tName,days,hours,mins} = item;
    switch(tState){
        case "todo":
            ul = document.querySelector('#list-todo');
            break;
        case "done":
            ul = document.querySelector('#list-done');
            break;
        case "past":
            ul = document.querySelector('#list-past');
            break;
        default:
            console.error(`tState ${tState} Incorrect`);
    }


    // ul.className = 'collection';
    const li = document.createElement('li');
    // li.className = 'collection-item';
    const container = document.createElement('div');
    container.className = 'grid-container';
    //Add task description
    const divText = document.createElement('div');
    divText.className = 'task-name';
    divText.innerText = tName;
    //Add task time
    const divTime = document.createElement('div');
    divTime.className = 'task-time';
    const divTimeText = document.createElement('div');
    divTimeText.className = 'task-time-text';

    //create containter on right of task for time and buttons
    const tbContainer = document.createElement('div');
    tbContainer.className = 'tbContainer';

    //Add buttons
    const  buttons = document.createElement('div');
    buttons.className = 'btnContainer';
    //finish button
    let  checkB = null;
    //delete button
    const  delB = document.createElement('span');
    delB.className = 'del-btn';
    delB.addEventListener('click',askRemoveItem);
    //edit button
    let  editB = null;
    

    //set time text background color wrt time
    let cset = cset1;
    if(days < 3){
        divTimeText.style.backgroundColor = cset[0];
    }else if(days<5){
        divTimeText.style.backgroundColor = cset[1];
    }else if(days<8){
        divTimeText.style.backgroundColor = cset[2];
    }else if(days<13){
        divTimeText.style.backgroundColor = cset[3];
    }else{
        divTimeText.style.backgroundColor = cset[4];
    }
    if(tState == "past"){
        let formatHours = Number(hours.slice(0,2));
        let suffix = '';
        if(formatHours > 11){
            suffix = "pm";
        }else{
            suffix = "am";
        }
        divTimeText.innerText = days.slice(2,) + ' ' + formatHours.toString() + suffix;
        divTimeText.style.backgroundColor = "#d9d9d9";
    }else{

        //format numbers
        const timeString  = timeStringFromNumbers(days,hours,mins);
        divTimeText.innerText = timeString;
        checkB = document.createElement('span');
        if(tState == "todo"){
            checkB.className = 'finish-btn';
            checkB.addEventListener('click',finishTask);
        }
        else if(tState == "done"){
            checkB.className = 'unfinish-btn';
            checkB.addEventListener('click',undoFinishTask);
        }
        editB = document.createElement('span');
        editB.className = "edit-btn";
        editB.addEventListener('click',editTask);

        buttons.appendChild(checkB);
        buttons.appendChild(editB);
        
    }
    buttons.appendChild(delB);
    

    container.appendChild(divText);

    divTime.appendChild(divTimeText);
    tbContainer.appendChild(divTime);
    tbContainer.appendChild(buttons);
    container.appendChild(tbContainer);

   
    //tleftText.style.textAlign = 'right';
    li.appendChild(container);
    ul.appendChild(li);
    if(init == 0){
        sortUl(ul);
    }
    return 0;
});


function sortUl(ul){
    let ulLi = Array.from(ul.children);
    ulLi.sort((a,b) =>{
        a = Array.from(Array.from(Array.from(a.children)[0].children)[1].children)[0].innerText.split(':').join('');
        b = Array.from(Array.from(Array.from(b.children)[0].children)[1].children)[0].innerText.split(':').join('');
        return a > b ? 1 : a < b ? -1 : 0;
    })
    ul.innerHTML = "";
    ulLi.forEach((element)=> ul.appendChild(element));

}

function timeStringFromNumbers(days,hours,mins){
    const formatDays = days.toLocaleString('en-US',{
        minimumIntegerDigits: 2,
        useGrouping: false
    });
    const formatHours = hours.toLocaleString('en-US',{
        minimumIntegerDigits: 2,
        useGrouping: false
    });
    const formatMins = mins.toLocaleString('en-US',{
        minimumIntegerDigits: 2,
        useGrouping: false
    });
    return `${formatDays}:${formatHours}:${formatMins}`;
}


//open a tag
function openTag(e,thisDiv){
    //hide the previous div.
    containerPre = document.getElementById(displayDiv).parentNode;
    containerPre.style.display = "none";
    //Enable previous tag.
    tagPre = document.getElementById(displayTag);
    tagPre.disabled = false;

    //disable the tag. 
    e.target.disabled = true;
    //get div to display.
    container = document.getElementById(thisDiv).parentNode;
    container.style.display = "block";
    
    //Set new display tag and div
    displayDiv = thisDiv;
    displayTag = e.target.id;
}


function finishTask(e){
    const finishedContainer = e.target.parentNode.parentNode.parentNode.parentNode;
    const index = Array.from(finishedContainer.parentElement.children).indexOf(finishedContainer);
    window.api.finishByIndex(index);
    ul = document.querySelector('#list-done');
    ul.appendChild(finishedContainer);
    e.target.checked = false;
    e.target.removeEventListener('click',finishTask);
    e.target.addEventListener('click',undoFinishTask);
    e.target.className = "unfinish-btn";
}

function undoFinishTask(e){
    const unfinishedContainer = e.target.parentNode.parentNode.parentNode.parentNode;
    const index = Array.from(unfinishedContainer.parentElement.children).indexOf(unfinishedContainer);
    window.api.unFinishByIndex(index);
    ul = document.querySelector('#list-todo');
    ul.appendChild(unfinishedContainer);
    e.target.checked = false;
    e.target.removeEventListener('click',undoFinishTask);
    e.target.addEventListener('click',finishTask);
    e.target.className = "finish-btn";
}

let editContainer = null;

function editTask(e){
    window.api.openWin("edit");
    editContainer = e.target.parentNode.parentNode.parentNode.parentNode;
    const index = Array.from(editContainer.parentElement.children).indexOf(editContainer);
    const tState = editContainer.parentNode.id;
    window.api.editByIndex(index,tState);
}

window.api.editItem((e,item)=>{
    const {tName,days,hours,mins} = item;
    const container = Array.from(editContainer.children)[0];
    const taskName = Array.from(container.children)[0];
    taskName.innerText = tName;
    const taskTime = Array.from(Array.from(Array.from(container.children)[1].children)[0].children)[0];
    const taskTimeString = timeStringFromNumbers(days,hours,mins);
    taskTime.innerText = taskTimeString;
    //reset the last div edited to null for garbage collection
    editContainer = null;
});

let removedContainer = null;

function askRemoveItem(e){
    window.api.openWin("del");
    removedContainer = e.target.parentNode.parentNode.parentNode.parentNode;
    const index = Array.from(removedContainer.parentElement.children).indexOf(removedContainer);
    const tState = removedContainer.parentNode.id;
    window.api.removeByIndex(index,tState);
}

window.api.removeConfirmedItem((e,confirmation)=>{
    if(confirmation){
        removedContainer.remove();
    }
    removedContainer = null;
})


//open addItem window
function addItem(e){
    window.api.openWin("add");
}

//refresh list 
function refreshList(e){
    console.log("refresh");
    document.getElementById("list-todo").innerHTML = "";
    document.getElementById("list-done").innerHTML = "";
    document.getElementById("list-past").innerHTML = "";
    window.api.refreshList();
}

//Auto refresh page every 10 minutes
setInterval(refreshList,1000*60*10);

//Timer page 

let workTime = document.querySelector("#work-timer");

let timerInterval = null;

function startCount(e){
    timerInterval = setInterval(countDownWork,1000);
}

function stopCount(){
    clearInterval(timerInterval);
}

function countDownWork(){
    let workTimeString = workTime.innerHTML;
}

//Calendar page


const calendarContainer = document.getElementById("calendar-page");
let calendarUls1 = [];
let calendarUls2 = [];
const weekDays = ["Sun","Mon","Tue","Wed","Thu", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let baseDate1 = new Date();
let baseDate2 = null;
let taskList,doneList, pastList= null;

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function getListsForCalendar(){
    calendarContainer.innerHTML = "";
    window.api.requestCalendarList();
}

window.api.sendCalendarList((e,tList, dList, pList)=>{
    baseDate2 = baseDate1.addDays(7);
    taskList = tList;
    doneList = dList;
    pastList = pList;
    calendarUls1 = constructCalendars(baseDate1);
    calendarUls2 = constructCalendars(baseDate2); 
    constructList(taskList, "todo");
    constructList(doneList, "done");
    if(baseDate1 < new Date()){
        constructList(pastList,"past");
    }
});

function constructCalendars(baseDate){
    date = baseDate;
    let uls = [];
    for(let i=0 ; i <7; i++){
        let newCanlendar = document.createElement("div");
        newCanlendar.className = "calendar";
        let newDate= document.createElement("div");
        newDate.className = "date";
        newDate.innerText = date.toDateString().slice(0,10);
        newDate.style.backgroundColor = cset2[date.getDay()];
        date = date.addDays(1);
        newCanlendar.appendChild(newDate);
        //add 
        let newUl = document.createElement("ul");
        uls.push(newUl);
        newCanlendar.appendChild(newUl);
        calendarContainer.appendChild(newCanlendar);
    }
    return uls;
}

function constructList(list, state){
    let index = 0;
    let ulList = [...calendarUls1,...calendarUls2];
    let curDate = baseDate1;
    while(list.length > 0 && index < 14){
        if(list[0].tDate < curDate.toLocaleDateString("en-ca")){
            list.shift();
        }else if(list[0].tDate == curDate.toLocaleDateString("en-ca")){
            let li = document.createElement("li");
            li.innerText = list[0].tName + " " + list[0].tTime; 
            //set style according to state
            if(state == "todo"){
                li.style.backgroundColor = "#F1DEC2";
                li.style.borderColor = "#F1DEC2";
            }else if(state == "done"){
                li.style.borderWidth = "2px";
                li.style.borderColor = "black";
            }else{
                li.style.backgroundColor = "#D4CFC9";
                li.style.borderColor = "#D4CFC9";
            }
            ulList[index].appendChild(li);
            list.shift();
        }else{
            index++;
            curDate = curDate.addDays(1);
        }
    }
}


function calendarScrollUp(){
    if(mouseMoved){
        mouseMoved = false;
    }else{
        baseDate2 = baseDate1;
        baseDate1 = baseDate1.addDays(-7);
        calendarContainer.innerHTML = "";
        window.api.requestCalendarList();
    }
}

function calendarScrollDown(){
    if(mouseMoved){
        mouseMoved = false;
    }else{
        baseDate1 = baseDate2;
        baseDate2 = baseDate2.addDays(7);
        calendarContainer.innerHTML = "";
        window.api.requestCalendarList();
    }
}

document.addEventListener('DOMContentLoaded',(e)=>{
    let scrBtn = document.getElementById("scroll-btn");
    scrBtn.style.left = (window.innerWidth - 2*scrBtn.offsetWidth) +"px";
    scrBtn.style.top = (window.innerHeight - 2*scrBtn.offsetHeight) +"px";
    dragElement(scrBtn);
});

document.getElementById("btn-up").addEventListener('click',calendarScrollUp);
document.getElementById("btn-down").addEventListener('click',calendarScrollDown);

//drag calendar scroll button 
let mouseMoved = false;


function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    mouseDownFired = true;
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    mouseMoved =true;
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    //elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";


    if((elmnt.offsetLeft - pos1) < 0){
        elmnt.style.left = "0px";
    }else if((elmnt.offsetLeft - pos1 + elmnt.offsetWidth)> window.innerWidth){
        elmnt.style.left = (window.innerWidth - elmnt.offsetWidth) + "px";
    }else{
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}