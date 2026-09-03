
import { gachaItem } from "./gachaItem.js"
import { gachaCurse } from "./gachaCurse.js"
import { pageHandler } from "./pageHandler.js"

export {
	smartSplit,
	arrayMerge
};

const pagePromise = pageHandler.build()

window.onload = function () {
	
	pagePromise.then(function (page) {
		createAllEventHandlers(page)
		page.createAllSortButtons()
		page.applyAllOptions()
	})
}



/**
 *  string.split() method does not respect split string exlusion based on quote
 * 	this function will works similar to .split(), but will ignore anything in "quotes"
 *  This function could likely be further optimized
 * 
 * @param {string} input 
 * @returns spllit array
 */
function smartSplit(input, split) {

	var insideQuote = false;
	var splitArray = input.split("");
	var finalArray = [""]
	var index = 0;

	for (char of splitArray) {
		if (char == '\"') {
			insideQuote = !insideQuote;
			continue;
		}
		if (char == split && !insideQuote) {
			finalArray.push("");
			index++
		}
		else {
			finalArray[index] += char;
		}
	}
	return finalArray
}

/**
 * image the array, as an array of sets. They aren't but its useful
 * this function finds the union of those sets without duplicates
 * uses recursion call stack equal to the amount of sets - 1
 * does not preserve ordering
 * @param {*[][]} sourceArrays 
 * @returns 
 */
function arrayMerge(sourceArrays) {
	//recursive base statement
	if (sourceArrays.length == 1) return sourceArrays[0];

	//get first two arrays
	var subArray1 = sourceArrays[0];
	var subArray2 = sourceArrays[1];

	//trim shared elements out of subArray2
	subArray2 = subArray2.filter(function (element) {
		return !((subArray1.indexOf(element) != -1) && subArray2.indexOf(element) != -1);
	});

	//merge elements and place back in source.
	subArray1 = subArray1.concat(subArray2);
	sourceArrays.splice(0, 2, subArray1);
	//enter recursion
	return arrayMerge(sourceArrays);
}

/**
 * 
 * @param {pageHandler} page 
 */
function createAllEventHandlers(page) {

	const itemsRollTable = document.querySelector(".rollTable.itemsTable")
	const cursesRollTable = document.querySelector(".rollTable.cursesTable")
	const itemsHistoryTable = document.querySelector(".historyTable.itemsTable")
	const cursesHistoryTable = document.querySelector(".historyTable.cursesTable")
	const itemsSaveTables = document.querySelectorAll(".savedTable.itemsTable")
	const cursesSaveTables = document.querySelectorAll(".savedTable.cursesTable")
	const searchItemsTable = document.getElementById("searchItemsTable")
	const searchCursesTable = document.getElementById("searchCursesTable")

	itemsRollTable.addEventListener("tableRedrawRequest", (e) => { page.redrawRollTableListener(e, "items") })
	cursesRollTable.addEventListener("tableRedrawRequest", (e) => { page.redrawRollTableListener(e, "curses") })
	itemsHistoryTable.addEventListener("tableRedrawRequest", (e) => { page.redrawHistoryTableListener(e, "items") })
	cursesHistoryTable.addEventListener("tableRedrawRequest", (e) => { page.redrawHistoryTableListener(e, "curses") })
	searchItemsTable.addEventListener("tableRedrawRequest", (e) => { page.redrawSearchTableListener(e, "items") })
	searchCursesTable.addEventListener("tableRedrawRequest", (e) => { page.redrawSearchTableListener(e, "curses") })
	for(let table of itemsSaveTables){
		table.addEventListener("tableRedrawRequest", (e) => { page.redrawSaveTableListener(e, "items") })
	}
	for(let table of cursesSaveTables){
		table.addEventListener("tableRedrawRequest", (e) => { page.redrawSaveTableListener(e, "curses") })
	}

	document.getElementById("contentOptions").addEventListener("change", () => {page.changeTabButtonListener()})

	document.getElementById("ticketSelector").addEventListener("change", (e) => {page.rankFilterChangeListener(e)});

	const homeButton = document.getElementById("homeButton");
	homeButton.addEventListener("click", () => {page.changeTabTo("home") });
	
	document.getElementById("logo").addEventListener("click", function () { homeButton.click() }) //mirror above event

	document.getElementById("aboutButton").addEventListener("click", () => {page.changeTabTo("about")});
	document.getElementById("startsButton").addEventListener("click", () => {page.changeTabTo("starts")})
	document.getElementById("itemsButton").addEventListener("click", () => {page.changeTabTo("items")});
	document.getElementById("cursesButton").addEventListener("click", () => {page.changeTabTo("curses")});
	document.getElementById("buildButton").addEventListener("click", () => {page.changeTabTo("build")});
	document.getElementById("searchButton").addEventListener("click", () => {page.changeTabTo("search")});

	document.getElementById("itemRollButton").addEventListener("click", () => {page.roll("items")});
	document.getElementById("saveButton").addEventListener("click", () => {page.saveLatest("items")});
	document.getElementById("cursesRollButton").addEventListener("click", () => {page.roll("curses")});
	document.getElementById("cursesSaveButton").addEventListener("click", () => {page.saveLatest("curses")});

	document.getElementById("buildExportButton").addEventListener("click", () => {page.exportSaved()});

	
	const itemCategoriesFilters = Array.from(document.querySelectorAll("#itemsCategoryFilter input"))
	const allCategoryBox = itemCategoriesFilters.splice(0, 1)[0]
	for(let checkbox of itemCategoriesFilters){
		checkbox.addEventListener("change", (e) => { page.categoryFilterChangeListener(e) })
	}
	allCategoryBox.addEventListener("change", (e) => { page.categoryFilterAllChangeListener(e) })
	

	document.getElementById("optionsButton").addEventListener("click", () => { pageHandler.openOptions })
	document.getElementById("optionsClose").addEventListener("click", () => { pageHandler.closeOptions })

	document.getElementById("optionsBackgroundToggle").addEventListener("change", (e) => { page.backgroundImageOptionChangeListener(e) })
	document.getElementById("optionsBuildSelector").addEventListener("change", (e) => { page.switchBuildEventHandler(e) })
	document.getElementById("optionsBuildsNewName").addEventListener("keydown", (e) => { page.createNewBuildEventHandler(e) })
	document.getElementById("optionsBuildsDeleteButton").addEventListener("click", (e) => { page.deleteCurrentBuildListener(e) })

	document.getElementById("searchItemsButton").addEventListener("click", (e) => { searchItemsTable.dispatchEvent(pageHandler.tableRedrawRequest) })
	document.getElementById("searchCursesButton").addEventListener("click", (e) => { searchCursesTable.dispatchEvent(pageHandler.tableRedrawRequest) })
};