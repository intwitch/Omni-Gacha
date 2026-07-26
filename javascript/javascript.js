var xhr = new XMLHttpRequest();
xhr.open("GET", "data/OmniGachaItemList.csv", false);
xhr.send(null);

var itemsCSVDataRaw = CSVToArray(xhr.responseText);

var xhr = new XMLHttpRequest();
xhr.open("GET", "data/OmniGachaCurses.csv", false);
xhr.send(null);

var cursesCSVDataRaw = CSVToArray(xhr.responseText);

var NSFW = false;
var NSFWOnly = false;

var currentItemRoll;
var savedItemRolls = [];

var currentCurseRoll;
var savedCurseRolls = [];

var itemsTab;
var cursesTab;

//designed to be repeatidly callled for multiple filters in search. returns a new array with the filtered data.
function filterCSVData(csvData, filter) {
	return csvData.filter((item) => filter(item));
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
		rowData += "<td>" + array[i] + "</td>";
	}
	newRow.innerHTML = rowData;
	return newRow;
}
//given a table and an array of rows (tr element) , clear then draw them to tbody
function drawTableBody(table, rows) {
	var tbody = table.getElementsByTagName("tbody")[0];
	tbody.innerHTML = "";
	rows.forEach(function (row) {
		tbody.appendChild(row)
	});
}

function updateTicketData() {
	var ticketValue = document.getElementById("ticketSelector").value;
	var filter;
	switch (ticketValue) {
		case "0":
		default:
			ticketData = itemsCSVData;
			return;
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

	ticketData = filterCSVData(itemsCSVData, function (item) { return filter.includes(item[14]) });
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

function exportSavedItems() {
	var link = document.createElement("a");
	var file = new Blob([savedItemRolls], { type: 'text/plan' });
	link.href = URL.createObjectURL(file)
	link.download = "Omni Gacha rolls.csv"
	link.click();
	URL.revokeObjectURL(link.href);
	console.log(savedItemRolls);
}

function exportSavedCurses() {
	var link = document.createElement("a");
	var file = new Blob([savedCurseRolls], { type: 'text/plan' });
	link.href = URL.createObjectURL(file)
	link.download = "Omni Gacha curses.csv"
	link.click();
	URL.revokeObjectURL(link.href);
	console.log(savedCurseRolls);
}

function hideAllBut(tab) {
	cursesTab.style.display = "none";
	itemsTab.style.display = "none";
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
		updateTicketData();
	});

	document.getElementById("ticketSelector").addEventListener("change", updateTicketData);

	this.itemsTab = document.getElementById("items");
	this.cursesTab = document.getElementById("curses");


	document.getElementById("itemsButton").addEventListener("click", function () {
		hideAllBut(itemsTab);
	});
	document.getElementById("cursesButton").addEventListener("click", function () {
		hideAllBut(cursesTab);
	});
	document.getElementById("rollButton").addEventListener("click", function () {
		currentItemRoll = roll(document.getElementById("rollTable"), ticketData);
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
	document.getElementById("exportButton").addEventListener("click", exportSavedItems);
	document.getElementById("cursesExport").addEventListener("click", exportSavedCurses);


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

var itemsCSVData = NSFWfilter(itemsCSVDataRaw, NSFW, NSFWOnly, itemsCSVDataRaw[0].length - 1);
var cursesCSVData = NSFWfilter(cursesCSVDataRaw, NSFW, NSFWOnly, 6);
var ticketData = itemsCSVData; //default