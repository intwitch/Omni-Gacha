import {
	CURSES,
	ITEMS,
} from "./main.js";
import { gachaItem } from "./gachaItem.js"
import { gachaCurse } from "./gachaCurse.js"

export {
	cookiesHandler
}

/**
 * handles saving and getting cookies
 */
class cookiesHandler {
	#buildsValues
	#optionsValues
	/**
	 * create the cookie handler class.
	 * @param {object} buildsValues reference to buildsValues object
	 * @param {object} optionsValues reference to optionsValues object
	 */
	constructor(buildsValues, optionsValues){
		this.#buildsValues = buildsValues
		this.#optionsValues = optionsValues
	}

	
	

	/**
	 * 
	 * @returns {Promise<void>} promise resolved on save finished
	 */
	buildCookieSave() {
		//saving all that data takes a lot of the 4098 Byte limit, save just names instead.
		//for now it works, an outright ID or further compression shouldn't be required, yet.
		let truncatedBuildValues = {};
		for (build in this.#buildsValues) {
			let truncatedBuild = {};
			truncatedBuild.items = gachaItem.toNameArray(this.#buildsValues[build].items);
			truncatedBuild.curses = gachaCurse.toNameArray(this.#buildsValues[build].curses)
			

			truncatedBuildValues[build] = truncatedBuild;
		}

		return cookieStore.set({
			"name": "builds",
			value: JSON.stringify(truncatedBuildValues),
			expires: Date.now() + 1000 * 60 * 60 * 24 * 365
		})
	}


	/**
	 * get the build cookie data, complete the data, return it.
	 * @param {{
	 * 	items: gachaItem[],
	 * 	curses: gachaCurse[]}} rawData
	 * @returns {Promise<object>} promise resolved on function complete
	*/
	async static buildCookieInit(rawData) {

		let returnValues = {}

		try {
			const json = JSON.parse(await cookieStore.get("builds").values)
			for (let build in json) {
				let buildValues = {
					"items": [],
					"curses": []
				};
				
				for (let item of json[build].items) {
					buildValues.items.push(gachaItem.nameToFull(item, rawData.items));
				}
				for (let curse of json[build].curses) {
					buildValues.curses.push(gachaCurse.nameToFull(curse, rawData.curses));
				}

				returnValues[build] = buildValue
			}
			console.log("cookies got!");
		}
		catch (error) {
			console.log("cookies not got!\n" + error);
			returnValues.default = {
				"items": [],
				"curses": []
			};
		}
		finally {
			return returnValues;
		}
	}

	/**
	 * trys to load the saved options cookie and if that fails, return a default
	 * @returns optionsValues
	*/
	async static optionCookieInit() {
		//defaults
		let optionsValues = {
			"backgroundImage": true,
			"build": "default",
			"buildsArray": ["default"],
			"NSFW": false,
			"NSFWOnly": false
		}
		try {
			const optionsResults = JSON.parse(await cookieStore.get("options").values)
			console.log("options cookies got!")
			for (option in optionsResults) {
				optionsValues[option] = optionsResults[options]
			}
		}
		catch (error) {
			console.log("options cookies not got!\n")
		}

		return optionsValues
	}
	/**
	 * call the two cookie init functions and mutate the given (preferably) empty object with saved values
	 * @returns {Promise<void>} promise resolved on function completion
	 */
	async cookieInit(rawData) {
		const optionsCookieResults = cookiesHandler.optionCookieInit()
		const buildCookieResults = cookiesHandler.buildCookieInit(rawData)

		for (option in await optionsCookieResults) {
			this.#optionsValues[option] = optionsCookieResults[option]
		}
		for (build in await buildCookieResults) {
			this.#buildsValues[build] = buildCookieResults[build]
		}
		return;
	}

	/**
	 * update the saved optionCookie
	 * @returns {Promise} promise reolved save on completion
	*/
	optionsCookieSave() {
		return cookieStore.set({
			name: "options",
			value: JSON.stringify(this.#optionsValues),
			expires: Date.now() + 1000 * 60 * 60 * 24 * 365
		}).then(function (value) {
			return;
		}, function (reason) {
			console.error("saving cookies failed");
			console.error(reason);
		});
	}
}