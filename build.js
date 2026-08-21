require('dotenv').config({ path: '.env'});
require('url').URL

const fs = require('node:fs')
const fsp = require('node:fs/promises')
const https = require('https')

//setup get request
const spreadsheetID = "1YxfI5xpi_q5IEi0L2-3fW_GzCba1SnpS_nOzWVIBwO4"
const ranges = ["\'Item List\'!A:U"
    ,"\'Curses\'!A:H"]

const url = encodeURI(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetID}/values:batchGet?key=${process.env.SHEETSAPIKEY}&ranges=${ranges[0]}&ranges=${ranges[1]}`)
var result = ""

//define functions

// function for filter to call
function filterData(value, index, array) {
    if(value[13] == "0" || value[0] === "" || value[1] === "" || value[2] === ""){
        return false;
    }
    else return true;
}

// with json gotten, parse, filter, create, and save new json file.
function buildData() {
    result = JSON.parse(result);
    console.log("Finished API Request")

    var itemsData = result.valueRanges[0].values.filter(filterData);
    var cursesData = result.valueRanges[1].values.filter(filterData);

    console.log(`final data obtained.\nItems: ${itemsData.length}\nCurses: ${cursesData.length}`)

    //remove header values
    itemsData.splice(0, 1)
    cursesData.splice(0, 1)

    //item 13 stats.
    //needs to be a number.
    //skip header
    for(var i = 1; i < itemsData.length;i++){
        itemsData[i][13] = itemsData[i][13].replace(/,/g, "")
        itemsData[i][13] = parseInt(itemsData[i][13])
    }

    var finalJson = JSON.stringify({
        items: itemsData,
        curses: cursesData
    });
    //overwrite is desireable. Files shouldn't be tracked as they will be built when the site deploys.
    fs.writeFile('docs/data/values.json', finalJson, callback)
}

//minor error handling in file write
function callback(err){
    if (err){ 
        console.log(err)
        //finish anything left, exit gracefully with error code.
        process.exitCode = 1
    }
}

// get all javascript files, concat them, and output master javascript file
async function JSbuild(){
    const main = fsp.readFile('docs/javascript/main.js')
    const builds = fsp.readFile('docs/javascript/builds.js')
    const cookies = fsp.readFile('docs/javascript/cookies.js')
    const filter = fsp.readFile('docs/javascript/filter.js')
    const pageElements = fsp.readFile('docs/javascript/pageElements.js')

    var result = await main
    result+= "\n" + await builds
    result+= "\n" + await cookies
    result+= "\n" + await filter
    result+= "\n" + await pageElements

    console.log("javascript file created")
    fsp.writeFile("docs/javascript/javascript.js", await result)
}

JSbuild()

//get data from sheet
console.log("Quereying API")
https.get({
    hostname: 'sheets.googleapis.com',
    path: url
}, (res) => {

    res.on('data', (chunk) => {
        result += chunk;
    });

    res.on('end', buildData);
});
