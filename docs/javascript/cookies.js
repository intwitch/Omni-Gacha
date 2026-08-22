import {
	CURSES,
	ITEMS,
	buildsValues,
	optionsValues,
	rawCursesData,
	rawItemsData,
	savedCurseRolls,
	savedItemRolls,
} from "./main.js";

/**
 * given a name of item or curse, return the array of all data
 * if passed argument is not a string, assume it's an array, and return that array (backwards compatibility with old saves)
 * if name is not found also return raw name
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
//save saved rolls into a cookie :)
function buildCookieSetFunction() {
	buildsValues[optionsValues.build]["items"] = savedItemRolls;
	buildsValues[optionsValues.build]["curses"] = savedCurseRolls;

	//saving all that data takes a lot of the 4098 Byte limit, save just names instead.
	//for now it works, an outright ID or further compression shouldn't be required, yet.
	var truncatedBuildValues = {};
	for (build in buildsValues) {
		var truncatedBuild = {};
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
// initiate the old build cookie data, if it exits
// changing to have everything handled in one builds cookie instead of individual
function oldBuildCookieInit() {
	return cookieStore.get(optionsValues.build).then(function (result) {
		if (result) {
			console.log("old cookies got!");
			const json = JSON.parse(result.value);
			savedItemRolls = json.items;
			savedCurseRolls = json.curses;
		}
		else {
			console.log("old cookies not got!");
		}
	});
}
//get the builds cookie, save to json.
function buildCookieInit() {
	return cookieStore.get("builds").then(function (result) {
		if (result) {
			console.log("new cookies got!");
			const json = JSON.parse(result.value);
			for (build in json) {
				var expandedBuild = {
					"items": [],
					"curses": []
				};

				for (item of json[build].items) {
					expandedBuild.items.push(nameToFull(item));
				}
				for (curse of json[build].curses) {
					expandedBuild.curses.push(nameToFull(curse, false));
				}

				buildsValues[build] = expandedBuild;
			}
		}
		else {
			console.log("new cookies not got!");
			buildsValues.default = {
				"items": [],
				"curses": []
			};
		}
	});
}
// get the option cookie and save it to optionsValues
function optionCookieInit() {
	return cookieStore.get("options").then(function (result) {
		if (!result) {
			console.log("saved options found");
			return;
		}
		console.log("saved options found");
		const savedValues = JSON.parse(result.value);

		//do it like this so that if any new options are added, they aren't overwritten.
		for (option in savedValues) {
			optionsValues[option] = savedValues[option];
		}
	});
}
// call option cookie init then build cookie init.
// build cookie relies on things from option so, don't bork that. or it will
async function cookieInit() {
	return optionCookieInit().then(oldBuildCookieInit).then(buildCookieInit);

}//save a cookie with name options and value string of optionsValues stringified, because a raw json doesn't work
function optionsCookieSetFunction() {
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

//apply options to create a new build cookie
//save after
function buildCookieCreator(buildName) {
	optionsValues.build = buildName;
	optionsValues.buildsArray.push(buildName);
	buildsValues[buildName] = {
		items: [],
		curses: []
	}
	savedItemRolls = [];
	savedCurseRolls = [];
	optionsCookieSetFunction();
	buildCookieSetFunction();
}

export {
	nameToFull,
	buildCookieSetFunction,
	oldBuildCookieInit,
	buildCookieInit,
	optionCookieInit,
	cookieInit,
	optionsCookieSetFunction,
	buildCookieCreator,
};