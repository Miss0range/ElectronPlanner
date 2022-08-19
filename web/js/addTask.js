let curTime = new Date();
//'en-ca' date format YYYY-MM-DD 'en-ZA' format hh:mm:ss
document.querySelector('#deadline-date').setAttribute('min',curTime.toLocaleDateString('en-ca'));

const form = document.querySelector('form');
form.addEventListener('submit', submitForm);

console.log(curTime.toLocaleTimeString('it-IT'));

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
    const toMil = new Date(date + "T" + time + ":00");


    if(taskName !== '' && date !== '' && time !== ''){ 
        //  if(toMil.getTime() > Date.now()){
            const item = {
                tName : taskName,
                tDate : date,
                tTime : time
            }
            window.api.sendTask(item);
        // }else{
        //     const msg = document.querySelector(".msg");
        //     //msg.classList.add('error');
        //     msg.style.backgroundColor = '#F96849';
        //     msg.innerHTML = 'Please enter a future date/time';
        //     setTimeout(()=>msg.innerHTML = '', 3000);
        // }
    }else{
        const msg = document.querySelector(".msg");
        //msg.classList.add('error');
        msg.style.backgroundColor = '#F96849';
        msg.innerHTML = 'Please enter all fields';
        setTimeout(()=>msg.innerHTML = '', 3000);
    }
}
const closeBtn = document.querySelector('.close');
closeBtn.addEventListener('click', closeAddWin);

function closeAddWin(e){
    e.preventDefault();
    window.api.closeWin("add");
}
