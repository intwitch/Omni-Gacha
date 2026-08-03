const ITEMS = {
	NAME: 0,
	SERIES: 1,
	DESCRIPTION: 2,
	CATEGORY: 3,
	GENDER: 4,
	MAGIC: 5,
	MEMETIC: 6,
	MIGHT: 7,
	MIND: 8,
	MOTION: 9,
	MOXIE: 10,
	MUTATION: 11,
	MYTH: 12,
	STATS: 13,
	RANK: 14,
	GROWTH_TYPE: 15,
	GROWTH_RATE: 16,
	RESTOCK: 17,
	RETURN: 18,
	GIFT: 19,
	NSFW: 20,
}

const CURSES = {
	NAME: 0,
	DESCRIPTION: 1,
	RESOLUTION: 2,
	LEVEL: 3,
	TARGET: 4,
	AFFECTS: 5,
	NSFW: 6,
	REWARD: 7
}

var rawItemsData;
var rawCursesData;

var itemsData = [];
var cursesData = [];

var filteredItemsData = []
var filteredCursesData = []

var NSFW = false;
var NSFWOnly = false;

var currentItemRoll;
var savedItemRolls = [];
var itemRollHistory = [];

var currentCurseRoll;
var savedCurseRolls = [];
var curseRollHistory = [];

var homeTab;
var itemsTab;
var cursesTab;
var buildTab;
var searchTab;

//incredibly important, nothing can be done without.
loadParseJSON()

/*
load, parse and set raw data variables.
I have come to despsise async and await and then and promises and general
I do not want to deal with ANY of that.
so we use a xml request for my own sanity.
*/
function loadParseJSON() {
	const xhr = new XMLHttpRequest();
	xhr.open("GET", "data/values.json", false); // false = synchronous
	xhr.send();

	values = JSON.parse(xhr.responseText);

	rawItemsData = values.items
	rawCursesData = values.curses
}

function itemToString(item) {
	var sfw = ""
	if (item[ITEMS.NSFW] === "TRUE") sfw = " | NSFW"
	return `${item[ITEMS.NAME]} | ${item[ITEMS.SERIES]}\nRank ${item[ITEMS.RANK]} | ${item[ITEMS.CATEGORY]}${sfw}\n${item[ITEMS.DESCRIPTION]}`
}

function curseToString(curse) {
	var sfw = ""
	if (curse[CURSES.NSFW] === "TRUE") sfw = " | NSFW"
	return `${curse[CURSES.NAME]} | ${curse[CURSES.LEVEL]}${sfw}\n${curse[CURSES.DESCRIPTION]}\nResolution: ${curse[CURSES.RESOLUTION]}`
}
// check checkbox status and update values acordingly, then call updatefilter for more general
function updateContentFilter() {
	NSFWCheckBox = document.getElementById("nsfwCheckbox")
	NSFWOnlyCheckBox = document.getElementById("nsfwOnlyCheckbox")

	NSFW = NSFWCheckBox.checked
	NSFWOnly = NSFWOnlyCheckBox.checked

	var searchParam

	if (NSFW == true) {
		if (NSFWOnly == false) {
			// NSFW = true and NSFWOnly = false
			itemsData = rawItemsData;
			cursesData = rawCursesData;
			NSFWOnlyCheckBox.parentElement.style.visibility = "visible"
			updateItemFilterData();
			return;
		} else {
			// NSFWONLY && NSFW
			searchParam = "TRUE"
		}
	} else {
		// NSFW = false and thus NSFWONLY = false
		searchParam = "FALSE"
		NSFWOnlyCheckBox.checked = false
		NSFWOnlyCheckBox.parentElement.style.visibility = "hidden"
	}

	var filterFunction = function (seekPosition) {
		var rFunction = function (value, index, array) {
			return value[seekPosition] === searchParam
		}
		return rFunction
	}

	itemsData = rawItemsData.filter(filterFunction(ITEMS.NSFW))
	cursesData = rawCursesData.filter(filterFunction(CURSES.NSFW))

	updateItemFilterData();
}

// gets random value from items or curses
function getRandomValue(array) {
	var randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex];
}
// given a table and values, get a single value, put it in a row element, call drawTableBody, push new element to historyArray.
function roll(table, data, historyArray) {
	var element = getRandomValue(data);
	var newRow = createRow(element);

	drawTableBody(table, [newRow]);
	historyArray.unshift(element);
	return element;
}

//redraw a save table
function redrawSaveTable(table, data) {
	var rows = [];

	function buttonFunctionCreator(index) {
		var buttonFunction = function () {
			data.splice(index, 1);
			redrawSaveTable(table, data);
		}
		return buttonFunction
	}
	data.forEach(function (item, index) {
		var row = createRow(item)

		row.append(additionalButtonTableData(buttonFunctionCreator(index), "Remove"));

		rows.push(row);
	})

	drawTableBody(table, rows);
}

//return an additional TD element with an on "click" listener.
//function and value determined by inputs.
function additionalButtonTableData(buttonFunction, buttonText) {
	var additionalItem = document.createElement("td");
	var itemButton = document.createElement("button");
	itemButton.innerText = buttonText;
	additionalItem.appendChild(itemButton);

	itemButton.addEventListener("click", buttonFunction);
	return additionalItem
}

//given array convert to tr element with td data
function createRow(array) {
	var newRow = document.createElement("tr");
	var rowData = "";

	for (var i = 0; i < array.length; i++) {
		rowData += "<td><p>" + array[i] + "</p></td>";
	}
	newRow.innerHTML = rowData;

	var nameElement = newRow.querySelector("td p");
	nameElement.classList.add("saveTableNameData");
	nameElement.title = "copy";
	nameElement.addEventListener("click", function () {
		var copytext;
		if (array.length > 14) copytext = itemToString(array);
		else copytext = curseToString(array);

		navigator.clipboard.writeText(copytext);
	});

	return newRow;
}
//given a table and an array of rows (tr element) , clear then draw them to tbody
function drawTableBody(table, rows) {

	var tbody = table.querySelector("tbody");
	tbody.innerHTML = "";
	rows.forEach(function (row) {
		tbody.appendChild(row)
	});
}
//calls all filter related functions for items as it updates the global variable
function updateItemFilterData() {
	filteredItemsData = itemsData;
	filteredItemsData = FilterTicketData(filteredItemsData);
	filteredItemsData = filterItemByCategory(filteredItemsData);
	//console.log(filteredItemsData);
}

// create a function to filter on based on an array of filters and an index to see if the index of the item/curse is in the filter.
function valueFilter(filterArray, index) {
	var filterFunction = function (value) {
		const valuePart = value[index].toLowerCase();
		for(filter of filterArray){
			if(valuePart.indexOf(filter.toLowerCase()) != -1) return true
		}
		return false;
	}
	return filterFunction
}
//same as above, but filter function looks for text matching, not exact matching. Unless it's a rank, where it has to be valueFiltered
function textValueFilter(filterArray, index) {
	var filterFunction = function (value) {
		const valuePart = value[index].toLowerCase();
		for(filter of filterArray){
			if(valuePart.includes(filter.toLowerCase())) return true
		}
		return false;
	}
	return filterFunction
}

// get ticket value, determine required filters, call rank filter, then return filtered results.
function FilterTicketData(itemsData) {
	var ticketValue = document.getElementById("ticketSelector").value;
	var filter;
	switch (ticketValue) {
		case "0":
		default:
			return itemsData;
			break;
		case "1":
			filter = ["F", "E", "D"];
			break;
		case "2":
			filter = ["E", "D", "C"];
			break;
		case "3":
			filter = ["D", "C", "B"];
			break;
		case "4":
			filter = ["C", "B", "A"];
			break;
		case "5":
			filter = ["B", "A", "S"];
			break;
		case "6":
			filter = ["A", "S", "SS"];
			break;
		case "7":
			filter = ["S", "SS", "SSS"];
			break;
		case "8":
			filter = ["SS", "SSS", "EX"];
			break;
	}



	return itemsData.filter(valueFilter(filter, ITEMS.RANK));
}
// determine categories to filter by, (if any if all is checked), then call filter with valueFilter
function filterItemByCategory(itemsData) {
	var itemsCategoriesFilters = document.querySelectorAll("#itemsCategoryFilter input");
	var filter = []

	if (itemsCategoriesFilters[0].checked) return itemsData;

	for (var category of itemsCategoriesFilters) {
		if (category.checked) filter.push(category.value);
	}

	return itemsData.filter(valueFilter(filter, ITEMS.CATEGORY))
}
// shabby but technically works.... for now.
function searchFor(string) {
	var regex = new RegExp(string, "i");
	var searchResults = itemsData.filter(function (item) {
		return item[ITEMS.NAME].concat(item[ITEMS.SERIES], item[ITEMS.DESCRIPTION]).search(regex) != -1;
	});

	var tbody = document.querySelector("#searchTable > tbody");
	tbody.innerHTML
		= ""; //wipe before replace

	searchResults.forEach(element => {
		var newRow = document.createElement("tr");
		newRow.innerHTML = "<td>" + element[0] + "</td><td>" + element[1] + "</td><td>" + element[2] + "</td><td>" + element[3] + "</td><td>" + element[4] + "</td><td>" + element[5] + "</td><td>" + element[6] + "</td><td>" + element[7] + "</td><td>" + element[8] + "</td><td>" + element[9] + "</td><td>" + element[10] + "</td><td>" + element[11] + "</td><td>" + element[12] + "</td><td>" + element[13] + "</td><td>" + element[14] + "</td><td>" + element[15] + "</td><td>" + element[16] + "</td><td>" + element[17] + "</td><td>" + element[18] + "</td><td>" + element[19] + "</td><td>" + element[20] + "</td>";
		tbody.append(newRow);
	});
}

// get all items and curses, convert to strings (same as copy paste) then let user download txt file of them.
function exportSaved() {

	var text = "<ITEMS>\n\n\n";

	for (item of savedItemRolls) {
		text += `${itemToString(item)}\n\n`;
	}

	text += "\n<CURSES>\n\n";
	for (curse of savedCurseRolls) {
		text += `${curseToString(curse)}\n\n`;
	}

	console.log(text)

	var link = document.createElement("a");
	var file = new Blob([text], { type: 'text/plan' });
	link.href = URL.createObjectURL(file)
	link.download = "Omni Gacha rolls.txt"
	link.click();
	URL.revokeObjectURL(link.href);
}

//create a handler for selection button to call
function tabChangeHandlerCreator(targetTab) {
	var root = getComputedStyle(document.querySelector(":root"))

	// handle changing the tab, 'this' becomes called button.
	var tabChangeHandler = function(){
		document.querySelectorAll("#selector button")
		for(button of document.querySelectorAll("#selector button")){
			button.style.backgroundColor = root.getPropertyValue("--unselected-button-color")
		}
		this.style.backgroundColor = root.getPropertyValue("--selected-button-color")
		redrawAllSaveTables();
		hideAllBut(targetTab);
	}

	return tabChangeHandler
}

//redraw important cross tab tables from source to reflect modifications made on other tabs
function redrawAllSaveTables() {
	redrawSaveTable(document.getElementById("saveTable"), savedItemRolls);
	redrawSaveTable(document.getElementById("cursesSaveTable"), savedCurseRolls);
	redrawSaveTable(document.getElementById("buildItemsTable"), savedItemRolls);
	redrawSaveTable(document.getElementById("buildCursesTable"), savedCurseRolls);
}

// set all tabs display to none then the one targetTab to block
function hideAllBut(targetTab) {
	for (tab of document.querySelectorAll(".tabcontent")){
		tab.style.display = "none"
	}
	targetTab.style.display = "block";
}

/*
History handler creator returns a function to be called on click that will handle history.
takes ID of the table to draw, history array to use, and save array to save to.
*/
function redrawHistoryTable(tableID, historyArray, saveArray) {

	//function to pass to additionalButtonTableData
	function saveButtonFunctionCreator(saveArray, index) {
		var saveButtonFunction = function () {
			saveArray.push(historyArray[index])
			redrawAllSaveTables()
		}
		return saveButtonFunction
	}

	var table = document.getElementById(tableID)
	var rows = [];

	for (var i = 0; i < historyArray.length; i++) {
		var row = createRow(historyArray[i])
		row.append(additionalButtonTableData(saveButtonFunctionCreator(saveArray, i), "Save"))
		rows.push(row)
	}

	drawTableBody(table, rows)
}

/*
Handle searching for the items.
get the specific values from name, series, description, then filter and apply them to search.
get values from advanced search
use regex to parse then filter those and apply them to search
*/
function searchHandlerCreator(sourceArray, saveArray, tableID){

	//use sourceArray to determine item or curse
	var headerToIndex
	var cutoffIndex
	if(sourceArray[0].length > 10) {
		headerToIndex = itemHeaderToIndex
		cutoffIndex = 5
	}
	else {
		headerToIndex = curseHeaderToIndex
		cutoffIndex = 15
	}

	//because .split can't ignore spaces inside quotes
	function smartSplit(input) {

		var insideQuote = false;
		var splitArray = input.split("");
		var finalArray = [""]
		var index = 0;

		for (char of splitArray) {
			if (char == '\"') {
				insideQuote = !insideQuote;
				continue;
			}
			if (char == " " && !insideQuote) {
				finalArray.push("");
				index++
			}
			else {
				finalArray[index] += char;
			}
		}
		return finalArray
	}

	var searchHandler = function() {
		console.log("search")
		var resultsArray = sourceArray;
		var inputs = this.parentElement.querySelectorAll("input");

		var advancedSearchValue = smartSplit(inputs[3].value);
		const advancedSearchVerifyPattern = /^[a-z0-9 ]+(,[a-z0-9 ]+)*:[a-z0-9 ]+(,[a-z0-9 ]+)*$/i;

		advancedSearchValue = advancedSearchValue.filter(function (value) {
			return (value.match(advancedSearchVerifyPattern) && headerToIndex(value.split(":")[0]) != -1);
		});

		for(var i = 0; i < 3; i++){
			if(inputs[i].value == "") continue;
			resultsArray = resultsArray.filter(textValueFilter(inputs[i].value.toLowerCase().split(","), i))
		}
		/*
		probably not going to be a lot of mixing going on, while it's possible O(n^2) is unlikely.
		will in all likelyhood be closer to O(n) or best case O(1)
		*/
		for(searchValue of advancedSearchValue){
			const arry = searchValue.split(":")
			var headers = arry[0].split(",")
			var terms = arry[1].split(",")

			for(header of headers){
				const index = headerToIndex(header)
				if(index < cutoffIndex) resultsArray = resultsArray.filter(textValueFilter(terms, index))
				else resultsArray = resultsArray.filter(valueFilter(terms, index))
			}
		}

		redrawHistoryTable(tableID, resultsArray, saveArray)
	}
	return searchHandler
}


//set of functions for search handler that... well.. pretty obvvious.
function itemHeaderToIndex(header){
	var headerArray = ["name", "series", "short description", "category", "gender", "magic", "memetic", "might", "mind", "motion", "moxie", "mutation", "myth", "stats", "rank", "growth type", "growth rate", "restock", "return", "gift", "nsfw"]
	return headerArray.indexOf(header.toLowerCase())
}

function curseHeaderToIndex(header){
	var headerArray = ["curse", "short description", "resolution", "level", "target", "affects", "nsfw", "reward"]
	return headerArray.indexOf(header.toLowerCase())
}

window.onload = function () {
	document.getElementById("contentOptions").addEventListener("change", updateContentFilter)

	document.getElementById("ticketSelector").addEventListener("change", updateItemFilterData);

	itemsTab = document.getElementById("items");
	cursesTab = document.getElementById("curses");
	buildTab = document.getElementById("build");
	searchTab = document.getElementById("search")

	document.getElementById("itemsButton").addEventListener("click", tabChangeHandlerCreator(itemsTab));

	document.getElementById("cursesButton").addEventListener("click", tabChangeHandlerCreator(cursesTab));

	document.getElementById("buildButton").addEventListener("click", tabChangeHandlerCreator(buildTab));

	document.getElementById("searchButton").addEventListener("click", tabChangeHandlerCreator(searchTab));

	document.getElementById("rollButton").addEventListener("click", function () {
		currentItemRoll = roll(document.getElementById("rollTable"), filteredItemsData, itemRollHistory);
		redrawHistoryTable("itemRollHistoryTable", itemRollHistory, savedItemRolls)
	});
	document.getElementById("saveButton").addEventListener("click", function () {
		savedItemRolls.push(currentItemRoll);
		redrawSaveTable(document.getElementById("saveTable"), savedItemRolls)
	});

	document.getElementById("cursesRollButton").addEventListener("click", function () {
		currentCurseRoll = roll(document.getElementById("cursesRollTable"), cursesData, curseRollHistory);
		redrawHistoryTable("curseRollHistoryTable", curseRollHistory, savedCurseRolls)
	});

	document.getElementById("cursesSaveButton").addEventListener("click", function () {
		savedCurseRolls.push(currentCurseRoll);
		redrawSaveTable(document.getElementById("cursesSaveTable"), savedCurseRolls)
	});

	document.getElementById("buildExportButton").addEventListener("click", exportSaved);
	
	var itemsCategoriesFilters = document.querySelectorAll("#itemsCategoryFilter input");
	console.log(itemsCategoriesFilters);
	itemsCategoriesFilters[0].addEventListener("change", function () { //all gets special behavior
		for (var i = 1; i < itemsCategoriesFilters.length; i++) {
			itemsCategoriesFilters[i].checked = document.getElementById("itemsCategoryFilterAll").checked;
		}
		updateItemFilterData();
	})
	for (var i = 1; i < itemsCategoriesFilters.length; i++) {
		itemsCategoriesFilters[i].addEventListener("change", function () {
			itemsCategoriesFilters[0].checked = false;
			updateItemFilterData();
		})
	}
	//uses current data to check which headerToIndex function to use so things have to be initalized before adding event listener
	updateContentFilter();
	document.getElementById("searchItemsButton").addEventListener("click", searchHandlerCreator(itemsData, savedItemRolls, "searchItemsTable"))
	document.getElementById("searchCursesButton").addEventListener("click", searchHandlerCreator(cursesData, savedCurseRolls, "searchCursesTable"))

	//let user start rolling.
	hideAllBut(itemsTab);
};

window.addEventListener("click", function (event) {
	var historyModal = document.getElementById("rollHistory");
	var searchModal = document.getElementById("search");
	if (event.target === historyModal || event.target === searchModal) {
		historyModal.style.display = "none";
		searchModal.style.display = "none";
	}
});