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

/**
 * handle all filtering, prepping, 
 * and searching (which is also just filtering to user defined paramaters)
 * do not read/write to dom do not pass go, do not collect 100 dollars, etc.
 * do keep track of filters, and change when function called
 */
class filteringHandler {
	//set here to get intellesense to pick up on type, will always be set by constructor anyway
	#buildsOptions = gachaBuildsOptionsHandler()
	#data = {
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

	#filters = {
		ranks: [
			"F", "E", "D", "C", "B", "A", "S", "SS", "SSS", "EX"
		],
		categories: [
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
		const nsfw = this.#buildsOptions.getOption("NSFW")
		const nsfwOnly = this.#buildsOptions.getOption("NSFWOnly")

		let searchParam
		let doFilter = true;

		if (nsfw) {
			if (nsfwOnly) {
				searchParam = "TRUE"
			}
			else doFilter = false;
		}
		else searchParam = "FALSE"

		var filterFunctionCreator = function (seekPosition) {
			var filterFunction = function (value, index, array) {
				return value[seekPosition] == searchParam
			}
			return filterFunction
		}

		if (doFilter) {
			this.#data.filtered.items = this.#data.raw.items.filter(filterFunctionCreator(ITEMS.NSFW))
			this.#data.filtered.curses = this.#data.raw.curses.filter(filterFunctionCreator(CURSES.NSFW))
		}

		this.updateRollData()
	}
	/**
	 * get a constant reference to data.filtered.items, mutate acordingly
	 * and assign to data.roll.items
	 */
	updateItemRollData() {
		const rollItemsData = this.#data.filtered.items

		rollItemsData = this.#filterItemsByRank(rollItemsData);
		rollItemsData = this.#filterItemsByCategory(rollItemsData);
		this.#data.roll.items = rollItemsData
	}

	/**
	 * currently, just sets roll.curses to filtered.curses
	 * method and additional variable exists for future proofing.
	 */
	#updateCurseRollData() {
		this.#data.roll.curses = this.#data.filtered.curses
	}

	/**
	 * filter items by rank determined in #filters.ranks
	 * @param {string[]} itemsData array of items
	 * @returns filtered items array
	 */
	#filterItemsByRank(itemsData) {
		return itemsData.filter(valueFilter(this.#filters.ranks, ITEMS.RANK));
	}
	/**
	 * filter items by category determined in #filters.categories
	 * @param {string[]} itemsData array of items
	 * @returns filtered items array
	 */
	#filterItemsByCategory(itemsData) {
		return itemsData.filter(valueFilter(this.#filters.categories, ITEMS.CATEGORY))
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
	 * @param {string[]} filterArray array of things to match to
	 * @param {int} index what index of the item/curse to check against
	 * @returns function to use in array.filter()
	 */
	static exactValueFilter(filterArray, index) {
		var filterFunction = function (value) {
			const valuePart = value[index].toLowerCase();
			for (filter of filterArray) {
				if (valuePart === filter.toLowerCase()) return true
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
		var filterFunctionCreator = function (value) {
			const valuePart = value[index].toLowerCase();
			for (filter of filterArray) {
				if (valuePart.includes(filter.toLowerCase())) return true
			}
			return false;
		}
		return filterFunctionCreator
	}

	/**
	 * search the data for all maching based on the searchText string
	 * @param {string} searchText 
	 * @returns {string[][]}
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
	 * @returns string[][]
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