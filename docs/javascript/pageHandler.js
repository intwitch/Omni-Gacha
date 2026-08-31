import { filteringHandler } from "./filteringHandler";
import { gachaBuildsOptionsHandler } from "./gachaBuildsOptionsHandler";
import { gachaCurse } from "./gachaCurse";
import { gachaItem } from "./gachaItem";
import { gachaTerm } from "./gachaTerm";

class pageHandler {

	/**@type {filteringHandler} */
	#filteringHandler
	
	/**@type {gachaBuildsOptionsHandler} */
	#buildsOptions

	/**
	 * @type {{
	 * 	items: gachaItem[],
	 * 	curses: gachaCurse[]
	 * }}
	 */
	#history = {
		items: [],
		curses: []
	}

	/**
	 * event for a table to dispatch when redraw is wanted. Alows better handling
	 * @type {event}
	 */
	static tableRedrawRequest = new Event("tableRedrawRequest")

	/**
	 * 
	 * @param {filteringHandler} filteringHandler constructed filtering handler
	 * @param {gachaBuildsOptionsHandler} buildsOptions constructed handler
	 */
	constructor(filteringHandler, buildsOptions){
		this.#filteringHandler = filteringHandler
		this.#buildsOptions = buildsOptions
	}
	

	/**
	 * display the options menu
	 */
	static openOptions() {
		document.getElementById("optionsMenu").style.display = "flex"
	}

	/**
	 * close the coptions menu
	 */
	static closeOptions() {
		document.getElementById("optionsMenu").style.display = "none"
	}

	/**
	 * update option checkboxes/other things, and then apply them
	 */
	#applyAllOptions() {

		this.#applyBackgroundImage()

		populateBuildSelector();
	}
	/**
	 * update the background image checkbox element
	 * @param {boolean} isOn if it's on or not 
	 */
	#updateBackgroundImageOptionElement(isOn = this.#buildsOptions.getOption("backgroundImage")){
		document.getElementById("optionsBackgroundToggle").checked = isOn
		this.updateBackgroundImage(isOn)
	}

	/**
	 * update the background image itself.
	 * @param {boolean} isOn 
	 */
	#applyBackgroundImage(isOn = this.#buildsOptions.getOption("backgroundImage")) {
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

	/**
	 * update the physical checkboxes with the saved options, then update the #filteringHandlers data
	 * should not be called outside of initialization
	 * @param {boolean} NSFW 
	 * @param {boolean} NSFWOnly 
	 */
	#updateContentOptionsElement(NSFW = this.#buildsOptions.getOption("NSFW"), NSFWOnly = this.#buildsOptions.getOption("NSFWOnly")){
		const nsfwElement = document.getElementById("nsfwCheckbox")
		const nsfwOnlyElement = document.getElementById("nsfwOnlyCheckbox")

		nsfwElement.checked = NSFW
		nsfwOnlyElement.checked = NSFWOnly

		if(NSFW || NSFWOnly) nsfwOnlyElement.display = "hide";
		else nsfwOnlyElement.display = "block"

		this.#filteringHandler.updateContentFilter()
	}

	/**
	 * populate the build <selector> element with options.
	 * should be called whenever a build is added or deleted
	 */
	populateBuildSelector() {
		const select = document.getElementById("optionsBuildSelector")
		select.textContent = "" //wipe with textContent to avoid .innerHTML

		const builds = this.#buildsOptions.getOption("buildsArray")
		if (builds.length == 0) {
			console.warn("warning, no builds. something has probably gone wrong.")
			return;
		}
		for (let build of builds) {
			const option = document.createElement("option");
			option.value = build
			option.innerText = build
			select.appendChild(option)
		}

		select.value = this.#buildsOptions.getOption("build")
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

	/**
	 * change tab button colors then change to target tab
	 * do not override this context when passing to event listenter
	 * if this != 
	 * @param {Event} event 
	 * @param {string} targetTabID
	 * @example .addeventListener("click", (event) => { changeTabButtonListener(event, "someTabID") })
	 */
	changeTabButtonListener(event, targetTabID) {
		pageHandler.contextCheck();
		let root = getComputedStyle(document.querySelector(":root"))
		for (let button of document.querySelectorAll("#selector button")) {
			button.style.backgroundColor = root.getPropertyValue("--unselected-button-color")
		}
		event.currentTarget.style.backgroundColor = root.getPropertyValue("--selected-button-color")
		this.changeTabTo(targetTabID);
	}

	/**
	 * if this is not pageHandler throw a referenceError
	 */
	static contextCheck() {
		if (!(this instanceof pageHandler)) throw new ReferenceError("this is not and instance of pageHandler. did you override the context?");
	}

	/**
	 * 
	 * @param {string} targetTabID 
	 */
	changeTabTo(targetTabID) {
		const tab = document.getElementById(targetTabID)
		for (tab of document.querySelectorAll(".tabcontent")) {
			tab.style.display = "none"
		}
		tab.style.display = "block";
	}
	/**
	 * function to call when button is clicked.
	 * only other thing that eventlistener does is redraw the table after callback function runs
	 * 
	 * @callback buttonCallback
	 * @param {gachaTerm[]} sourceDataArray
	 * @param {number} index index of calling item in sourceDataArray
	 * @param {...*} args wildcard, whatever you want to define
	 */
	
	/**
	 * redraw a table with a button, determined by the content and function arguments
	 * @param {string} tableID 
	 * @param {(gachaTerm)[]} dataArray 
	 * @param {string|Element} buttonContent what to apppend to the button element
	 * @param {buttonCallback} buttonCallback
	 * @param {*[]} args args to pass to buttonCallback
	 */

	#redrawTableWithButton(tableID, dataArray, buttonContent, buttonCallback, args) {
		const rows = []

		for(let i = 0; i < dataArray.length; i++){
			const row = dataArray[i].toFullRow()
			const button = document.createElement("button")
			row.appendChild(document.createElement("td")).appendChild(button)

			button.append(buttonContent)
			button.addEventListener("click", () => { 
				buttonCallback(dataArray, i, ...args)
			})
		}

		this.#redrawTableBody(tableID, rows)
	}

	/**
	 * listener to handle redrawing a history table.
	 * call using => function. do not override this.
	 * @param {event} e passed by event listener
	 * @param {string} term "items"/curses
	 */
	redrawHistoryTableListener(e, term){
		const historyDataArray = this.#history[term]

		this.#redrawTableWithButton(e.currentTarget, historyDataArray, "Save", this.#buttonCallbackSave, term)
	}

	/**
	 * listener to handle redrawing a save table.
	 * call using => function. do not override this.
	 * @param {event} e passed by event listener
	 * @param {string} term "items"/curses
	 */
	redrawSaveTableListener(e, term){
		this.#redrawTableWithButton(e.currentTarget, this.#buildsOptions.getCurrentSaved(term), "remove", this.#buttonCallbackRemove, term)
	}

	/**
	 * listener to handle redrawing a search table.
	 * call using => function. do not override this.
	 * @param {event} e passed by event listener
	 * @param {string} term "items"/curses
	 */
	redrawSearchTableListener(e, term){
		const searchString = this.getSearchString(term);
		const dataArray = this.#filteringHandler.searchTerm(searchString, term)

		this.#redrawTableWithButton(e.currentTarget, dataArray, "save", this.#buttonCallbackSave, term)
	}

	/**
	 * listener to handle redrawing a roll table.
	 * call using => function. do not override this.
	 * @param {event} e passed by event listener
	 * @param {string} term "items"/curses
	 */
	redrawRollTableListener(e, term){
		this.#redrawTableWithButton(e.currentTarget, [historyDataArray[0]], "Save", this.#buttonCallbackSave, term)
	}

	/**
	 * get the proper search string for search to use
	 * @param {string} term 
	 * @returns {string}
	 */
	getSearchString(term){
		let idLookup;
		switch(term){
			case "items":
				idLookup = "searchItems"
				break;
			case "curses":
				idLookup = "searchCurses"
				break;
			default:
				throw new ReferenceError(`"${term}" invalid, use "items" or "curses"`)
				break;
		}

		return document.getElementById(idLookup + "Advanced").value
	}

	/**
	 * 
	 * @param {string} tableID id of table to draw to
	 * @param {gachaTerm[]} dataArray what to draw
	 */
	redrawTable(tableID, dataArray){
		const rows = []

		for(let data of dataArray){
			rows.push(data.toFullRow())
		}
		
		this.drawTableBody(tableID, rows)
	}

	/**
	 * redraw all save tables, or just items or curses tables. determined by term
	 * any nonstandard term will be treated the same as no term at all
	 * @param {string=} term 
	 */
	redrawAllSaveTables(term){
		let classLookup = ".saveTable"
		if(term == "items" | term == "curses") classLookup += `.${term}Table`
		for(let table of document.querySelectorAll(classLookup)){
			table.dispatchEvent(pageHandler.tableRedrawRequest)
		}
	}

	/**
	 * saveTerm and dispatch redraw request event for relevant tables
	 * @type {buttonCallback}
	 * @param {gachaTerm[]} sourceDataArray 
	 * @param {number} index 
	 * @param {string} term "items"/"curses"
	 */
	#buttonCallbackSave(sourceDataArray, index, term){
		this.#buildsOptions.saveTerm(term, sourceDataArray("index"))
		redrawAllSaveTables(term)
	}

	/**
	 * @type {buttonCallback}
	 * @param {gachaTerm[]} sourceDataArray unused, part of how callback is called.
	 * @param {number} index index of what to remove
	 * @param {string} term "items/curses"
	 */
	#buttonCallbackRemove(sourceDataArray, index, term){
		this.#buildsOptions.removeCurrentSaved(term, index)
		this.redrawAllSaveTables(term)
	}

	/**
	 * 
	 * @param {string} tableID table to draw to
	 * @param {HTMLTableRowElement[]} rows what to draw in it
	 */
	#redrawTableBody(tableID, rows){
		const tbody = document.querySelector(`#${tableID} > tbody`)
		tbody.innerText = ""

		for(let row of rows){
			tbody.appendChild(row)
		}
	}

	/**
	 * export current build to txt file
	 */
	exportSaved() {

		let text = "<ITEMS>\n\n\n";

		for (let item of this.#buildsOptions.getCurrentSavedItems()) {
			text += `${item}\n\n`;
		}

		text += "\n<CURSES>\n\n";
		for (let curse of this.#buildsOptions.getCurrentSavedCurses()) {
			text += `${curse}\n\n`;
		}

		console.log(text)

		var link = document.createElement("a");
		var file = new Blob([text], { type: 'text/plan' });
		link.href = URL.createObjectURL(file)
		link.download = "Omni Gacha rolls.txt"
		link.click();
		URL.revokeObjectURL(link.href);
	}


	/**
	 * get a random result, dispatch proper redrawRequest events
	 * @param {string} term "items"/"curses"
	 */
	roll(term){
		const rollTable = document.querySelector(`.rollTable.${term}Table`)
		const result = this.#filteringHandler.getRandomTerm(term)
		this.#history[term].unshift(result)

		// history[0] is the current item
		document.querySelector(`.historyTable.${term}Table`).dispatchEvent(pageHandler.tableRedrawRequest)
		rollTable.dispatchEvent(pageHandler.tableRedrawRequest)
	}
}