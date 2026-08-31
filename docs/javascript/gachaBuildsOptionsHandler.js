import {
	cookiesHandler
}
	from "./cookiesHandler.js"
import {
	redrawAllSaveTables
}
	from "./pageElements.js"
import { item } from "./gachaItem.js"
import { curse } from "./gachaCurse.js"

export { gachaBuildsOptionsHandler }

/**
 * handle builds and options values, as they are intertwined
 */
class gachaBuildsOptionsHandler {
	#buildsValues
	#optionsValues
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
	 * @param {{key: string, value: string}} pair 
	 */
	changeOption(pair){
		this.#optionsValues[pair.key] = pair.value
		this.saveOptions
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
	 * @param {string} buildName 
	 * @returns build
	 */
	getBuild(buildName = this.#optionsValues.build){
		return this.#buildsValues[buildName]
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