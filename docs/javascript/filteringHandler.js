import {
	CURSES,
	ITEMS,
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
		this.#updateItemRollData()
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

	searchItems(searchText){

	}

	searchCurses(searchText){

	}

	#search() {

		//use sourceArray to determine item or curse
		var headerToIndex
		var isCurse
		if (sourceArray[0].length > 10) {
			headerToIndex = itemHeaderToIndex
			isCurse = false
		}
		else {
			headerToIndex = curseHeaderToIndex
			isCurse = true
		}

		
		

		var searchHandler = function (trigger) {
			console.log("search")
			var resultsArray = sourceArray;
			var inputs = trigger.parentElement.querySelectorAll("input");

			var advancedSearchValue = smartSplit(inputs[3].value);
			const advancedSearchVerifyPattern = /^[a-z0-9 ]+(,[a-z0-9 ]+)*:[a-z0-9 ]+(,[a-z0-9 ]+)*$/i;

			advancedSearchValue = advancedSearchValue.filter(function (value) {
				return (value.match(advancedSearchVerifyPattern));
			});

			for (var i = 0; i < 3; i++) {
				if (inputs[i].value == "") continue;
				resultsArray = resultsArray.filter(textValueFilter(inputs[i].value.toLowerCase().split(","), i))
			}
			/*
			probably not going to be a lot of mixing going on, while it's possible O(n^2) is unlikely.
			will in all likelyhood be closer to O(n) or best case O(1)
			*/
			for (searchValue of advancedSearchValue) {
				const arry = searchValue.split(":")
				var headers = arry[0].split(",")
				var terms = arry[1].split(",")

				var arrays = []

				for (header of headers) {
					const index = headerToIndex(header)

					if (isCurse) {
						arrays.push(resultsArray.filter(textValueFilter(terms, index)))
						continue;
					}
					else switch (index) {
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
							arrays.push(resultsArray.filter(textValueFilter(terms, index)))
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
							arrays.push(resultsArray.filter(valueFilter(terms, index)))
							break;
						default:
							consolelog("Search Header Index not found, something seems to have gone wrong.")
					}
					/*
					switch inside an else, kinda cursed I know. but javascript doesn't really benifit massively optimization wize from switch statements, or so I heard
					could have done:
					switch(true){
						case: (index < ITEMS.GENDER)
						case: (isCurse)
							textValueFilter...
							break;
						(etc...)
					}
					but I figured the abovce was more readable and easier to change. And if it is worse, I've made worse decisions in this code.
					TODO: give STATS it's own filter that takes a range of nubmers.
					*/
				}

				resultsArray = arrayMerge(arrays);
			}
			if (isCurse) curseSearchResults = resultsArray
			else itemSearchResults = resultsArray
			redrawHistoryTable(tableID, resultsArray, saveArray)
		}
		return searchHandler
	}
}