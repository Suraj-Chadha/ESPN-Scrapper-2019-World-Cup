
// node firstFolder.js --source=teams.json --dest=root

const minimist = require("minimist");
const fs = require("fs");
const path = require("path");
const pdflib = require("pdf-lib");
const PDFDocument = pdflib.PDFDocument;
let args = minimist(process.argv);

let teamsJSON = fs.readFileSync(args.source, "utf-8");
let teams = JSON.parse(teamsJSON);

for (let i = 0; i < teams.length; i++) {
    let folderPath = path.join(args.dest, teams[i].name);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

    for(let j = 0; j < teams[i].matches.length; j++){
        let scoreCardFile = path.join(folderPath,teams[i].matches[j].opponent+".pdf");
        createScoreCard(teams[i].name,teams[i].matches[j],scoreCardFile);
    }
}

function createScoreCard(teamName,match,scoreCardFile){

    let t1 = teamName;
    let t2 = match.opponent;
    let res = match.result;

    let templateInBytes = fs.readFileSync(args.template);// we need it in bytes
    let pdfWillBeLoadedPromise = PDFDocument.load(templateInBytes);
    pdfWillBeLoadedPromise.then(function(pdfDoc){
        let page = pdfDoc.getPage(0);
        page.drawText(t1,{
            x:240,
            y:700,
            size:19
        });
        page.drawText(t2,{
            x:240,
            y:680,
            size:19
        });
        page.drawText(res,{
            x:240,
            y:650,
            size:19
        });
        let newPDFBytesPromise = pdfDoc.save();
        newPDFBytesPromise.then(function(newPDFBytes){
            fs.writeFileSync(scoreCardFile,newPDFBytes);
        })
    })

}