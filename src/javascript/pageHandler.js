import { filteringHandler } from "./filteringHandler";
import { gachaBuildsOptionsHandler } from "./gachaBuildsOptionsHandler";
import { gachaCurse } from "./gachaCurse";
import { gachaItem } from "./gachaItem";
import { gachaTerm } from "./gachaTerm";

export { pageHandler }

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
	 * async build a lot of important async things.
	 * @returns {Promise<pageHandler>} pageHandler promise
	 */
	static async build(){
		const buildsOptionsHandler = new gachaBuildsOptionsHandler()
		const filterHandler = filteringHandler.build(buildsOptionsHandler)

		const page = new pageHandler(await filterHandler, buildsOptionsHandler)
		return page
	}

	/**
	 * DO NOT USE THIS RAW, USE static .build method. need to do some async things.
	 * @param {filteringHandler} filteringHandler 
	 * @param {gachaBuildsOptionsHandler} buildsOptionsHandler 
	 */
	constructor(filteringHandler, buildsOptionsHandler){
		this.#filteringHandler = filteringHandler
		this.#buildsOptions = buildsOptionsHandler
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
	 * update option checkboxes/other things, and then apply those changes
	 * should only be used once to initalize page
	 */
	applyAllOptions() {
		this.#initalizeBackgroundImageOption()
		this.#initalizeContentOptionsElement()

		this.populateBuildSelector();
	}
	/**
	 * update the background image checkbox element
	 * @param {boolean} isOn if it's on or not 
	 */
	#initalizeBackgroundImageOption(isOn = this.#buildsOptions.getOption("backgroundImage")){
		document.getElementById("optionsBackgroundToggle").checked = isOn
		this.updateBackgroundImage(isOn)
	}

	/**
	 * update the background image itself.
	 * @param {boolean} isOn 
	 */
	updateBackgroundImage(isOn = this.#buildsOptions.getOption("backgroundImage")) {
		const root = document.querySelector(":root")
		if (isOn) {
			document.body.style.backgroundImage = 'url("assets/Omni_Gacha_Background.png")';
			root.style.setProperty('--tint', "#00000066")
		}
		else {
			document.body.style.backgroundImage = "none";
			root.style.setProperty('--tint', "#00000000")
		}
	}

	backgroundImageOptionChangeListener(event){
		const isOn = event.target.checked
		this.#buildsOptions.changeOption("backgroundImage", isOn)
		this.updateBackgroundImage(isOn)
	}

	/**
	 * update the physical checkboxes with the saved options, then update the #filteringHandlers data
	 * should not be called outside of initialization
	 * @param {boolean} NSFW 
	 * @param {boolean} NSFWOnly 
	 */
	#initalizeContentOptionsElement(NSFW = this.#buildsOptions.getOption("NSFW"), NSFWOnly = this.#buildsOptions.getOption("NSFWOnly")){
		const nsfwElement = document.getElementById("nsfwCheckbox")
		const nsfwOnlyElement = document.getElementById("nsfwOnlyCheckbox")

		nsfwElement.checked = NSFW
		nsfwOnlyElement.checked = NSFWOnly

		if(NSFW || NSFWOnly) nsfwOnlyElement.display = "hide";
		else nsfwOnlyElement.display = "block"

		this.#filteringHandler.updateContentFilter()
	}

	/**
	 * conent options change listener
	 * @param {Event} event 
	 */
	contentOptionsChangeListener(event){
		const nsfwElement = event.currentTarget.getElementById("nsfwCheckbox")
		const nsfwOnlyElement = event.currentTarget.getElementById("nsfwOnlyCheckbox")

		if(nsfwElement.checked) nsfwOnlyElement.style.visibility = "hidden"

		this.#buildsOptions.changeOptionMultiple({"key": nsfw, "value": nsfwElement.checked}, {"key": nsfwOnly, "value": nsfwOnlyElement.checked})
		this.#filteringHandler.updateContentFilter()
	}

	/**
	 * called by each category filter checkbox, pass on it's current value
	 * and uncheck the all checkbox
	 * @param {Event} event 
	 */
	categoryFilterChangeListener(event){
		this.#filteringHandler.updateCategoryFilter(event.currentTarget.value, event.currentTarget.checked)
		document.querySelector("#itemsCategoryFilter input").checked = false
	}

	/**
	 * called by the all checkbox only. changes everything else.
	 * @param {Event} event 
	 */
	categoryFilterAllChangeListener(event){
		const isAll = event.target.currentTarget.checked
		for(let checkbox of document.querySelectorAll("#itemsCategoryFilter input")){
			checkbox.checked = isAll;
		}
		this.#filteringHandler.resetCategoryFilter(isAll)
	}

	/**
	 * update the ticket rank filter
	 * @param {Event} event 
	 */
	rankFilterChangeListener(event){
		this.#filteringHandler.updateRankFilter(event.currentTarget.value)
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
	createAllSortButtons() {
		
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
		let root = getComputedStyle(document.querySelector(":root"))
		for (let button of document.querySelectorAll("#selector button")) {
			button.style.backgroundColor = root.getPropertyValue("--unselected-button-color")
		}
		event.currentTarget.style.backgroundColor = root.getPropertyValue("--selected-button-color")
		this.changeTabTo(targetTabID);
	}

	/**
	 * handles input validation on the event and calls createNewBuild()
	 * @param {event} event 
	 * @returns nothing
	*/
	createNewBuildEventHandler(event) {
		const value = event.target.value
		if (event.key != "Enter" || value == "") return;

		if (this.#buildsOptions.getOption("buildsArray").indexOf(value) != -1) {
			alert(`"${value}" already a build`)
			return;
		}

		this.#buildsOptions.createNewBuild(value)
		this.populateBuildSelector()
	}

	/**
	 * event handler to get value then call switchBuild()
	 * @param {Event} event
	**/
	switchBuildEventHandler(event) {
		this.#buildsOptions.switchBuild(event.currentTarget.value)
		this.redrawAllSaveTables()
	}

	/**
	 * confirm user wants to delete current build then call deleteBuild
	 * @param {Event} event
	*/
	deleteCurrentBuildListener(event){
		const currentBuild = this.#buildsOptions.getOption("build")
		if (confirm(`Are you sure you want to delete build "${currentBuild}"?`)) {
			this.#buildsOptions.deleteBuild(currentBuild)
			this.populateBuildSelector()
			this.redrawAllSaveTables()
		}
	}

	/**
	 * 
	 * @param {string} targetTabID 
	 */
	changeTabTo(targetTabID) {
		const newTab = document.getElementById(targetTabID)
		for (let tab of document.querySelectorAll(".tabcontent")) {
			tab.style.display = "none"
		}
		newTab.style.display = "block";
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
	 * @param {HTMLTableElement} table 
	 * @param {(gachaTerm)[]} dataArray 
	 * @param {string|Element} buttonContent what to apppend to the button element
	 * @param {buttonCallback} buttonCallback
	 * @param {*[]} args args to pass to buttonCallback
	 */

	#redrawTableWithButton(table, dataArray, buttonContent, buttonCallback, args) {
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

		this.#redrawTableBody(table, rows)
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
		this.#redrawTableBody(e.currentTarget, [this.#history[term][0].toFullRow()])
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
	 * @param {HTMLTableElement} table table to draw to
	 * @param {HTMLTableRowElement[]} rows what to draw in it
	 */
	#redrawTableBody(table, rows){
		const tbody = table.querySelector(`tbody`)
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

	saveLatest(term){
		this.#buildsOptions.saveTerm(term, this.#history[term][0])
		this.redrawAllSaveTables(term)
	}
}