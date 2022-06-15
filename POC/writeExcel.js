// node writeExcel.js --source=teams.json --dest=teams.csv

const fs = require("fs");
const excel = require("excel4node");
const minimist = require("minimist");

let args = minimist(process.argv);

let teamsJSON = fs.readFileSync(args.source,"utf-8");
let teams = JSON.parse(teamsJSON);

let wb = new excel.Workbook();

var hstyle = wb.createStyle({
    font: {
      color: '#FF0800',
      size: 12,
    },
  });

for(let i = 0; i < teams.length; i++){
    let ws = wb.addWorksheet(teams[i].name);
    ws.cell(1,1).string("Opponent").style(hstyle);
    ws.cell(1,2).string("Result").style(hstyle);
    ws.cell(1,4).string("Rank").style(hstyle);
    ws.cell(1,5).number(teams[i].rank);
    for(let j = 0; j < teams[i].matches.length; j++){
        ws.cell(j+2,1).string(teams[i].matches[j].opponent);
        ws.cell(j+2,2).string(teams[i].matches[j].result);
    }
}

wb.write(args.dest);