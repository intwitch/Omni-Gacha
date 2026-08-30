import {
	CURSES,
	ITEMS,
} from "./main.js";
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
	*/
	buildCookieSave() {
		//saving all that data takes a lot of the 4098 Byte limit, save just names instead.
		//for now it works, an outright ID or further compression shouldn't be required, yet.
		let truncatedBuildValues = {};
		for (build in this.#buildsValues) {
			let truncatedBuild = {};
			truncatedBuild.items = [];
			truncatedBuild.curses = [];
			for (item of this.#buildsValues[build].items) {
				truncatedBuild.items.push(item[ITEMS.NAME]);
			}
			for (curse of this.#buildsValues[build].curses) {
				truncatedBuild.curses.push(curse[CURSES.NAME]);
			}
			truncatedBuildValues[build] = truncatedBuild;
		}

		cookieStore.set({
			"name": "builds",
			value: JSON.stringify(truncatedBuildValues),
			expires: Date.now() + 1000 * 60 * 60 * 24 * 365
		}).then(function () {
			//TODO, PROPER COOKIE PROMISE HANDLING
		});
	}


	/**
	 * get the build cookie data, complete the data, return it.
	 * @returns cookie data formated for buildsValues
	*/
	async buildCookieInit() {

		let returnValues = {}

		try {
			const json = JSON.parse(await cookieStore.get("builds").values)
			for (build in json) {
				let buildValues = {
					"items": [],
					"curses": []
				};

				for (item of json[build].items) {
					buildValues.items.push(nameToFull(item));
				}
				for (curse of json[build].curses) {
					buildValues.curses.push(nameToFull(curse, false));
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
	async optionCookieInit() {
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
	 */
	async cookieInit() {
		const optionsCookieResults = optionCookieInit()
		const buildCookieResults = buildCookieInit()

		for (option in await optionsCookieResults) {
			this.#optionsValues[option] = optionsCookieResults[option]
		}
		for (build in await buildCookieResults) {
			this.#buildsValues[build] = buildCookieResults[build]
		}
	}

	/**
	 * update the saved optionCookie
	*/
	optionsCookieSave() {
		cookieStore.set({
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