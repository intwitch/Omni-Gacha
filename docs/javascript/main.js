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

var rawItemsData;
var rawCursesData;

var itemsData = [];
var cursesData = [];

var filteredItemsData = []
var filteredCursesData = []

var NSFW = false;
var NSFWOnly = false;

var currentItemRoll;
var savedItemRolls = [];
var itemRollHistory = [];
var itemSearchResults = [];

var currentCurseRoll;
var savedCurseRolls = [];
var curseRollHistory = [];
var curseSearchResults = [];

var homeTab;
var itemsTab;
var cursesTab;
var buildTab;
var searchTab;

var optionsValues = {
	"backgroundImage": true,
	"build": "default",
	"buildsArray": ["default"],
	"NSFW": false,
	"NSFWOnly": false
}

var buildsValues = {
	/*
	default: {
		items: [],
		curses: []
	}
	*/
}

const cookiePromise = cookieInit()
const jsonPromise = loadParseJSON()


window.onload = function () {
	cookiePromise.then(function(){jsonPromise.then()}).then((function () {
		createAllEventHandlers()
		switchBuild(optionsValues.build)
		createAllSortButtons()
		applyAllOptions()
		canvasInit("rollButton", "gachaFinish")
		homeButton.click()
	}))
}

/*
load, parse and set raw data variables.
I have come to despsise async and await and then and promises and general
I do not want to deal with ANY of that.
so we use a xml request for my own sanity.

as of commit f0cfdc87fea60e87e354a4f11efe806425798e1f i've learned how .then works.
it's uhh... past me is dumb bc it's easy.
but this still works so... doesn't really *need* to be rewritten.
*/
async function loadParseJSON() {
	const xhr = new XMLHttpRequest();
	xhr.open("GET", "data/values.json", false); // false = synchronous
	xhr.send();

	values = JSON.parse(xhr.responseText);

	rawItemsData = values.items
	rawCursesData = values.curses
	return null;
}

function savedToJsonString() {
	const json = {
		"items": savedItemRolls,
		"curses": savedCurseRolls
	}
	return JSON.stringify(json)
}

function itemToString(item) {
	var sfw = ""
	if (item[ITEMS.NSFW] === "TRUE") sfw = " | NSFW"
	return `${item[ITEMS.NAME]} | ${item[ITEMS.SERIES]}\nRank ${item[ITEMS.RANK]} | ${item[ITEMS.CATEGORY]}${sfw}\n${item[ITEMS.DESCRIPTION]}`
}

function curseToString(curse) {
	var sfw = ""
	if (curse[CURSES.NSFW] === "TRUE") sfw = " | NSFW"
	return `${curse[CURSES.NAME]} | ${curse[CURSES.LEVEL]}${sfw}\n${curse[CURSES.DESCRIPTION]}\nResolution: ${curse[CURSES.RESOLUTION]}`
}






//takes a string of the rank and returns the proper css variable value
function rankToColor(rank){
	const style = window.getComputedStyle(document.body)
	switch(rank.toLowerCase()){
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
		function drawTurnDial(angle = 0){
			ctx.beginPath()
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.drawImage(gumballImage, 0, 0, canvas.width, canvas.height)
			ctx.fillStyle = "grey"
			ctx.arc(canvas.width / 2, dialCenter, radius, 0, 2*Math.PI)
			ctx.fill()
			ctx.beginPath()
			ctx.translate(canvas.width/2, dialCenter)
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
		function rotateTurnDial(){
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.drawImage(gumballImage, 0, 0, canvas.width, canvas.height)
			drawTurnDial(angle)
			if(angle > Math.PI){
				window.cancelAnimationFrame(currentFrame)
				angle = 0
				ctx.beginPath()
				ctx.rect(0, cutoff, canvas.width, canvas.height)
				ctx.clip()
				currentFrame = window.requestAnimationFrame(dropBall)
				return
			}
			angle+=angleVelocity;
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
				y = cutoff - radius*2;
				canvas.dispatchEvent(event)
				return;
			}
			currentFrame = window.requestAnimationFrame(dropBall)
		}

		function animationSetupPlay(){
			ctx.restore()
			ctx.save()
			var filteredData
			if(eventName === "gachaFinish") filteredData = filteredItemsData
			else filteredData = filteredCursesData
			var data = getRandomValue(filteredData)
			event = new CustomEvent(eventName, {
				"detail": data
			})
			ballColor = rankToColor(data[ITEMS.RANK])
			currentFrame = window.requestAnimationFrame(rotateTurnDial)
		}

		canvas.addEventListener("click", function(){
			// if there's already a currentFrame, return.
			if(currentFrame) return
			animationSetupPlay()
		})
	})
	gumballImage.src = "assets/Ball_machine_overworld.png"
}





function createAllEventHandlers(){

	document.getElementById("contentOptions").addEventListener("change", contentFilterChange)

	document.getElementById("ticketSelector").addEventListener("change", updateItemFilterData);

	homeTab = document.getElementById("home");
	aboutTab = document.getElementById("about");
	startsTab = document.getElementById("starts")
	itemsTab = document.getElementById("items");
	cursesTab = document.getElementById("curses");
	buildTab = document.getElementById("build");
	searchTab = document.getElementById("search");

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

export {
	ITEMS,
	CURSES,
	rawItemsData,
	rawCursesData,
	itemsData,
	cursesData,
	filteredItemsData,
	filteredCursesData,
	NSFW,
	NSFWOnly,
	currentItemRoll,
	savedItemRolls,
	itemRollHistory,
	itemSearchResults,
	currentCurseRoll,
	savedCurseRolls,
	curseRollHistory,
	curseSearchResults,
	homeTab,
	itemsTab,
	cursesTab,
	buildTab,
	searchTab,
	optionsValues,
	buildsValues,
};