import { filteringHandler } from "./filteringHandler";
import { gachaBuildsOptionsHandler } from "./gachaBuildsOptionsHandler";
import { gachaCurse } from "./gachaCurse";
import { gachaItem } from "./gachaItem";

class pageHandler {
	

	//open the options submenu... this will do more later probably I think. more things to handle. same with bellow
	openOptions() {
		document.getElementById("optionsMenu").style.display = "flex"
	}

	closeOptions() {
		document.getElementById("optionsMenu").style.display = "none"
	}

	//call every that has something changed by options and change it, along with the html elements.
	applyAllOptions() {
		document.getElementById("optionsBackgroundToggle").checked = optionsValues.backgroundImage
		updateBackgroundImage();

		if (optionsValues.NSFW != undefined) {
			document.getElementById("nsfwCheckbox").checked = NSFW = optionsValues.NSFW
			document.getElementById("nsfwOnlyCheckbox").checked = NSFWOnly = optionsValues.NSFWOnly
		}
		contentFilterChange();

		populateBuildSelector();
	}

	//called by changed in options. depending on event target value do different things.
	optionChange(event) {
		var target = event.target;
		switch (target.value) {
			case "backgroundImage":
				optionsValues[target.value] = target.checked
				updateBackgroundImage()
				break;
		}
		optionsCookieSetFunction()
	}
	//if options say off, off. if options say on, on.
	updateBackgroundImage() {
		const root = document.querySelector(":root")
		if (optionsValues.backgroundImage) {
			document.body.style.backgroundImage = 'url("assets/Omni_Gacha_Background.png")';
			root.style.setProperty('--tint', "#00000066")
		}
		else {
			document.body.style.backgroundImage = "none";
			root.style.setProperty('--tint', "#00000000")
		}
	}

	populateBuildSelector() {
		const select = document.getElementById("optionsBuildSelector")
		select.textContent = "" //wipe with textContent to avoid .innerHTML

		const builds = optionsValues.buildsArray;
		if (builds.length == 0) {
			console.warn("warning, no builds. something has probably gone wrong.")
			return;
		}
		for (build of builds) {
			const option = document.createElement("option");
			option.value = build
			option.innerText = build
			select.appendChild(option)
		}

		select.value = optionsValues.build
	}

	/**
	 * create the logic for all sort buttons
	 */
	#createAllSortButtons() {
		
		//search tab
		for (let button of document.querySelectorAll("#searchItemsTable th button")) {
			button.addEventListener("click", function () {
				itemSearchResults.sort(compareFunctionCreator(parseInt(this.value), (this.className === "ascendingButton")))
				redrawHistoryTable("searchItemsTable", itemSearchResults, savedItemRolls);
			})
		}
		for (let button of document.querySelectorAll("#searchCursesTable th button")) {
			button.addEventListener("click", function () {
				curseSearchResults.sort(compareFunctionCreator(parseInt(this.value), (this.className === "ascendingButton")))
				redrawHistoryTable("searchCursesTable", curseSearchResults, savedCurseRolls);
			})
		}
	}

	//create a handler for selection button to call
	tabChangeHandlerCreator(targetTab) {
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
	redrawAllSaveTables() {
		//we don't want to update cookies here
		redrawSaveTable(document.getElementById("saveTable"), savedItemRolls, false);
		redrawSaveTable(document.getElementById("cursesSaveTable"), savedCurseRolls, false);
		redrawSaveTable(document.getElementById("buildItemsTable"), savedItemRolls, false);
		redrawSaveTable(document.getElementById("buildCursesTable"), savedCurseRolls, false);
	}

	// set all tabs display to none then the one targetTab to block
	hideAllBut(targetTab) {
		for (tab of document.querySelectorAll(".tabcontent")) {
			tab.style.display = "none"
		}
		targetTab.style.display = "block";
	}

	/*
	History handler creator returns a function to be called on click that will handle history.
	takes ID of the table to draw, history array to use, and save array to save to.
	*/
	redrawHistoryTable(tableID, historyArray, saveArray) {

		//function to pass to additionalButtonTableData
		function saveButtonFunctionCreator(saveArray, index) {
			var saveButtonFunction = function () {
				saveArray.push(historyArray[index])
				buildCookieSetFunction()
				redrawAllSaveTables()
			}
			return saveButtonFunction
		}

		var table = document.getElementById(tableID)
		var rows = [];

		for (var i = 0; i < historyArray.length; i++) {
			if (!historyArray[i]) break;
			var row = createRow(historyArray[i])
			row.append(additionalButtonTableData(saveButtonFunctionCreator(saveArray, i), "Save"))
			rows.push(row)
		}

		drawTableBody(table, rows)
	}




	//function that gets the index to sort on, and if isAscending == true, sort ascend. else sort by descending.
	compareFunctionCreator(index, isAscending) {
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
	rankToNumber(rank) {
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

	// get all items and curses, convert to strings (same as copy paste) then let user download txt file of them.
	exportSaved() {

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

	// gets random value from items or curses
	getRandomValue(array) {
		var randomIndex = Math.floor(Math.random() * array.length);
		return array[randomIndex];
	}
	// given a table element, a item/curse value and history array;
	// draw the value data and add the value to the historyArray.
	drawRollData(table, value, historyArray) {
		var newRow = createRow(value);

		drawTableBody(table, [newRow]);
		historyArray.unshift(value);
		return value;
	}

	//redraw a save table
	redrawSaveTable(table, data, save = true) {

		//if save tables are being redrawn, they're changing.
		//if they're changing, gotta update cookies.
		// save paramater exists so redrawAllSaveTables can override.
		if (save) buildCookieSetFunction()

		var rows = [];

		function buttonFunctionCreator(index) {
			var buttonFunction = function () {
				data.splice(index, 1);
				redrawSaveTable(table, data);
			}
			return buttonFunction
		}
		for (var i = 0; i < data.length; i++) {
			//for some unholy reason, on some browsers it's running when .length = 0, which should be impossible but whatever. fine. we deal.
			if (!data[i]) {
				//bad data, break;
				break;
			}
			var row = createRow(data[i])

			row.append(additionalButtonTableData(buttonFunctionCreator(i), "Remove"));

			rows.push(row);
		}

		drawTableBody(table, rows);
	}

	//return an additional TD element with an on "click" listener.
	//function and value determined by inputs.
	additionalButtonTableData(buttonFunction, buttonText) {
		var additionalItem = document.createElement("td");
		var itemButton = document.createElement("button");
		itemButton.innerText = buttonText;
		additionalItem.appendChild(itemButton);

		itemButton.addEventListener("click", buttonFunction);
		return additionalItem
	}


}