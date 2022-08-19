const fs = require('fs');
const path = require('path');


class TaskStorage{
    fileName;

    constructor(fileName){
        this.fileName = fileName;
    }

    writeTask(items){
        const pth = this.fileName;
        if(items !== []){
            fs.writeFile(pth,JSON.stringify(items),{flag:'w+'},err =>{
                if(err){
                    console.log('error',err);
                }
            })
            
            
        }
    }

    readTask(){
        const pth = this.fileName;
        let tList = null;
        if(fs.existsSync(pth)){
            let rawdata = fs.readFileSync(pth);
            if(rawdata != ''){
                tList = JSON.parse(rawdata);
            }
        }
        return tList;
    }
}

module.exports = TaskStorage;