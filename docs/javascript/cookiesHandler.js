import {
	CURSES,
	ITEMS,
} from "./main.js";

/**
 * given a name of item or curse, return the array of all data
 * if passed argument is not a string, assume it's an array, and return that array (backwards compatibility with old saves)
 * if name is not found return undefined
 * @param {string} name
 * @param {boolean} isItem is the raw item array and not curse array
 */
function nameToFull(name, isItem = true) {
	if (typeof name != "string") return name;
	var dataArray;
	if (isItem) dataArray = rawItemsData;
	else dataArray = rawCursesData;

	// i feel hoorible about the amount if statements here, unfortunately it's a lot of searching in an unsorted array
	for (data of dataArray) {
		if (data[ITEMS.NAME] == name) return data;
	}
	console.error(`${name} not found in raw data array. something has gone wrong`);
	return name;
}
/**
 * function to call whenever savedRolls changes. returns nothing. 
 * mutates buildsValues with structured clone of savedrolls
 * @param {object} buildsValues object to update
 * @param {string} build which build to update
 * @param {object} savedRolls what to update that build with
 */
function buildsValuesUpdate(buildsValues, savedRolls, build){
	buildsValues[build] = structuredClone(savedRolls)
}

/**
 * 
 * @param {object} buildsValues values to save
 */
function buildCookieSetFunction(buildsValues) {
	//saving all that data takes a lot of the 4098 Byte limit, save just names instead.
	//for now it works, an outright ID or further compression shouldn't be required, yet.
	let truncatedBuildValues = {};
	for (build in buildsValues) {
		let truncatedBuild = {};
		truncatedBuild.items = [];
		truncatedBuild.curses = [];
		for (item of buildsValues[build].items) {
			truncatedBuild.items.push(item[ITEMS.NAME]);
		}
		for (curse of buildsValues[build].curses) {
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
async function buildCookieInit() {

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
async function optionCookieInit() {
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
		for (option in optionsResults){
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
 * @param {object} optionsValues object to mutate with optionCookieInit() results
 * @param {object} buildsValues  object to mutate with buildCookieInit() results
 */
async function cookieInit(optionsValues, buildsValues) {
	const optionsCookieResults = optionCookieInit()
	const buildCookieResults = buildCookieInit()

	for(option in await optionsCookieResults){
		optionsValues[option] = optionsCookieResults[option]
	}
	for(build in await buildCookieResults){
		buildsValues[build] = buildCookieResults[build]
	}
}

/**
 * update the saved optionCookie
 * @param {object} optionsValues options to save
 */
function optionsCookieSetFunction(optionsValues) {
	cookieStore.set({
		name: "options",
		value: JSON.stringify(optionsValues),
		expires: Date.now() + 1000 * 60 * 60 * 24 * 365
	}).then(function (value) {
		return;
	}, function (reason) {
		console.error("saving cookies failed");
		console.error(reason);
	});
}

export {
	nameToFull,
	buildCookieSetFunction,
	buildCookieInit,
	optionCookieInit,
	cookieInit,
	optionsCookieSetFunction
};