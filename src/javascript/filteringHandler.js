import {
	smartSplit,
	arrayMerge
} from "./main.js";
import { gachaBuildsOptionsHandler } from "./gachaBuildsOptionsHandler.js"

export { filteringHandler }

import { gachaItem } from "./gachaItem.js";
import { gachaCurse } from "./gachaCurse.js";

import rawJson from "../data/values.json?url"

/**
 * handle all filtering, prepping, 
 * and searching (which is also just filtering to user defined paramaters)
 * do not read/write to dom do not pass go, do not collect 100 dollars, etc.
 * do keep track of filters, and change when function called
 * 
 * do not construct raw, use filteringHandler.build() to get a promise that resolves to the object.
 */
class filteringHandler {
	/**
	 * @type {buildsOptionsHandler}
	 */
	#buildsOptions
	/**
	 * @type {{
	 *   raw: { items: gachaItem[], curses: gachaCurse[] },
	 *   filtered: { items: gachaItem[], curses: gachaCurse[] },
	 *   roll: { items: gachaItem[], curses: gachaCurse[] }
	 * }}
	 */
	#data = {
		"raw": {},
		"filtered": {},
		"roll": {}
	}

	static defualtFilters = {
		"rank": [
			"F", "E", "D", "C", "B", "A", "S", "SS", "SSS", "EX"
		],
		"category": [
			"Ability", "Arsenal", "Consumable", "Familiar", "Farmable", "Novelty", "Passive", "Race", "Skill", "Vehicle", "Wearible", "World"
		]
	}

	#filters = filteringHandler.defualtFilters
	
	/**
	 * static async function to load and parse the json data
	 * @param rawData json of rawData to mutate with fetch results
	 * @returns {Promise<{
	 * "items": gachaItem[] 
	 * "curses": gachaCurse[]
	 * }>}
	 */
	static async loadParseJSON() {
		const rawfetch = await fetch("../data/values.json")
		const values = await rawfetch.json()

		const itemsArray = []
		const cursesArray = []

		for (let value of await values.items) {
			itemsArray.push(new gachaItem(gachaItem.arrayToKeyedObject(value), value.splice(23, Infinity)))
		}
		for (let value of await values.curses) {
			cursesArray.push(new gachaCurse(gachaCurse.arrayToKeyedObject(values)))
		}

		console.log(`items: ${await values.items.length}`)

		return {
			items: itemsArray,
			curses: cursesArray
		}
	}

	/**
	 * @param {gachaBuildsOptionsHandler} buildsOptionsHandler unitialized buildsOptions Handler
	 * @returns {Promise<filteringHandler>} promised resolved on initialization complete
	 */
	static async build(buildsOptionsHandler){
		const rawData = await this.loadParseJSON()
		await buildsOptionsHandler.intialize(rawData)
		const filter = new filteringHandler(buildsOptionsHandler, rawData)
		return filter
	}

	/**
	 * 
	 * @param {gachaBuildsOptionsHandler} buildsOptionsHandler 
	 * @param {object} data
	 */
	constructor(buildsOptionsHandler, rawData) {
		this.#buildsOptions = buildsOptionsHandler
		this.#data.raw = rawData;
		this.updateContentFilter()
	}

	/**
	 * update the filtered data, then update the roll data
	 */
	updateContentFilter() {
		const nsfw = this.#buildsOptions.getOption("NSFWOnly")
		const nsfwOnly = this.#buildsOptions.getOption("NSFWOnly")

		if(nsfw && !nsfw) for(let key in this.#data.raw){ 
			this.#data.filtered[key] = Array.from(this.#data.raw[key])
		}
		else for(let key in this.#data.raw){
			this.#data.filtered[key] = this.#data.raw[key].filter(filteringHandler.exactValueFilter([nsfwOnly]), "nsfw")
		}

		this.updateRollData()
	}

	/**
	 * update the rank filter based on numeric star level
	 * @param {number} starLevel 
	 */
	updateRankFilter(starLevel) {
		switch (starLevel) {
			case "0":
			default:
				this.#filters.rank = filteringHandler.defualtFilters.rank
				break;
			case "1":
				this.#filters.rank = ["F", "E", "D"];
				break;
			case "2":
				this.#filters.rank = ["E", "D", "C"];
				break;
			case "3":
				this.#filters.rank = ["D", "C", "B"];
				break;
			case "4":
				this.#filters.rank = ["C", "B", "A"];
				break;
			case "5":
				this.#filters.rank = ["B", "A", "S"];
				break;
			case "6":
				this.#filters.rank = ["A", "S", "SS"];
				break;
			case "7":
				this.#filters.rank = ["S", "SS", "SSS"];
				break;
			case "8":
				this.#filters.rank = ["SS", "SSS", "EX"];
				break;
		}
	}

	/**
	 * to reset them all to nothing, or all on
	 * @param {boolean} isAll 
	 */
	resetCategoryFilter(isAll){
		if(isAll) { this.#filters.category = Array.from(filteringHandler.defualtFilters) }
		else { this.#filters.category = [] }
	}
	
	/**
	 * based on the string and the boolean, either take the filter out or put it in
	 * @param {string} category 
	 * @param {boolean} isChecked 
	 */
	updateCategoryFilter(category, isChecked){
		if(isChecked) {
			this.#filters.category.push(category)
		}
		else {
			const index = this.#filters.category.indexOf(category)
			this.#filters.category.splice(index, 1);
		}
	}

	/**
	 * get a constant reference to data.filtered.items, mutate acordingly
	 * and assign to data.roll.items
	 */
	#updateItemRollData() {
		let workingItems = this.#data.filtered.items
		for(let key in this.#filters){
			workingItems = workingItems.filter(filteringHandler.exactValueFilter(this.#filters[key]), key)
		}
	}

	/**
	 * currently, just sets roll.curses to filtered.curses
	 * method and additional variable exists for future proofing.
	 */
	#updateCurseRollData() {
		this.#data.roll.curses = this.#data.filtered.curses
	}

	/**
	 * update #data.roll
	 */
	updateRollData() {
		this.#updateItemRollData()
		this.#updateCurseRollData()
	}

	/**
	 * filter by exact value
	 * for filter by contains, use textFilter
	 * 
	 * items and curses are essentially, arrays, of a bunch of data
	 * when trying to filter by category or name or rank, you call this function
	 * simply provide the index of what you're filtering ie; ITEMS.RANK
	 * and filterArray to check the value, of index against.
	 * 
	 * @param {(string|number|boolean)[]} filterArray array of things to match to
	 * @param {string} key what index of the item/curse to check against
	 * @returns function to use in array.filter()
	 */
	static exactValueFilter(filterArray, key) {
		var filterFunction = function (value) {
			const valuePart = value.get(key)
			for (let filter of filterArray) {
				if (valuePart === filter) return true
			}
			return false;
		}
		return filterFunction
	}

	/**
	 * filter by text value. text only needs to be part of, not exact match
	 * for exact match use valueFilter
	 * 
	 * items and curses are essentially, arrays, of a bunch of data
	 * when trying to filter by category or name or rank, you call this function
	 * simply provide the index of what you're filtering ie; ITEMS.NAME
	 * and filterArray to check the value, of index against.
	 * 
	 * @param {string[]} filterArray array of things to match to
	 * @param {string} key what key to check against
	 * @returns function to use in array.filter()
	 */
	static textValueFilter(filterArray, key) {
		let filterFunctionCreator = function (term) {
			const value = term.get(key).toString().toLowerCase();
			for (filter of filterArray) {
				if (value.includes(filter.toLowerCase())) return true
			}
			return false;
		}
		return filterFunctionCreator
	}

	/**
	 * get a random thing out of an array.
	 * @param {*[]} array 
	 * @returns {*}
	 */
	static getRandomValue(array) {
		let randomIndex = Math.floor(Math.random() * array.length);
		return array[randomIndex];
	}

	/**
	 * 
	 * @param {string} term "items"/"curses"
	 * @returns {gachaItem|gachaCurse}
	 */
	getRandomTerm(term){
		return filteringHandler.getRandomValue(this.#data.roll[term])
	}

	/**
	 * get a random gacha item from roll data
	 * @returns {gachaItem}
	 */
	getRandomItem(){
		return this.getRandomTerm("items")
	}
	/**
	 * get a random gacha curse from roll data
	 * @returns {gachaCurse}
	 */
	getRandomCurse(){
		return this.getRandomCurse("curses")
	}

	/**
	 * search the data for all maching based on the searchText string
	 * @param {string} searchText 
	 * @returns {gachaItem[]}
	 */
	searchItems(searchText){
		return this.searchTerm(searchText, "items")
	}

	/**
	 * search the data for all maching based on the searchText string
	 * @param {string} searchText 
	 * @returns {gachaCurse[]}
	 */
	searchCurses(searchText){
		return this.searchTerm(searchText, "curses")
	}

	/**
	 * 
	 * @param {string} searchText 
	 * @param {string} term "items"/"curses"
	 * @returns {gachaItem[]|gachaCurse[]|null} null if term invalid
	 */
	searchTerm(searchText, term){
		if(term != "items" || term != "curses") return null
		return this.#search(searchText, term)
	}

	/**
	 * verify the search text, and construct the search objects
	 * 
	 * @param {string} searchText 
	 * @returns {{properties: string[], values: string[]}[]} searchObjects
	 */
	#searchTextToObjects(searchText){
		const searchValues = this.#searchTextVerifySplit(searchText)
		const searchObjects = []

		for(string of searchValues){
			const parts = string.split(":")
			searchObjects.push({
				properties: smartSplit(parts[0], ","),
				values: smartSplit(parts[1], ",")
			})
		}
		
		return searchObjects
	}

	/**
	 * split apart search text into values, and verify parts.
	 * does not construct search object
	 * 
	 * @param {string} searchText 
	 * @returns {string[]} 
	 */
	#searchTextVerifySplit(searchText){
		let searchValues = smartSplit(searchText, " ")

		const advancedSearchVerifyPattern = /^[a-z0-9 ]+(,[a-z0-9 ]+)*:[a-z0-9 ]+(,[a-z0-9 ]+)*$/i;
		searchValues = searchValues.filter(function (value) {
			return (value.match(advancedSearchVerifyPattern));
		});

		return searchValues
	}

	/**
	 * 
	 * @param {string} key 
	 * @param {string} term 
	 * @returns {function}
	 */
	#keyToFilter(key, term){
		if(term == "curses") return filteringHandler.textValueFilter
		switch (key) {
			case "name":
			case "series":
			case "description":
			case "category":
			case "gender":

			case "growthType":
			case "growthRate":
			case "restock":
			case "returnValue":
			case "gift":
			case "nsfw":
				return filteringHandler.textValueFilter
				break;
			case "magic":
			case "memetic":
			case "might":
			case "mind":
			case "motion":
			case "moxie":
			case "mutation":
			case "myth":
			case "stats":
			case "rank":
				return filteringHandler.exactValueFilter
				break;
			default:
				consolelog("Search Header not found, something seems to have gone wrong.")
		}
	}

	/**
	 * 
	 * 
	 * @param {string} searchText 
	 * @param {string} term "items"/"curses"
	 */
	#search(searchText, term) {
		const searchObjects = this.#searchTextToObjects(searchText)

		let resultsData = this.#data.filtered[term]
		for(let searchObject of searchObjects){
			let resultsDataParts = []
			for(let key of searchObjects.properties){
				const filterFunction = this.#keyToFilter(key, term)
				resultsDataParts.push( resultsData.filter(filterFunction(searchObjects.values), key) )
			}
			resultsData = arrayMerge(resultsDataParts)
		}

		return resultsData
	}
}