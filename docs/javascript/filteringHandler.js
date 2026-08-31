import {
	CURSES,
	ITEMS,
	smartSplit,
	arrayMerge,
	itemHeaderToIndex,
	curseHeaderToIndex
} from "./main.js";
import {
	gachaBuildsOptionsHandler
}
	from "./gachaBuildsOptionsHandler.js"

export {
	filteringHandler
}

import { gachaItem } from "./gachaItem.js";
import { gachaCurse } from "./gachaCurse.js";

/**
 * handle all filtering, prepping, 
 * and searching (which is also just filtering to user defined paramaters)
 * do not read/write to dom do not pass go, do not collect 100 dollars, etc.
 * do keep track of filters, and change when function called
 */
class filteringHandler {
	//set here to get intellesense to pick up on type, will always be set by constructor anyway
	#buildsOptions = gachaBuildsOptionsHandler()
	/**
	 * @type {{
	 *   raw: { items: gachaItem[], curses: gachaCurse[] },
	 *   filtered: { items: gachaItem[], curses: gachaCurse[] },
	 *   roll: { items: gachaItem[], curses: gachaCurse[] }
	 * }}
	 */
	#data

	#filters = {
		"rank": [
			"F", "E", "D", "C", "B", "A", "S", "SS", "SSS", "EX"
		],
		"category": [
			"Ability", "Arsenal", "Consumable", "Familiar", "Farmable", "Novelty", "Passive", "Race", "Skill", "Vehicle", "Wearible", "World"
		]
	}

	/**
	 * 
	 * @param {gachaBuildsOptionsHandler} gachaBuildsOptionsHandler 
	 * @param {object} data
	 */
	constructor(gachaBuildsOptionsHandler, data) {
		this.#buildsOptions = gachaBuildsOptionsHandler
		this.#data = data

		
	}

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
		this.updateItemRollData()
		this.updateCurseRollData()
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
			for (filter of filterArray) {
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
	 * @param {int} index what index of the item/curse to check against
	 * @returns function to use in array.filter()
	 */
	static textValueFilter(filterArray, index) {
		let filterFunctionCreator = function (value) {
			const valuePart = value[index].toLowerCase();
			for (filter of filterArray) {
				if (valuePart.includes(filter.toLowerCase())) return true
			}
			return false;
		}
		return filterFunctionCreator
	}

	/**
	 * given a name of item or curse, return the array of all data
	 * if passed argument is not a string, assume it's an array, and return that array (backwards compatibility with old saves)
	 * if name is not found return undefined
	 * @param {string} name
	 * @param {boolean} isItem is the raw item array and not curse array
	*/
	static nameToFull(name, isItem = true) {
		if (typeof name != "string") return name;
		let dataArray;
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
		const indexToFilterFunction = function (index) {
			switch (index) {
				case ITEMS.NAME:
				case ITEMS.SERIES:
				case ITEMS.DESCRIPTION:
				case ITEMS.CATEGORY:
				case ITEMS.GENDER:

				case ITEMS.GROWTH_RATE:
				case ITEMS.GROWTH_TYPE:
				case ITEMS.RESTOCK:
				case ITEMS.RETURN:
				case ITEMS.GIFT:
				case ITEMS.NSFW:
					return filteringHandler.textValueFilter
					break;
				case ITEMS.MAGIC:
				case ITEMS.MEMETIC:
				case ITEMS.MIGHT:
				case ITEMS.MIND:
				case ITEMS.MOTION:
				case ITEMS.MOXIE:
				case ITEMS.MUTATION:
				case ITEMS.MYTH:
				case ITEMS.STATS:
				case ITEMS.RANK:
					return filteringHandler.exactValueFilter
					break;
				default:
					consolelog("Search Header Index not found, something seems to have gone wrong.")
			}
		}

		return this.#search(searchText, this.#data.filtered.items, indexToFilterFunction, itemHeaderToIndex)
	}

	/**
	 * search the data for all maching based on the searchText string
	 * @param {string} searchText 
	 * @returns {gachaCurse[]}
	 */
	searchCurses(searchText){
		/*
		we do it like this for two reasons:
		align with how searchItems does it
		we always want to search curses by text value
		but if that ever changes all we have to do is implement a switch and cases
		 */
		const indexToFilterFunction = function(index){
			return filteringHandler.textValueFilter
		}

		return this.#search(searchText, this.#data.filtered.curses, indexToFilterFunction, curseHeaderToIndex)
	}

	/**
	 * 
	 * @param {string} searchText 
	 * @param {string} term "items"/"curses"
	 * @returns {gachaItem[]|gachaCurse[]|null} null if term invalid
	 */
	searchTerm(searchText, term){
		if(term == "items") return this.searchItems(searchText);
		if(term == "curses") return this.searchCurses(searchText);
		return null;
	}

	/**
	 * verify the search text, and construct the search objects
	 * 
	 * @param {string} searchText 
	 * @returns {{keys: string[], values: string[]}[]} searchObjects
	 */
	#searchTextToObjects(searchText){
		const searchValues = this.#searchTextVerifySplit(searchText)
		const searchObjects = []

		for(string of searchValues){
			const parts = string.split(":")
			searchObjects.push({
				keys: smartSplit(parts[0], ","),
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
	 * search a set of data, based on the searchtext string.
	 * indexToFilter and headerToIndex are item/curse dependant and thus 
	 * are passed along by the public methods.
	 * 
	 * @param {string} searchText 
	 * @param {string[][]} data data.filtered.items/curses
	 * @param {function} indexToFilter
	 * @param {function} headerToIndex
	 * @returns {string[][]}
	 */
	#search(searchText, data, indexToFilter, headerToIndex) {
		const searchObjects = this.#searchTextToObjects(searchText)

		let resultsData = data
		for(searchObject of searchObjects){
			let resultsDataParts = []
			for(key of searchObjects){
				const index = headerToIndex(key)
				const filterFunction = indexToFilter(index)
				resultsDataParts.push( resultsData.filter(filterFunction(searchObjects.values), index) )
			}
			resultsData = arrayMerge(resultsDataParts)
		}

		return resultsData
	}
}