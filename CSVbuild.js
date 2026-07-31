require('dotenv').config({ path: '.env'});
const https = require('https')

const spreadsheetID = "1YxfI5xpi_q5IEi0L2-3fW_GzCba1SnpS_nOzWVIBwO4"
const ranges = ["'Item List'!A1:V2"
    ,"'Curses'!A1:H2"]
var result

console.log(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetID}/values:batchGet?key=${process.env.SHEETSAPIKEY}&ranges=${ranges[0]}&ranges=${ranges[1]}`)

/*https.get({
    hostname: 'sheets.googleapis.com',
    path: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetID}?key=${process.env.SHEETSAPIKEY}&ranges=${ranges}`
})*/