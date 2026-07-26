var xhr = new XMLHttpRequest();
xhr.open("GET", "data/OmniGachaItemList.csv", false);
xhr.send(null);

var csvDataRaw = CSVToArray(xhr.responseText);

var NSFW = false;
var NSFWOnly = false;

var currentRoll;
//big string of CSV
var savedRolls = [];

//designed to be repeatidly callled for multiple filters in search. returns a new array with the filtered data.
function filterCSVData(csvData, filter) {
	return csvData.filter((item) => filter(item));
}

function NSFWfilter(NSFW, NSFWOnly) {
	if(NSFW == false) return filterCSVData(csvDataRaw, function(item) {return item[20] == "FALSE"});
	if(NSFWOnly == true) return filterCSVData(csvDataRaw, function(item) {return item[20] == "TRUE"});
	return csvDataRaw;
}


function getRandomItem(itemArray) {
	var randomIndex = Math.floor(Math.random() * itemArray.length);
	return itemArray[randomIndex];
}

function roll() {
	var newRow = document.createElement("tr");
	var element = getRandomItem(ticketData);
	currentRoll = element;
	newRow.innerHTML = "<td>" + element[0] + "</td><td>" + element[1] + "</td><td>" + element[2] + "</td><td>" + element[3] + "</td><td>" + element[4] + "</td><td>" + element[5] + "</td><td>" + element[6] + "</td><td>" + element[7] + "</td><td>" + element[8] + "</td><td>" + element[9] + "</td><td>" + element[10] + "</td><td>" + element[11] + "</td><td>" + element[12] + "</td><td>" + element[13] + "</td><td>" + element[14] + "</td><td>" + element[15] + "</td><td>" + element[16] + "</td><td>" + element[17] + "</td><td>" + element[18] + "</td><td>" + element[19] + "</td><td>" + element[20] + "</td>";

	document.querySelector("#rollHistory tr:first-child").after(document.querySelector("#rollTable tbody tr:last-child"))
	document.querySelector("#rollTable tbody").append(newRow);
}

function save() {
	const saveTable = document.getElementById("saveTable");
	savedRolls.push(currentRoll);
	newRow = createRow(currentRoll);
	var deleteItem = document.createElement("td")
	var deleteButton = document.createElement("button")
	deleteButton.innerText = "Remove";

	deleteItem.appendChild(deleteButton);
	newRow.appendChild(deleteItem);
	deleteButton.addEventListener("click", function(){

		/*okay, this is weird and complicated.
		if we pass index of current item in array within two deletes they could get desnycronized
		index delete buttons will end up looking like:
		[1, 2, 3, 4] -> [1, 2, 4]
		so instead, my approach is to figure out how many previous siblings the row element has, and pass that to the splice.
		previous element loops until null then returns count.

		a better solution may be a map or something but......... idk.
		*/

		var index = -1; //it's somehow managing to find a previous sibling. I don't get it either.
		var row = deleteButton.parentElement.parentElement;
		while (row.previousSibling != null){
			index++;
			row = row.previousSibling;
		}

		savedRolls.splice(index, 1);
		deleteButton.parentElement.parentElement.remove(); //scary
	});

	saveTable.getElementsByTagName("tbody")[0].append(newRow);
}
//given array convert to tr element with td data
//TODO: Implement everywhere
function createRow(array){
	var newRow = document.createElement("tr");
	newRow.innerHTML = "<td>" + array[0] + "</td><td>" + array[1] + "</td><td>" + array[2] + "</td><td>" + array[3] + "</td><td>" + array[4] + "</td><td>" + array[5] + "</td><td>" + array[6] + "</td><td>" + array[7] + "</td><td>" + array[8] + "</td><td>" + array[9] + "</td><td>" + array[10] + "</td><td>" + array[11] + "</td><td>" + array[12] + "</td><td>" + array[13] + "</td><td>" + array[14] + "</td><td>" + array[15] + "</td><td>" + array[16] + "</td><td>" + array[17] + "</td><td>" + array[18] + "</td><td>" + array[19] + "</td><td>" + array[20] + "</td>";
	return newRow;
}
//given a table and an array of rows (tr element) , clear then draw them to tbody
function drawTableBody(table, rows){
	var tbody = table.getElementsByTagName("tbody")[0];
	rows.forEach(function(row) {
		tbody.append.Child(row)
	});
}

function updateTicketData() {
	var ticketValue = document.getElementById("ticketSelector").value;
	var filter;
	switch (ticketValue) {
		case "0":
		default:
			ticketData = csvData;
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

	ticketData = filterCSVData(csvData, function (item) { return filter.includes(item[14]) });
}

function searchFor(string) {
	var regex = new RegExp(string, "i");
	var searchResults = csvData.filter(function(item) {
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

function exportSaved(){
	var link = document.createElement("a");
	var file = new Blob([savedRolls], {type: 'text/plan'});
	link.href = URL.createObjectURL(file)
	link.download = "Omni Gacha rolls.csv"
	link.click();
	URL.revokeObjectURL(link.href);
	console.log(savedRolls);
}

window.onload = function() {
	document.getElementById("contentOptions").addEventListener("change", function() {
		NSFW = document.getElementById("nsfwCheckbox").checked;
		NSFWOnly = document.getElementById("nsfwOnlyCheckbox").checked;
		if (NSFW) document.querySelector("#contentOptions > span:last-child").style.visibility = "visible";
		else document.querySelector("#contentOptions > span:last-child").style.visibility = "hidden";

		csvData = NSFWfilter(NSFW, NSFWOnly);
		updateTicketData();
	});

	document.getElementById("ticketSelector").addEventListener("change", updateTicketData);
	/*
	var searchfield = document.querySelector("#search > div > input");
	searchfield.addEventListener("onkeyup", searchFor(searchfield.value));
	no, I don't know why this didn't work.
	*/
};

window.onclick = function (event) {
	var historyModal = document.getElementById("rollHistory");
	var searchModal = document.getElementById("search");
	if (event.target == historyModal || event.target == searchModal) {
		historyModal.style.display = 'none';
		searchModal.style.display = 'none';
	}
} 

var csvData = NSFWfilter(NSFW, NSFWOnly);

var ticketData = csvData; //default
