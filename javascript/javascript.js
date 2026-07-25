var xhr = new XMLHttpRequest();
xhr.open("GET", "data/OmniGachaItemList.csv", false);
xhr.send(null);

var csvDataRaw = CSVToArray(xhr.responseText);

var NSFW = false;
var NSFWOnly = false;

var currentRoll;
//big string of CSV
var savedRolls = "Name,Series,Short Description,Category,Gender,Magic,Memetic,Might,Mind,Motion,Moxie,Mutation,Myth,Stats,Rank,Growth Type,Growth Rate,Restock,Return,Gift,NSFW";

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
	savedRolls = savedRolls.concat("\n", currentRoll.toString());
	var newRow = document.createElement("tr");
	newRow.innerHTML = document.querySelector("#rollTable tbody tr:last-child").innerHTML;
	if (newRow.childNodes.length <= 1) return; //because an empty element has a blank child node. for some reason. idk.
	document.querySelector("#saveTable > tbody").appendChild(newRow);
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
	//console.log(savedRolls);
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
