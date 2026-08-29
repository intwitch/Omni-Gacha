import {
	createNewBuildEventHandler,
	deleteCurrentBuildConfirm,
	switchBuild,
	switchBuildEventHandler,
} from "./builds.js";
import { cookieInit } from "./cookies.js";
import {
	contentFilterChange,
	updateItemFilterData,
} from "./filter.js";
import {
	applyAllOptions,
	closeOptions,
	createAllSortButtons,
	drawRollData,
	exportSaved,
	getRandomValue,
	openOptions,
	optionChange,
	redrawHistoryTable,
	redrawSaveTable,
	searchHandlerCreator,
	tabChangeHandlerCreator,
} from "./pageElements.js";

export {
	ITEMS,
	CURSES,
	smartSplit,
	curseToString,
	arrayMerge,
	itemHeaderToIndex,
	curseHeaderToIndex
};

const ITEMS = {
	NAME: 0,
	SERIES: 1,
	DESCRIPTION: 2,
	CATEGORY: 3,
	GENDER: 4,
	MAGIC: 5,
	MEMETIC: 6,
	MIGHT: 7,
	MIND: 8,
	MOTION: 9,
	MOXIE: 10,
	MUTATION: 11,
	MYTH: 12,
	STATS: 13,
	RANK: 14,
	GROWTH_TYPE: 15,
	GROWTH_RATE: 16,
	RESTOCK: 17,
	RETURN: 18,
	GIFT: 19,
	NSFW: 20,
}

const CURSES = {
	NAME: 0,
	DESCRIPTION: 1,
	RESOLUTION: 2,
	LEVEL: 3,
	TARGET: 4,
	AFFECTS: 5,
	NSFW: 6,
	REWARD: 7
}

window.onload = function () {

	var data = {
		raw: {
			items: [],
			curses: []
		},

		filtered: {
			items: [],
			curses: []
		},

		roll: {
			items: [],
			curses: []
		}
	}
	
	var savedRolls = {
		items: [],
		curses: []
	}

	var itemRollInfo = {
		current: undefined,
		history: []
	}

	var curseRollInfo = {
		current: undefined,
		history: []
	}


	// blocked commented out values are only meant to show deafults, they will be set later
	var optionsValues = {
		"backgroundImage": true,
		"build": "default",
		"buildsArray": ["default"],
		"NSFW": false,
		"NSFWOnly": false
	}
	
	var buildsValues = {
		default: {
			items: [],
			curses: []
		}
	}

	const cookiePromise = cookieInit(optionsValues, buildsValues)
	const jsonPromise = loadParseJSON(rawData)
	
	cookiePromise.then(function () { jsonPromise.then() }).then((function () {
		createAllEventHandlers()
		switchBuild(optionsValues.build)
		createAllSortButtons()
		applyAllOptions()
		canvasInit("rollButton", "gachaFinish")
		homeButton.click()
	}))
}

/**
 * 
 * @param rawData json of rawData to mutate with fetch results
 * @returns fetch results
 */
async function loadParseJSON(rawData) {
	const values = await fetch("data/values.json")

	rawData.items = values.items
	rawData.curses = values.curses
	return values
}

/**
 *  string.split() method does not respect split string exlusion based on quote
 * 	this function will works similar to .split(), but will ignore anything in "quotes"
 *  This function could likely be further optimized
 * 
 * @param {string} input 
 * @returns spllit array
 */
function smartSplit(input, split) {

	var insideQuote = false;
	var splitArray = input.split("");
	var finalArray = [""]
	var index = 0;

	for (char of splitArray) {
		if (char == '\"') {
			insideQuote = !insideQuote;
			continue;
		}
		if (char == split && !insideQuote) {
			finalArray.push("");
			index++
		}
		else {
			finalArray[index] += char;
		}
	}
	return finalArray
}

/**
 * image the array, as an array of sets. They aren't but its useful
 * this function finds the union of those sets without duplicates
 * uses recursion call stack equal to the amount of sets - 1
 * does not preserve ordering
 * @param {*[][]} sourceArrays 
 * @returns 
 */
function arrayMerge(sourceArrays) {
	//recursive base statement
	if (sourceArrays.length == 1) return sourceArrays[0];

	//get first two arrays
	var subArray1 = sourceArrays[0];
	var subArray2 = sourceArrays[1];

	//trim shared elements out of subArray2
	subArray2 = subArray2.filter(function (element) {
		return !((subArray1.indexOf(element) != -1) && subArray2.indexOf(element) != -1);
	});

	//merge elements and place back in source.
	subArray1 = subArray1.concat(subArray2);
	sourceArrays.splice(0, 2, subArray1);
	//enter recursion
	return arrayMerge(sourceArrays);
}

/**
 * based on a header, return the index such that:
 * ITEMS.(header) = return
 * @param {string} header 
 * @returns {int}
 */
function itemHeaderToIndex(header) {
	var headerArray = ["name", "series", "description", "category", "gender", "magic", "memetic", "might", "mind", "motion", "moxie", "mutation", "myth", "stats", "rank", "growth type", "growth rate", "restock", "return", "gift", "nsfw"]
	return headerArray.indexOf(header.toLowerCase())
}
/**
 * based on a header, return the index such that:
 * CURSES.(header) = return
 * @param {string} header 
 * @returns {int}
 */
function curseHeaderToIndex(header) {
	var headerArray = ["curse", "description", "resolution", "level", "target", "affects", "nsfw", "reward"]
	return headerArray.indexOf(header.toLowerCase())
}


//takes a string of the rank and returns the proper css variable value
function rankToColor(rank) {
	const style = window.getComputedStyle(document.body)
	switch (rank.toLowerCase()) {
		case "f":
			return style.getPropertyValue("--Frank")
		case "e":
			return style.getPropertyValue("--Erank")
		case "d":
			return style.getPropertyValue("--Drank")
		case "c":
			return style.getPropertyValue("--Crank")
		case "b":
			return style.getPropertyValue("--Brank")
		case "a":
			return style.getPropertyValue("--Arank")
		case "s":
			return style.getPropertyValue("--Srank")
		case "ss":
			return style.getPropertyValue("--SSrank")
		case "sss":
			return style.getPropertyValue("--SSSrank")
		case "ex":
			return style.getPropertyValue("--EXrank")
		default:
			return "#000000"
	}
}

/*
I'm fucking sorry for whatever this is.
init the canvas, load the image, create the animation functions, and finally create the event handler.
TODO; make this call roll at end of animation, and click to skip and get roll early.
*/
function canvasInit(canvasID, eventName) {
	var event;
	const canvas = document.getElementById(canvasID)
	const gumballImage = new Image()

	gumballImage.addEventListener("load", function () {
		const scale = 1
		canvas.width = this.naturalWidth * scale
		canvas.height = this.naturalHeight * scale
		const ctx = canvas.getContext("2d")
		ctx.drawImage(this, 0, 0, canvas.width, canvas.height)
		const cutoff = 255 * scale
		const radius = 20 * scale
		var y = cutoff - radius;
		const velocity = 2 * scale
		const dialCenter = 215 * scale
		const dialRadius = scale
		var angle = 0;
		const angleVelocity = Math.PI / 16.0
		var ballColor;

		ctx.lineWidth = 1
		drawTurnDial()
		ctx.save()

		// draw the dial, rotated by angle default 0
		function drawTurnDial(angle = 0) {
			ctx.beginPath()
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.drawImage(gumballImage, 0, 0, canvas.width, canvas.height)
			ctx.fillStyle = "grey"
			ctx.arc(canvas.width / 2, dialCenter, radius, 0, 2 * Math.PI)
			ctx.fill()
			ctx.beginPath()
			ctx.translate(canvas.width / 2, dialCenter)
			ctx.rotate(angle)
			ctx.fillStyle = "#404040"
			ctx.moveTo(0 - dialRadius * 10, 0)
			ctx.lineTo(dialRadius * 10, 0)
			ctx.lineWidth = 3 * scale;
			ctx.stroke()
			ctx.resetTransform()
		}
		// animation to rotate dial
		var currentFrame;
		function rotateTurnDial() {
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.drawImage(gumballImage, 0, 0, canvas.width, canvas.height)
			drawTurnDial(angle)
			if (angle > Math.PI) {
				window.cancelAnimationFrame(currentFrame)
				angle = 0
				ctx.beginPath()
				ctx.rect(0, cutoff, canvas.width, canvas.height)
				ctx.clip()
				currentFrame = window.requestAnimationFrame(dropBall)
				return
			}
			angle += angleVelocity;
			currentFrame = window.requestAnimationFrame(rotateTurnDial)

		}
		// animation to drop ball.
		function dropBall() {
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.drawImage(gumballImage, 0, 0, canvas.width, canvas.height)
			ctx.beginPath()
			ctx.fillStyle = ballColor;
			ctx.arc(canvas.width / 2, y, radius, 0, Math.PI, false)
			ctx.closePath()
			ctx.fill()
			ctx.beginPath()
			ctx.fillStyle = "white";
			ctx.arc(canvas.width / 2, y, radius, 0, Math.PI, true)
			ctx.closePath()
			ctx.fill()
			y += velocity
			if (y >= 280 * scale) {
				window.cancelAnimationFrame(currentFrame)
				currentFrame = null
				y = cutoff - radius * 2;
				canvas.dispatchEvent(event)
				return;
			}
			currentFrame = window.requestAnimationFrame(dropBall)
		}

		function animationSetupPlay() {
			ctx.restore()
			ctx.save()
			var filteredData
			if (eventName === "gachaFinish") filteredData = filteredItemsData
			else filteredData = filteredCursesData
			var data = getRandomValue(filteredData)
			event = new CustomEvent(eventName, {
				"detail": data
			})
			ballColor = rankToColor(data[ITEMS.RANK])
			currentFrame = window.requestAnimationFrame(rotateTurnDial)
		}

		canvas.addEventListener("click", function () {
			// if there's already a currentFrame, return.
			if (currentFrame) return
			animationSetupPlay()
		})
	})
	gumballImage.src = "assets/Ball_machine_overworld.png"
}





function createAllEventHandlers() {

	document.getElementById("contentOptions").addEventListener("change", contentFilterChange)

	document.getElementById("ticketSelector").addEventListener("change", updateItemFilterData);

	let homeTab = document.getElementById("home");
	let aboutTab = document.getElementById("about");
	let startsTab = document.getElementById("starts")
	let itemsTab = document.getElementById("items");
	let cursesTab = document.getElementById("curses");
	let buildTab = document.getElementById("build");
	let searchTab = document.getElementById("search");

	homeButton = document.getElementById("homeButton");
	homeButton.addEventListener("click", tabChangeHandlerCreator(homeTab));
	document.getElementById("logo").addEventListener("click", function () { homeButton.click() }) //mirror above event

	document.getElementById("aboutButton").addEventListener("click", tabChangeHandlerCreator(aboutTab));

	document.getElementById("startsButton").addEventListener("click", tabChangeHandlerCreator(startsTab))

	document.getElementById("itemsButton").addEventListener("click", tabChangeHandlerCreator(itemsTab));

	document.getElementById("cursesButton").addEventListener("click", tabChangeHandlerCreator(cursesTab));

	document.getElementById("buildButton").addEventListener("click", tabChangeHandlerCreator(buildTab));

	document.getElementById("searchButton").addEventListener("click", tabChangeHandlerCreator(searchTab));

	document.getElementById("rollButton").addEventListener("gachaFinish", function (e) {
		currentItemRoll = e.detail
		drawRollData(document.getElementById("rollTable"), currentItemRoll, itemRollHistory);
		redrawHistoryTable("itemRollHistoryTable", itemRollHistory, savedItemRolls)
	});
	document.getElementById("saveButton").addEventListener("click", function () {
		savedItemRolls.push(currentItemRoll);
		redrawSaveTable(document.getElementById("saveTable"), savedItemRolls)
	});

	document.getElementById("cursesRollButton").addEventListener("click", function () {
		currentCurseRoll = getRandomValue(filteredCursesData)
		drawRollData(document.getElementById("cursesRollTable"), currentCurseRoll, curseRollHistory);
		redrawHistoryTable("curseRollHistoryTable", curseRollHistory, savedCurseRolls)
	});

	document.getElementById("cursesSaveButton").addEventListener("click", function () {
		savedCurseRolls.push(currentCurseRoll);
		redrawSaveTable(document.getElementById("cursesSaveTable"), savedCurseRolls)
	});

	document.getElementById("buildExportButton").addEventListener("click", exportSaved);

	var itemsCategoriesFilters = document.querySelectorAll("#itemsCategoryFilter input");
	console.log(itemsCategoriesFilters);
	itemsCategoriesFilters[0].addEventListener("change", function () { //all gets special behavior
		for (var i = 1; i < itemsCategoriesFilters.length; i++) {
			itemsCategoriesFilters[i].checked = document.getElementById("itemsCategoryFilterAll").checked;
		}
		updateItemFilterData();
	})
	for (var i = 1; i < itemsCategoriesFilters.length; i++) {
		itemsCategoriesFilters[i].addEventListener("change", function () {
			itemsCategoriesFilters[0].checked = false;
			updateItemFilterData();
		})
	}

	document.getElementById("optionsButton").addEventListener("click", openOptions)
	document.getElementById("optionsClose").addEventListener("click", closeOptions)

	document.getElementById("optionsBackgroundToggle").addEventListener("change", optionChange)
	document.getElementById("optionsBuildSelector").addEventListener("change", switchBuildEventHandler)
	document.getElementById("optionsBuildsNewName").addEventListener("keydown", createNewBuildEventHandler)
	document.getElementById("optionsBuildsDeleteButton").addEventListener("click", deleteCurrentBuildConfirm)


	document.getElementById("searchItemsButton").addEventListener("click", function () {
		searchHandlerCreator(itemsData, savedItemRolls, "searchItemsTable")(this)
	})
	document.getElementById("searchCursesButton").addEventListener("click", function () {
		searchHandlerCreator(cursesData, savedCurseRolls, "searchCursesTable")(this)
	})
};