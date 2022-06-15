// node writeJSON.js --dest="teams.json"

const fs = require("fs");
const minimist = require("minimist");


let args = minimist(process.argv);
// lets make a JS object

let teams = [
    {
        name: "India",
        rank: 1,
        matches:[
            {
                opponent:"Austrailia",
                result:"win",
            },
            {
                opponent:"England",
                result:"win",
            },
          
        ],
    },
    {
        name: "England",
        rank: 2,
        matches:[
            {
                opponent:"India",
                result:"lost",
            },
            {
                opponent:"Austrailia",
                result:"win",
            },
        ],
    },
    {
        name: "Austrailia",
        rank: 3,
        matches:[
            {
                opponent:"India",
                result:"lost",
            },
            {
                opponent:"England",
                result:"lost",
            },
        ],
    }
]
let json = JSON.stringify(teams);
console.log(teams[2].matches);
fs.writeFileSync(args.dest,json,"utf-8");