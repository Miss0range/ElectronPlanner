let curTime = new Date();
//'en-ca' date format YYYY-MM-DD 'en-ZA' format hh:mm:ss
document.querySelector('#deadline-date').setAttribute('min',curTime.toLocaleDateString('en-ca'));

const form = document.querySelector('form');
form.addEventListener('submit', submitForm);

let tIndex = null;
let tState = null;

window.api.askEdit((e,item)=>{
    const {tName,tDate,tTime} = item;
    let textDisp = document.querySelector("#item");
    textDisp.value = tName;
    let dateDisp = document.querySelector('#deadline-date');
    dateDisp.value = tDate;
    let timeDisp = document.querySelector('#deadline-time');
    timeDisp.value = tTime;
    
    //add eventlistener for onchange for date to setTimeMin if date is today
    dateDisp.addEventListener('change',setTimeMin);
});

function setTimeMin(e){
    let thisTime = document.querySelector('#deadline-time');
    if(e.target.value == curTime.toLocaleDateString('en-ca')){
        thisTime.setAttribute('min',curTime.toLocaleTimeString('en-ZA').slice(0,5));
        thisTime.value = curTime.toLocaleTimeString('en-ZA').slice(0,5);
    }else{
        thisTime.removeAttribute('min');
        thisTime.value = "00:00";
    }
}


function submitForm(e){
    e.preventDefault();
    const taskName = document.querySelector('#item').value;
    const date = document.querySelector('#deadline-date').value;
    const time = document.querySelector('#deadline-time').value;
    // check empty input
    if(taskName !== '' && date !== '' && time !== ''){ 
            const item = {
                tName : taskName,
                tDate : date,
                tTime : time
            }
            window.api.confirmEdit(item);
            window.api.closeWin("edit");
    }else{
        const msg = document.querySelector(".msg");
        msg.style.backgroundColor = '#F96849';
        msg.innerHTML = 'Please enter all fields';
        setTimeout(()=>msg.innerHTML = '', 3000);
    }
}
const closeBtn = document.querySelector('.close');
closeBtn.addEventListener('click', closeAddWin);

function closeAddWin(e){
    e.preventDefault();
    window.api.confirmEdit(null);
    window.api.closeWin("edit");
}
