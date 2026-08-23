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

		if(nsfw){
			if(nsfwOnly){
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
		
		if(doFilter){
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

		rollItemsData = this.filterItemByRank(rollItemsData);
		rollItemsData = this.filterItemByCategory(rollItemsData);
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
	 * update #data.roll
	 */
	updateRollData() {
		this.#filterItemByRank
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
	 * filter items by rank determined in #filters.ranks
	 * @param {string[]} itemsData array of items
	 * @returns filtered items array
	 */
	#filterItemByRank(itemsData) {
		return itemsData.filter(valueFilter(this.#filters.ranks, ITEMS.RANK));
	}
	// determine categories to filter by, (if any if all is checked), then call filter with valueFilter
	filterItemByCategory(itemsData) {
		var itemsCategoriesFilters = document.querySelectorAll("#itemsCategoryFilter input");
		var filter = []

		if (itemsCategoriesFilters[0].checked) return itemsData;

		for (var category of itemsCategoriesFilters) {
			if (category.checked) filter.push(category.value);
		}

		return itemsData.filter(valueFilter(filter, ITEMS.CATEGORY))
	}
	// shabby but technically works.... for now.
	searchFor(string) {
		var regex = new RegExp(string, "i");
		var searchResults = itemsData.filter(function (item) {
			return item[ITEMS.NAME].concat(item[ITEMS.SERIES], item[ITEMS.DESCRIPTION]).search(regex) != -1;
		});

		var tbody = document.querySelector("#searchTable > tbody");
		tbody.innerHTML
			= ""; //wipe before replace

		for (var i = 0; i < searchResults.length; i++) {
			if (!searchResults[i]) break;
			var element = searchResults[i];
			var newRow = document.createElement("tr");
			newRow.innerHTML = "<td>" + element[0] + "</td><td>" + element[1] + "</td><td>" + element[2] + "</td><td>" + element[3] + "</td><td>" + element[4] + "</td><td>" + element[5] + "</td><td>" + element[6] + "</td><td>" + element[7] + "</td><td>" + element[8] + "</td><td>" + element[9] + "</td><td>" + element[10] + "</td><td>" + element[11] + "</td><td>" + element[12] + "</td><td>" + element[13] + "</td><td>" + element[14] + "</td><td>" + element[15] + "</td><td>" + element[16] + "</td><td>" + element[17] + "</td><td>" + element[18] + "</td><td>" + element[19] + "</td><td>" + element[20] + "</td>";
			tbody.append(newRow);
		}
	}


}