const axios = require("axios");
const minimist = require("minimist");
const jsdom = require("jsdom");
const fs = require("fs");
const path = require("path");
const excel = require("excel4node");
const pdflib = require("pdf-lib");

const args = minimist(process.argv);
// node cricInfoExtracter.js --source="https://www.espncricinfo.com/seriesasdaferg/icc-cricket-world-cup-2019-1144415/match-results" --excel="WorldCup2019.xls" --dataFolder="data"


let responsePromise = axios.get(args.source);
responsePromise.then(function(response){
    
    let html = response.data;
    let dom = new jsdom.JSDOM(html);
    let document = dom.window.document;
    let matchResultDivs = document.querySelectorAll(".ds-px-4.ds-py-3 .ds-text-compact-xxs");
    let matches = [];
    for(let i = 0; i < matchResultDivs.length; i++){
        let match = {};
        let teamNames = matchResultDivs[i].querySelectorAll("div.ci-team-score > div.ds-items-center >p");
        match.t1 = teamNames[0].textContent;
        match.t2 = teamNames[1].textContent;

        let teamScore = matchResultDivs[i].querySelectorAll("div.ds-text-typo-title>strong");
        let t1s = "";
        let t2s = "";
        if(teamScore.length == 2){
            t1s = teamScore[0].textContent;
            t2s = teamScore[1].textContent;
        }else if(teamScore.length == 1){
            t1s = teamScore[0].textContent;
        }
        
        match.t1s = t1s;
        match.t2s = t2s;

        match.result = matchResultDivs[i].querySelector("p>span").textContent;
        matches.push(match);
    }
    let matchJSON = JSON.stringify(matches);
    // fs.writeFileSync("matches.json",matchJSON,"utf-8");
    let teams = [];
    for(let i = 0; i < matches.length; i++){
        populateCountry(teams,matches[i]);
    }
    // let teamsJSON = JSON.stringify(teams);
    // fs.writeFileSync("teams2.json",teamsJSON,"utf-8");
    createExcel(teams);
    creatFolders(teams);

})
.catch(function(err){
    console.log(err);
})
function populateCountry(teams,match){
    let t1idx = -1;
    for(let i = 0; i < teams.length; i++){
        if(teams[i].name == match.t1){
            t1idx = i;
            break;
        }
    }
    if(t1idx == -1){
        let team = {}
        team.name = match.t1;
        team.matches= [];
        team.matches.push({
            vs:match.t2,
            selfScore: match.t1s,
            oppScore:match.t2s,
            result: match.result,
        })
        teams.push(team);
    }else{
        teams[t1idx].matches.push({
            vs:match.t2,
            selfScore: match.t1s,
            oppScore:match.t2s,
            result: match.result,
        })
    }
    let t2idx = -1;
    for(let i = 0; i < teams.length; i++){
        if(teams[i].name == match.t2){
            t2idx = i;
            break;
        }
    }
    if(t2idx == -1){
        let team = {}
        team.name = match.t2;
        team.matches= [];
        team.matches.push({
            vs:match.t1,
            selfScore: match.t2s,
            oppScore:match.t1s,
            result: match.result,
        })
        teams.push(team);
    }else{
        teams[t2idx].matches.push({
            vs:match.t1,
            selfScore: match.t2s,
            oppScore:match.t1s,
            result: match.result,
        })
    }
}
function createExcel(teams){
    console.log(teams.length);
    var wb = new excel.Workbook();
    var hs = wb.createStyle({
        font: {
          color: '#FF0800',
          size: 12,
          bold:true,
        },
      });
    for(let i = 0; i < teams.length; i++){
        let sheet = wb.addWorksheet(teams[i].name);
        sheet.cell(1, 1).string('opponent').style(hs);
        sheet.cell(1, 2).string('Self Score').style(hs);
        sheet.cell(1, 3).string('Opponent Score').style(hs);
        sheet.cell(1, 4).string('Result').style(hs);

        for(let j = 0; j < teams[i].matches.length; j++){
            sheet.cell(j+2,1).string(teams[i].matches[j].vs);
            sheet.cell(j+2,2).string(teams[i].matches[j].selfScore);
            sheet.cell(j+2,3).string(teams[i].matches[j].oppScore);
            sheet.cell(j+2,4).string(teams[i].matches[j].result);
        }
    }
    wb.write(args.excel);
}
function creatFolders(teams){
    if(!fs.existsSync(args.dataFolder)) fs.mkdirSync(args.dataFolder);
    for(let i = 0; i < teams.length; i++){
        let teamFN = path.join(args.dataFolder,teams[i].name);
        if(!fs.existsSync(teamFN)) fs.mkdirSync(teamFN);
        for(let j = 0; j < teams[i].matches.length; j++){
            let matchFN = path.join(teamFN,teams[i].matches[j].vs+".pdf");
            createScoreCard(teams[i].name,teams[i].matches[j],matchFN);
        }
    }
}
function createScoreCard(teamName,match,matchFN){
    const PDFDocument = pdflib.PDFDocument;
    let templateInBytes = fs.readFileSync("template.pdf");
    let loadPDFDocPromise = PDFDocument.load(templateInBytes);
    loadPDFDocPromise.then(function(pdfDOC){
        let page = pdfDOC.getPage(0);
        page.drawText("started");

        let givePdfBytesPromise = pdfDOC.save();
        givePdfBytesPromise.then(function(newPDFByes){
            fs.writeFileSync("test.pdf",newPDFByes);
        })
    })
}