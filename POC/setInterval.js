const minimist = require("minimist");
const args = minimist(process.argv);
let count = parseInt(args.n);
let time  = parseInt(args.d);
let id = setInterval(function(){
    console.log(count+" countdown left");
    count--;
    if(count == 0){
        clearInterval(id);  
    }
},time)