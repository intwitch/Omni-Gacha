
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
		page.redrawAllSaveTables()
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

	for (let char of splitArray) {
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
	const itemsSaveTables = document.querySelectorAll(".saveTable.itemsTable")
	const cursesSaveTables = document.querySelectorAll(".saveTable.cursesTable")
	const searchItemsTable = document.getElementById("searchItemsTable")
	const searchCursesTable = document.getElementById("searchCursesTable")

	itemsRollTable.addEventListener("redrawRequest", (e) => { page.redrawRollTableListener(e, "items") })
	cursesRollTable.addEventListener("redrawRequest", (e) => { page.redrawRollTableListener(e, "curses") })
	itemsHistoryTable.addEventListener("redrawRequest", (e) => { page.redrawHistoryTableListener(e, "items") })
	cursesHistoryTable.addEventListener("redrawRequest", (e) => { page.redrawHistoryTableListener(e, "curses") })
	searchItemsTable.addEventListener("redrawRequest", (e) => { page.redrawSearchTableListener(e, "items") })
	searchCursesTable.addEventListener("redrawRequest", (e) => { page.redrawSearchTableListener(e, "curses") })
	for(let table of itemsSaveTables){
		table.addEventListener("redrawRequest", (e) => { page.redrawSaveTableListener(e, "items") })
	}
	for(let table of cursesSaveTables){
		table.addEventListener("redrawRequest", (e) => { page.redrawSaveTableListener(e, "curses") })
	}

	document.getElementById("itemTokenDropdown").addEventListener("click", (e) => {page.rankFilterChangeListener(e)})

	document.body.querySelector("main").addEventListener("click", (e) => { page.globalClickListener(e)}, true)
	document.getElementById("itemStarLevel").addEventListener("click", (e) => { page.itemsSubMenuGroup.toggle("itemTokenDropdown", e) })
	document.getElementById("itemCategorySelector").addEventListener("click", (e) => { page.itemsSubMenuGroup.toggle("itemsCategoryFilter", e) })
	

	document.getElementById("itemCopyRoll").addEventListener("click", () => {page.copyLatestItem()})

	const homeButton = document.getElementById("homeButton");
	homeButton.addEventListener("click", (e) => {page.changeTabTo("home", e) });
	
	document.getElementById("logo").addEventListener("click", function () { homeButton.click() }) //mirror above event

	document.getElementById("aboutButton").addEventListener("click", (e) => {page.changeTabTo("about", e)});
	document.getElementById("itemsButton").addEventListener("click", (e) => {page.changeTabTo("items", e)});
	document.getElementById("cursesButton").addEventListener("click", (e) => {page.changeTabTo("curses", e)});
	document.getElementById("buildButton").addEventListener("click", (e) => {page.changeTabTo("build", e)});
	document.getElementById("searchButton").addEventListener("click", (e) => {page.changeTabTo("search", e)});

	document.getElementById("itemRollButton").addEventListener("click", () => {page.roll("items")});
	document.getElementById("saveButton").addEventListener("click", () => {page.saveLatest("items")});
	document.getElementById("cursesRollButton").addEventListener("click", () => {page.roll("curses")});
	document.getElementById("cursesSaveButton").addEventListener("click", () => {page.saveLatest("curses")});

	document.getElementById("buildExportButton").addEventListener("click", () => {page.exportSaved()});

	
	document.getElementById("itemsCategoryFilter").addEventListener("change", (e) => { page.categoryFilterChangeListener(e) })
	document.getElementById("itemsCategoryFilterAll").addEventListener("change", (e) => { page.categoryFilterAllChangeListener(e) })
	

	document.getElementById("optionsButton").addEventListener("click", () => { page.optionsMenu.toggle("optionsMenu") })

	document.getElementById("optionsBackgroundToggle").addEventListener("change", (e) => { page.backgroundImageOptionChangeListener(e) })
	document.getElementById("contentOptions").addEventListener("change", (e) => {page.contentOptionsChangeListener(e)})
	document.getElementById("optionsBuildSelector").addEventListener("change", (e) => { page.switchBuildEventHandler(e) })
	document.getElementById("optionsBuildsNewName").addEventListener("keydown", (e) => { page.createNewBuildEventHandler(e) })
	document.getElementById("optionsBuildsDeleteButton").addEventListener("click", (e) => { page.deleteCurrentBuildListener(e) })

	document.getElementById("searchItemsButton").addEventListener("click", (e) => { searchItemsTable.dispatchEvent(pageHandler.redrawRequest) })
	document.getElementById("searchCursesButton").addEventListener("click", (e) => { searchCursesTable.dispatchEvent(pageHandler.redrawRequest) })
};