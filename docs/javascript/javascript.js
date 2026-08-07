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
var itemSearchResults = [];

var currentCurseRoll;
var savedCurseRolls = [];
var curseRollHistory = [];
var curseSearchResults = [];

var homeTab;
var itemsTab;
var cursesTab;
var buildTab;
var searchTab;

//todo, add options tab that lets you change build and thus cookie.
var cookieName = "default"

//incredibly important, nothing can be done without.
loadParseJSON()

/*
load, parse and set raw data variables.
I have come to despsise async and await and then and promises and general
I do not want to deal with ANY of that.
so we use a xml request for my own sanity.

as of commit f0cfdc87fea60e87e354a4f11efe806425798e1f i've learned how .then works.
it's uhh... past me is dumb bc it's easy.
but this still works so... doesn't really *need* to be rewritten.
*/
function loadParseJSON() {
	const xhr = new XMLHttpRequest();
	xhr.open("GET", "data/values.json", false); // false = synchronous
	xhr.send();

	values = JSON.parse(xhr.responseText);

	rawItemsData = values.items
	rawCursesData = values.curses
}

function savedToJsonString() {
	const json = {
		"items": savedItemRolls,
		"curses": savedCurseRolls
	}
	return JSON.stringify(json)
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
function redrawSaveTable(table, data, save = true) {

	//if save tables are being redrawn, they're changing.
	//if they're changing, gotta update cookies.
	// save paramater exists so redrawAllSaveTables can override.
	if (save) cookieSetFunction()

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
		for (filter of filterArray) {
			if (valuePart === filter.toLowerCase()) return true
		}
		return false;
	}
	return filterFunction
}
//same as above, but filter function looks for text matching, not exact matching. Unless it's a rank, where it has to be valueFiltered
function textValueFilter(filterArray, index) {
	var filterFunction = function (value) {
		const valuePart = value[index].toLowerCase();
		for (filter of filterArray) {
			if (valuePart.includes(filter.toLowerCase())) return true
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
	var tabChangeHandler = function () {
		document.querySelectorAll("#selector button")
		for (button of document.querySelectorAll("#selector button")) {
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
	//we don't want to update cookies here
	redrawSaveTable(document.getElementById("saveTable"), savedItemRolls, false);
	redrawSaveTable(document.getElementById("cursesSaveTable"), savedCurseRolls, false);
	redrawSaveTable(document.getElementById("buildItemsTable"), savedItemRolls, false);
	redrawSaveTable(document.getElementById("buildCursesTable"), savedCurseRolls, false);
}

// set all tabs display to none then the one targetTab to block
function hideAllBut(targetTab) {
	for (tab of document.querySelectorAll(".tabcontent")) {
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
function searchHandlerCreator(sourceArray, saveArray, tableID) {

	//use sourceArray to determine item or curse
	var headerToIndex
	var isCurse
	if (sourceArray[0].length > 10) {
		headerToIndex = itemHeaderToIndex
		isCurse = false
	}
	else {
		headerToIndex = curseHeaderToIndex
		isCurse = true
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

	var searchHandler = function (trigger) {
		console.log("search")
		var resultsArray = sourceArray;
		var inputs = trigger.parentElement.querySelectorAll("input");

		var advancedSearchValue = smartSplit(inputs[3].value);
		const advancedSearchVerifyPattern = /^[a-z0-9 ]+(,[a-z0-9 ]+)*:[a-z0-9 ]+(,[a-z0-9 ]+)*$/i;

		advancedSearchValue = advancedSearchValue.filter(function (value) {
			return (value.match(advancedSearchVerifyPattern));
		});

		for (var i = 0; i < 3; i++) {
			if (inputs[i].value == "") continue;
			resultsArray = resultsArray.filter(textValueFilter(inputs[i].value.toLowerCase().split(","), i))
		}
		/*
		probably not going to be a lot of mixing going on, while it's possible O(n^2) is unlikely.
		will in all likelyhood be closer to O(n) or best case O(1)
		*/
		for (searchValue of advancedSearchValue) {
			const arry = searchValue.split(":")
			var headers = arry[0].split(",")
			var terms = arry[1].split(",")

			var arrays = []

			for (header of headers) {
				const index = headerToIndex(header)

				if (isCurse) {
					arrays.push(resultsArray.filter(textValueFilter(terms, index)))
					continue;
				}
				else switch (index) {
					case ITEMS.NAME:
					case ITEMS.SERIES:
					case ITEMS.DESCRIPTION:
					case ITEMS.CATEGORY:
					case ITEMS.GENDER:

					case ITEMS.GROWTH_RATE:
					case ITEMS.GROWTH_TYPE:
					case ITEMS.RESTOCK:
					case ITEMS.RETURN:
					case ITEMS.GIFT:
					case ITEMS.NSFW:
						arrays.push(resultsArray.filter(textValueFilter(terms, index)))
						break;
					case ITEMS.MAGIC:
					case ITEMS.MEMETIC:
					case ITEMS.MIGHT:
					case ITEMS.MIND:
					case ITEMS.MOTION:
					case ITEMS.MOXIE:
					case ITEMS.MUTATION:
					case ITEMS.MYTH:
					case ITEMS.STATS:
					case ITEMS.RANK:
						arrays.push(resultsArray.filter(valueFilter(terms, index)))
						break;
					default:
						consolelog("Search Header Index not found, something seems to have gone wrong.")
				}
				/*
				switch inside an else, kinda cursed I know. but javascript doesn't really benifit massively optimization wize from switch statements, or so I heard
				could have done:
				switch(true){
					case: (index < ITEMS.GENDER)
					case: (isCurse)
						textValueFilter...
						break;
					(etc...)
				}
				but I figured the abovce was more readable and easier to change. And if it is worse, I've made worse decisions in this code.
				TODO: give STATS it's own filter that takes a range of nubmers.
				*/
			}

			resultsArray = arrayMerge(arrays);
		}
		if (isCurse) curseSearchResults = resultsArray
		else itemSearchResults = resultsArray
		redrawHistoryTable(tableID, resultsArray, saveArray)
	}
	return searchHandler
}

//merges an array of arrays (if an item is in either array, it's in the new one), discards duplicates, and returns the new merged array
//will throw an error if you pass in a blank array.
function arrayMerge(sourceArrays) {
	//recursive base statement
	if (sourceArrays.length == 1) return sourceArrays[0]

	//get first two arrays
	var subArray1 = sourceArrays[0]
	var subArray2 = sourceArrays[1]

	//trim shared elements out of subArray2
	subArray2 = subArray2.filter(function (element) {
		return !((subArray1.indexOf(element) != -1) && subArray2.indexOf(element) != -1)
	})

	//merge elements and place back in source.
	subArray1 = subArray1.concat(subArray2);
	sourceArrays.splice(0, 2, subArray1)
	//enter recursion
	return arrayMerge(sourceArrays)
}


//set of functions for search handler that... well.. pretty obvvious.
function itemHeaderToIndex(header) {
	var headerArray = ["name", "series", "description", "category", "gender", "magic", "memetic", "might", "mind", "motion", "moxie", "mutation", "myth", "stats", "rank", "growth type", "growth rate", "restock", "return", "gift", "nsfw"]
	return headerArray.indexOf(header.toLowerCase())
}

function curseHeaderToIndex(header) {
	var headerArray = ["curse", "description", "resolution", "level", "target", "affects", "nsfw", "reward"]
	return headerArray.indexOf(header.toLowerCase())
}
//function that gets the index to sort on, and if isAscending == true, sort ascend. else sort by descending.
function compareFunctionCreator(index, isAscending) {
	var lessValue;
	var greaterValue;
	if (isAscending) {
		lessValue = -1
		greaterValue = 1
	}
	else {
		lessValue = 1
		greaterValue = -1
	}
	function compare(a, b) {
		switch (true) {
			case (a < b):
				return lessValue;
			case (a > b):
				return greaterValue;
			default:
				return 0;
		}
	}

	function standardCompare(a, b) {
		return compare(a[index], b[index])
	}

	function rankCompare(a, b) {
		return compare(rankToNumber(a[index]), rankToNumber(b[index]))
	}

	var compareFunction
	if ((ITEMS.MAGIC <= index && index <= ITEMS.MYTH) || index == ITEMS.RANK) compareFunction = rankCompare
	else compareFunction = standardCompare
	return compareFunction
}
//converts a rank to a number for sorting/ordering purposes, and returns the number. if rank doesn't match anything return rank.
function rankToNumber(rank) {
	switch (rank.toLowerCase()) {
		case "f":
			return 0;
		case "e":
			return 1;
		case "d":
			return 2;
		case "c":
			return 3;
		case "b":
			return 4;
		case "a":
			return 5;
		case "s":
			return 6;
		case "ss":
			return 7;
		case "sss":
			return 8;
		case "ex":
			return 9;
		default:
			return rank;
	}
}

//do this in it's own function and call on window load to make it more readable
function createAllSortButtons() {
	// items tab
	for (button of document.querySelectorAll("#saveTable th button")) {
		button.addEventListener("click", function () {
			savedItemRolls.sort(compareFunctionCreator(parseInt(this.value), (this.className === "ascendingButton")))
			redrawSaveTable(document.getElementById("saveTable"), savedItemRolls);
		})
	}
	for (button of document.querySelectorAll("#itemRollHistory th button")) {
		button.addEventListener("click", function () {
			itemRollHistory.sort(compareFunctionCreator(parseInt(this.value), (this.className === "ascendingButton")))
			redrawHistoryTable("itemRollHistory", itemRollHistory, savedItemRolls);
		})
	}

	//curse tab
	for (button of document.querySelectorAll("#cursesSaveTable th button")) {
		button.addEventListener("click", function () {
			savedCurseRolls.sort(compareFunctionCreator(parseInt(this.value), (this.className === "ascendingButton")))
			redrawSaveTable(document.getElementById("cursesSaveTable"), savedCurseRolls);
		})
	}
	for (button of document.querySelectorAll("#curseRollHistoryTable th button")) {
		button.addEventListener("click", function () {
			curseRollHistory.sort(compareFunctionCreator(parseInt(this.value), (this.className === "ascendingButton")))
			redrawHistoryTable("curseRollHistoryTable", curseRollHistory, savedCurseRolls);
		})
	}

	//build tab
	for (button of document.querySelectorAll("#buildItemsTable th button")) {
		button.addEventListener("click", function () {
			savedItemRolls.sort(compareFunctionCreator(parseInt(this.value), (this.className === "ascendingButton")))
			redrawSaveTable(document.getElementById("buildItemsTable"), savedItemRolls);
		})
	}
	for (button of document.querySelectorAll("#buildCursesTable th button")) {
		button.addEventListener("click", function () {
			savedCurseRolls.sort(compareFunctionCreator(parseInt(this.value), (this.className === "ascendingButton")))
			redrawSaveTable(document.getElementById("buildCursesTable"), savedCurseRolls);
		})
	}

	//search tab
	for (button of document.querySelectorAll("#searchItemsTable th button")) {
		button.addEventListener("click", function () {
			itemSearchResults.sort(compareFunctionCreator(parseInt(this.value), (this.className === "ascendingButton")))
			redrawHistoryTable("searchItemsTable", itemSearchResults, savedItemRolls);
		})
	}
	for (button of document.querySelectorAll("#searchCursesTable th button")) {
		button.addEventListener("click", function () {
			curseSearchResults.sort(compareFunctionCreator(parseInt(this.value), (this.className === "ascendingButton")))
			redrawHistoryTable("searchCursesTable", curseSearchResults, savedCurseRolls);
		})
	}
}

//save saved rolls into a cookie :)
function cookieSetFunction() {
	cookieStore.set(cookieName, savedToJsonString()).then(function () {
		//TODO, PROPER COOKIE PROMISE HANDLING
		//TODO, MAKE COOKIES PERSIST AFTER SESSION
	})
}
// initiate cookie data, if it exits
// handle creating sort buttons here bc I fear a race condition.
function cookieInit() {
	cookieStore.get(cookieName).then(function (result) {
		if (result) {
			console.log("cookies got!")
			const json = JSON.parse(result.value)
			savedItemRolls = json.items
			savedCurseRolls = json.curses
			redrawAllSaveTables()
			createAllSortButtons();
		}
		else {
			console.log("cookies not got!")
			createAllSortButtons();
		}
	})
}

/*
I'm fucking sorry for whatever this is.
init the canvas, load the image, create the animation functions, and finally create the event handler.
TODO; make this call roll at end of animation, and click to skip and get roll early.
*/
function canvasInit(canvasID, eventName) {
	const event = new Event(eventName)
	const canvas = document.getElementById(canvasID)
	const gumballImage = new Image()

	gumballImage.addEventListener("load", function () {
		const scale = 2
		canvas.width = this.naturalWidth * scale
		canvas.height = this.naturalHeight * scale
		const ctx = canvas.getContext("2d")
		ctx.drawImage(this, 0, 0, canvas.width, canvas.height)
		const cutoff = 255 * scale
		const radius = 20 * scale
		var y = cutoff - radius;
		const velocity = 2 * scale
		const dialCenter = 215 * scale
		const dialRadius = scale
		var angle = 0;
		const angleVelocity = Math.PI / 16.0

		ctx.lineWidth = 1
		drawTurnDial()
		ctx.save()
		
		// draw the dial, rotated by angle default 0
		function drawTurnDial(angle = 0){
			ctx.beginPath()
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.drawImage(gumballImage, 0, 0, canvas.width, canvas.height)
			ctx.fillStyle = "grey"
			ctx.arc(canvas.width / 2, dialCenter, radius, 0, 2*Math.PI)
			ctx.fill()
			ctx.beginPath()
			ctx.translate(canvas.width/2, dialCenter)
			ctx.rotate(angle)
			ctx.fillStyle = "#404040"
			ctx.moveTo(0 - dialRadius * 10, 0)
			ctx.lineTo(dialRadius * 10, 0)
			ctx.lineWidth = 3 * scale;
			ctx.stroke()
			ctx.resetTransform()
		}
		// animation to rotate dial
		var currentFrame;
		function rotateTurnDial(){
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.drawImage(gumballImage, 0, 0, canvas.width, canvas.height)
			drawTurnDial(angle)
			if(angle > Math.PI){
				window.cancelAnimationFrame(currentFrame)
				angle = 0
				ctx.beginPath()
				ctx.rect(0, cutoff, canvas.width, canvas.height)
				ctx.clip()
				currentFrame = window.requestAnimationFrame(dropBall)
				return
			}
			angle+=angleVelocity;
			currentFrame = window.requestAnimationFrame(rotateTurnDial)
			
		}
		// animation to drop ball.
		function dropBall() {
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.drawImage(gumballImage, 0, 0, canvas.width, canvas.height)
			ctx.beginPath()
			ctx.fillStyle = "blue";
			ctx.arc(canvas.width / 2, y, radius, 0, Math.PI, false)
			ctx.closePath()
			ctx.fill()
			ctx.beginPath()
			ctx.fillStyle = "white";
			ctx.arc(canvas.width / 2, y, radius, 0, Math.PI, true)
			ctx.closePath()
			ctx.fill()
			y += velocity
			if (y >= 280 * scale) {
				window.cancelAnimationFrame(currentFrame)
				currentFrame = null
				y = cutoff - radius*2;
				canvas.dispatchEvent(event)
				return;
			}
			currentFrame = window.requestAnimationFrame(dropBall)
		}
		canvas.addEventListener("click", function(){
			// if there's already a currentFrame, return.
			if(currentFrame) return
			ctx.restore()
			ctx.save()
			currentFrame = window.requestAnimationFrame(rotateTurnDial)
		})
	})
	gumballImage.src = "assets/Ball_machine_overworld.png"
}

window.onload = function () {

	cookieInit()
	canvasInit("rollButton", "gachaFinish")

	document.getElementById("contentOptions").addEventListener("change", updateContentFilter)

	document.getElementById("ticketSelector").addEventListener("change", updateItemFilterData);

	homeTab = document.getElementById("home");
	aboutTab = document.getElementById("about");
	itemsTab = document.getElementById("items");
	cursesTab = document.getElementById("curses");
	buildTab = document.getElementById("build");
	searchTab = document.getElementById("search");

	homeButton = document.getElementById("homeButton");
	homeButton.addEventListener("click", tabChangeHandlerCreator(homeTab));
	document.getElementById("logo").addEventListener("click", function () { homeButton.click() }) //mirror above event

	document.getElementById("itemsButton").addEventListener("click", tabChangeHandlerCreator(itemsTab));

	document.getElementById("aboutButton").addEventListener("click", tabChangeHandlerCreator(aboutTab));

	document.getElementById("cursesButton").addEventListener("click", tabChangeHandlerCreator(cursesTab));

	document.getElementById("buildButton").addEventListener("click", tabChangeHandlerCreator(buildTab));

	document.getElementById("searchButton").addEventListener("click", tabChangeHandlerCreator(searchTab));

	document.getElementById("rollButton").addEventListener("gachaFinish", function () {
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
	// needs to be in a function like this to avoid stale content in itemsData and cursesData
	updateContentFilter();
	document.getElementById("searchItemsButton").addEventListener("click", function () {
		searchHandlerCreator(itemsData, savedItemRolls, "searchItemsTable")(this)
	})
	document.getElementById("searchCursesButton").addEventListener("click", function () {
		searchHandlerCreator(cursesData, savedCurseRolls, "searchCursesTable")(this)
	})

	//let user start rolling.
	homeButton.click()
};