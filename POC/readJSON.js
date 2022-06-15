// node readJSON.js --source=teams.json

const fs = require("fs");
const minimist = require("minimist");

const args = minimist(process.argv);

fs.readFile(args.source,"utf-8",function(err,json){
    if(err) console.log(err);
    else{
        let teams = JSON.parse(json);
        
    }
})