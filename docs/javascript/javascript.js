var NSFW = false;
var NSFWOnly = false;

var rawItemsData;
var rawCursesData;

var currentItemRoll;
var savedItemRolls = [];

var currentCurseRoll;
var savedCurseRolls = [];

var itemsTab;
var cursesTab;
var buildTab;

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

//designed to be repeatidly callled for multiple filters in search. returns a new array with the filtered data.
function filterCSVData(csvData, filter) {
	return csvData.filter((item) => filter(item));
}

function itemToString(item) {
	var sfw = ""
	if (item[20] === "TRUE") sfw = " | NSFW"
	return `${item[0]} | ${item[1]}\nRank ${item[14]} | ${item[3]}${sfw}\n${item[2]}`
}

function curseToString(curse) {
	var sfw = ""
	if (curse[6] === "TRUE") sfw = " | NSFW"
	return `${curse[0]} | ${curse[3]}${sfw}\n${curse[1]}\nResolution: ${curse[2]}`
}

function NSFWfilter(Data, NSFW, NSFWOnly, index) {
	if (NSFW == false) return filterCSVData(Data, function (item) { return item[index] == "FALSE" });
	if (NSFWOnly == true) return filterCSVData(Data, function (item) { return item[index] == "TRUE" });
	return Data;
}


function getRandomItem(itemArray) {
	var randomIndex = Math.floor(Math.random() * itemArray.length);
	return itemArray[randomIndex];
}

function roll(table, data) {
	var element = getRandomItem(data);
	var newRow = createRow(element);

	table.querySelector("tbody tr").replaceWith(newRow);

	return element;
}

function redrawSaveTable(table, data) {
	var rows = [];
	data.forEach(function (item, index) {
		var row = createRow(item)
		var deleteItem = document.createElement("td");
		var deleteButton = document.createElement("button");
		deleteButton.innerText = "Remove"
		deleteItem.appendChild(deleteButton);

		deleteButton.addEventListener("click", function () {
			data.splice(index, 1);
			redrawSaveTable(table, data);
		});
		row.appendChild(deleteItem);


		var nameElement = row.querySelector("td p");
		nameElement.classList.add("saveTableNameData")
		nameElement.addEventListener("click", function () {
			var copytext;
			if (item.length > 14) copytext = itemToString(item);
			else copytext = curseToString(item);

			navigator.clipboard.writeText(copytext);
		});

		rows.push(row);
	})



	drawTableBody(table, rows);
}
//given array convert to tr element with td data
//TODO: Implement everywhere
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

function updateItemFilterData() {
	filteredItemsData = itemsCSVData;
	filteredItemsData = FilterTicketData(filteredItemsData);
	filteredItemsData = filterItemByCategory(filteredItemsData);
	console.log(filteredItemsData);
}

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

	return filterCSVData(itemsData, function (item) { return filter.includes(item[14]) });
}

function filterItemByCategory(itemsData) {
	var itemsCategoriesFilters = document.querySelectorAll("#itemsCategoryFilter input");
	var filter = ""

	if (itemsCategoriesFilters[0].checked) return itemsData;

	for (var item of itemsCategoriesFilters) {
		if (item.checked) filter += item.value;
	}

	return itemsData.filter((item, index) => filter.search(new RegExp(item[3], "i")) != -1);
}

function searchFor(string) {
	var regex = new RegExp(string, "i");
	var searchResults = itemsCSVData.filter(function (item) {
		return item[0].concat(item[1], item[2]).search(regex) != -1;
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

function tabChange(tab) {
	redrawSaveTable(document.getElementById("saveTable"), savedItemRolls);
	redrawSaveTable(document.getElementById("cursesSaveTable"), savedCurseRolls);
	redrawSaveTable(document.getElementById("buildItemsTable"), savedItemRolls);
	redrawSaveTable(document.getElementById("buildCursesTable"), savedCurseRolls);

	hideAllBut(tab);
}

function hideAllBut(tab) {
	cursesTab.style.display = "none";
	itemsTab.style.display = "none";
	buildTab.style.display = "none";
	tab.style.display = "block";
}

window.onload = function () {
	document.getElementById("contentOptions").addEventListener("change", function () {
		NSFW = document.getElementById("nsfwCheckbox").checked;
		NSFWOnly = document.getElementById("nsfwOnlyCheckbox").checked;
		if (NSFW) document.querySelector("#contentOptions > span:last-child").style.visibility = "visible";
		else document.querySelector("#contentOptions > span:last-child").style.visibility = "hidden";

		itemsCSVData = NSFWfilter(itemsCSVDataRaw, NSFW, NSFWOnly, itemsCSVDataRaw[0].length - 1);
		cursesCSVData = NSFWfilter(cursesCSVDataRaw, NSFW, NSFWOnly, 6);
		updateItemFilterData();
	});

	document.getElementById("ticketSelector").addEventListener("change", updateItemFilterData);

	this.itemsTab = document.getElementById("items");
	this.cursesTab = document.getElementById("curses");
	this.buildTab = document.getElementById("build");

	document.getElementById("itemsButton").addEventListener("click", function () {
		tabChange(itemsTab);
	});
	document.getElementById("cursesButton").addEventListener("click", function () {
		tabChange(cursesTab);
	});
	document.getElementById("buildButton").addEventListener("click", function () {
		tabChange(buildTab);
	});
	document.getElementById("rollButton").addEventListener("click", function () {
		currentItemRoll = roll(document.getElementById("rollTable"), filteredItemsData);
	});
	document.getElementById("saveButton").addEventListener("click", function () {
		savedItemRolls.push(currentItemRoll);
		redrawSaveTable(document.getElementById("saveTable"), savedItemRolls)
	});

	document.getElementById("cursesRollButton").addEventListener("click", function () {
		currentCurseRoll = roll(document.getElementById("cursesRollTable"), cursesCSVData);
	});
	document.getElementById("cursesSaveButton").addEventListener("click", function () {
		savedCurseRolls.push(currentCurseRoll);
		redrawSaveTable(document.getElementById("cursesSaveTable"), savedCurseRolls)
	});

	document.getElementById("historyButton").addEventListener("click", function () {
		document.getElementById("rollHistory").style.display = "block";
	});
	document.getElementById("searchOpenButton").addEventListener("click", function () {
		document.getElementById("search").style.display = "block";
	});
	document.getElementById("searchModalButton").addEventListener("click", function () {
		searchFor(document.querySelector("#search > div > input").value);
	});
	document.getElementById("buildExportButton").addEventListener("click", exportSaved);

	document.getElementById("itemsCategoryFilter").addEventListener("mouseover", function () {
		document.getElementById("itemsCategoryFilter").open = true;
	})

	document.getElementById("itemsCategoryFilter").addEventListener("mouseout", function () {
		document.getElementById("itemsCategoryFilter").open = false;
	})

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

/*
variables renamed just to test, should be changed and replaced later
but thats work for the formatting fixup branch
for now we just do this for testing, then merge into dev to be fixed in proper branch.
*/
var itemsCSVDataRaw = rawItemsData;
var cursesCSVDataRaw = rawCursesData;

var itemsCSVData = NSFWfilter(itemsCSVDataRaw, NSFW, NSFWOnly, itemsCSVDataRaw[0].length - 1);
var cursesCSVData = NSFWfilter(cursesCSVDataRaw, NSFW, NSFWOnly, 6);
var filteredItemsData = itemsCSVData;