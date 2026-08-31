import {
	cookiesHandler
}
	from "./cookiesHandler.js"
import {
	redrawAllSaveTables
}
	from "./pageElements.js"
import { gachaItem, item } from "./gachaItem.js"
import { curse, gachaCurse } from "./gachaCurse.js"
import { gachaTerm } from "./gachaTerm.js"

export { gachaBuildsOptionsHandler }

/**
 * handle builds and options values, as they are intertwined
 */
class gachaBuildsOptionsHandler {
	#buildsValues
	#optionsValues = {
		"backgroundImage": true,
		"build": "default",
		"buildsArray": ["default"],

		"NSFW": false,
		"NSFWOnly": false

	}
	#savedRolls
	#cookiesHandler

	constructor(buildsValues, optionsValues, savedRolls){
		this.#buildsValues = buildsValues
		this.#optionsValues = optionsValues
		this.#savedRolls = savedRolls
		this.#cookiesHandler = new cookiesHandler(buildsValues, optionsValues)
	}

	/**
	 * initalize builds and options
	 * @returns promise resolved when ititalization done.
	 */
	async intialize(){
		return this.#cookiesHandler.cookieInit()
	}

	/**
	 * handles input validation on the event and calls createNewBuild()
	 * @param {object} buildsValues 
	 * @param {object} optionsValues 
	 * @param {event} event 
	 * @returns nothing
	*/
	createNewBuildEventHandler(event, buildsValues = this.#buildsValues, optionsValues = this.#optionsValues) {
		const value = event.target.value
		if (event.key != "Enter" || value == "") return;

		//TODO, handle if fail
		if (createNewBuild(value, buildsValues, optionsValues)) switchBuild(value)
	}
	/**
	 * create a new build but do not switch to it, instead call switchBuild()
	 * @param {string} newBuild 
 * @param {object} buildsValues 
 * @param {object} optionsValues 
 * @returns true on success
 * @returns false on failure
	*/
	createNewBuild(newBuild, buildsValues = this.#buildsValues, optionsValues = this.#optionsValues) {
		if (optionsValues.buildsArray.indexOf(newBuild) != -1) {
			alert(`"${newBuild}" already a build`)
			return false;
		}

		optionsValues.buildsArray.push(newBuild)
		buildsValues[newBuild].items = []
		buildsValues[newBuild].curses = []

		populateBuildSelector()
		return true
	}

	/**
	 * event handler to get value then call switchBuild()
	 * @param {Event} event
	**/
	switchBuildEventHandler(event) {
		switchBuild(event.target.value)
	}
	/**
	 * switch build to the desired.
	 * @param {String} value 
	*/
	switchBuild(value) {
		if (optionsValues.buildsArray.indexOf(value) == -1) {
			console.err(`"${value}" not in buildsList`)
			return;
		}
		const select = document.getElementById("optionsBuildSelector")
		select.value = value

		optionsValues.build = value
		savedRolls.items = buildsValues[value]["items"]
		savedRolls.curses = buildsValues[value]["curses"]
		optionsCookieSetFunction(optionsValues)
		redrawAllSaveTables()
	}

	/**
	 * delete build determined by string.
	 * @param {String} build 
	*/
	deleteBuild(build, buildsValues = this.#buildsValues, optionsValues = this.#optionsValues, savedRolls = this.#savedRolls) {
		delete buildsValues[build]
		optionsValues.buildsArray.splice(optionsValues.buildsArray.indexOf(build), 1)
		switch (true) {
			case (optionsValues.buildsArray.length == 0):
				createNewBuild("default", buildsValues, optionsValues)
				switchBuild("default", buildsValues, optionsValues, savedRolls)
				break;
			case (optionsValues.build == build):
				switchBuild(optionsValues.buildsArray[0], buildsValues, optionsValues, savedRolls)
				populateBuildSelector()
				break;
			default:
				populateBuildSelector()
				break;
		}
		optionsCookieSetFunction(optionsValues)
		buildCookieSetFunction(buildsValues)
	}
	/**
	 * confirm user wants to delete current build then call deleteBuild
	*/
	deleteCurrentBuildConfirm() {
		const currentBuild = optionsValues.build
		if (confirm(`Are you sure you want to delete build "${currentBuild}"?`)) deleteBuild(currentBuild)
	}

	
	/**
	 * save current savedRolls to build.
	 * @param {string} build default current build
	 */
	buildsValuesUpdate(build = this.#optionsValues.build) {
		this.#buildsValues[build] = structuredClone(this.#savedRolls)
	}

	/**
	 * change multiple options at once
	 * if none provided simply return and don't save
	 * @param  {...{key: string, value: string}} pairs 
	 */
	changeOptionMultiple(...pairs){
		if(pairs.length == 0){
			return;
		}
		for (pair of pairs){
			this.#optionsValues[pair.key] = pair.value
		}
		this.saveOptions()
	}

	/**
	 * change and save option accordingly.
	 * @param {string} key
	 * @param {string} value
	 */
	changeOption(key, value){
		this.#optionsValues[pair.key] = pair.value
		this.saveOptions()
		return value
	}
	/**
	 * get an option value
	 * @param {string} key key of the option to get
	 * @returns option value
	 */
	getOption(key){
		return this.#optionsValues[key]
	}

	/**
	 * 
	 * @param {...string} keys 
	 * @returns {string[]}
	 */
	getOptions(...keys){
		const values = []
		for(let key of arguments){
			values.push(this.getOption(key))
		}
		return values
	}

	/**
	 * return a specific build, or the current one if blank.
	 * @param {string} buildName current build by default
	 * @returns {{
	 * 	items: gachaItem[]
	 * 	curses: gachaCurse[]
	 * }}
	 */
	#getBuild(buildName = this.#optionsValues.build){
		return this.#buildsValues[buildName]
	}

	/**
	 * get shallow copy of items
	 * @returns {gachaItem[]} Shallow Copy of saved items
	 */
	getCurrentSavedItems(){
		return this.getCurrentSaved("items")
	}
	/**
	 * get shallow copy of curses
	 * @returns {gachaCurse[]} Shallow Copy of saved curses
	 */
	getCurrentSavedCurses(){
		return this.getCurrentSaved("curses")
	}
	/**
	 * get shallow copy of current saved items or curses
	 * @param {string} term "items"/"curses"
	 * @returns {null|gachaCurse[]|gachaItem[]} null on invalid term, gachaTerm[] depending on term.
	 */
	getCurrentSaved(term){
		if(term != "items" || term != "curses") {
			console.warn(`not meant to be called by "${term}", please use "items" or "curses"`)
			return null
		}
		return Array.from(this.#getBuild()[term])
	}
	/**
	 * 
	 * @param {string} term "items"/"curses"
	 * @param {number} index index to splice out 
	 * @returns {gachaItem|gachaCurse} removed term
	 */
	removeCurrentSaved(term, index){
		//splice always returns an array, which is 1 long, so [0] just kills the unnessary other step
		return this.#getBuild()[term].splice(index, 1)[0]
		this.saveBuilds();
	}

	removeCurrentSavedItem(index){
		return this.removeCurrentSaved("items", index)
	}

	removeCurrentSavedCurse(index){
		return this.removeCurrentSaved("curses", index)
	}

	/**
	 * 
	 * @returns {string} name of current build
	 */
	getCurrentBuildKey(){
		return this.optionsValues.build
	}

	/**
	 * 
	 * @param {string} term "items"/"curses"
	 * @param {gachaItem|gachaCurse} newTerm 
	 * @returns {gachaItem|gachaCurse} newTerm
	 */
	saveTerm(term, newTerm){
		this.#getBuild()[term].append(newTerm)
		this.saveBuilds()
		return newTerm
	}

	/**
	 * 
	 * @param {gachaItem} newItem 
	 * @returns {gachaItem} newItem
	 */
	saveItem(newItem){
		return this.saveTerm("items", newItem)
	}

	/**
	 * 
	 * @param {gachaCurse} newCurse 
	 * @returns {gachaCurse} newCurse
	 */
	saveCurse(newCurse){
		return this.saveTerm("curses", newCurse)
	}

	/**
	 * save everything
	 */
	saveAll(){
		this.saveBuilds
		this.saveOptions
	}
	/**
	 * save builds
	 */
	saveBuilds(){
		this.#cookiesHandler.buildCookieSave()
	}
	/**
	 * save options
	 */
	saveOptions(){
		this.#cookiesHandler.optionsCookieSave()
	}
};