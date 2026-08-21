function contentFilterChange(){
	NSFWCheckBox = document.getElementById("nsfwCheckbox")
	NSFWOnlyCheckBox = document.getElementById("nsfwOnlyCheckbox")

	NSFW = NSFWCheckBox.checked
	NSFWOnly = NSFWOnlyCheckBox.checked

	//TODO refactor out old variables outside options.
	optionsValues.NSFW = NSFW
	optionsValues.NSFWOnly = NSFWOnly

	optionsCookieSetFunction();

	var searchParam

	if (NSFW == true) {
		if (NSFWOnly == false) {
			// NSFW = true and NSFWOnly = false
			itemsData = rawItemsData;
			cursesData = rawCursesData;
			NSFWOnlyCheckBox.parentElement.style.visibility = "visible"
			updateFilterData();
			return;
		} else {
			// NSFWONLY && NSFW
			NSFWOnlyCheckBox.parentElement.style.visibility = "visible"
			searchParam = true
		}
	} else {
		// NSFW = false and thus NSFWONLY = false
		searchParam = false
		NSFWOnlyCheckBox.checked = false
		NSFWOnlyCheckBox.parentElement.style.visibility = "hidden"
	}
	updateContentFilter(searchParam)
}

/**
 * refilter ItemsData and CursesData based on boolean input
 * if you want some NSFW but not only this function shoulld not be called
 * skip straight to updateFilterData() instead
 * @param {boolean} searchParam 
 */
function updateContentFilter(searchParam) {

	var filterFunction = function (seekPosition) {
		var rFunction = function (value, index, array) {
			return value[seekPosition] === searchParam.toString().toUpperCase()
		}
		return rFunction
	}

	itemsData = rawItemsData.filter(filterFunction(ITEMS.NSFW))
	cursesData = rawCursesData.filter(filterFunction(CURSES.NSFW))

	updateFilterData();
}

//calls all filter related functions for items as it updates the global variable
function updateItemFilterData() {
	filteredItemsData = itemsData;
	filteredItemsData = FilterTicketData(filteredItemsData);
	filteredItemsData = filterItemByCategory(filteredItemsData);
	//console.log(filteredItemsData);
}

function updateCurseFilterData(){
	filteredCursesData = cursesData;
}

function updateFilterData(){
	updateItemFilterData()
	updateCurseFilterData()
}

// create a function to filter on based on an array of filters and an index to see if the index of the item/curse is in the filter.
function valueFilter(filterArray, index) {
	var filterFunction = function (value) {
		const valuePart = value[index].toLowerCase();
		for (filter of filterArray) {
			if (valuePart === filter.toLowerCase()) return true
		}
		return false;
	}
	return filterFunction
}
//same as above, but filter function looks for text matching, not exact matching. Unless it's a rank, where it has to be valueFiltered
function textValueFilter(filterArray, index) {
	var filterFunction = function (value) {
		const valuePart = value[index].toLowerCase();
		for (filter of filterArray) {
			if (valuePart.includes(filter.toLowerCase())) return true
		}
		return false;
	}
	return filterFunction
}

// get ticket value, determine required filters, call rank filter, then return filtered results.
function FilterTicketData(itemsData) {
	var ticketValue = document.getElementById("ticketSelector").value;
	var filter;
	switch (ticketValue) {
		case "0":
		default:
			return itemsData;
			break;
		case "1":
			filter = ["F", "E", "D"];
			break;
		case "2":
			filter = ["E", "D", "C"];
			break;
		case "3":
			filter = ["D", "C", "B"];
			break;
		case "4":
			filter = ["C", "B", "A"];
			break;
		case "5":
			filter = ["B", "A", "S"];
			break;
		case "6":
			filter = ["A", "S", "SS"];
			break;
		case "7":
			filter = ["S", "SS", "SSS"];
			break;
		case "8":
			filter = ["SS", "SSS", "EX"];
			break;
	}



	return itemsData.filter(valueFilter(filter, ITEMS.RANK));
}
// determine categories to filter by, (if any if all is checked), then call filter with valueFilter
function filterItemByCategory(itemsData) {
	var itemsCategoriesFilters = document.querySelectorAll("#itemsCategoryFilter input");
	var filter = []

	if (itemsCategoriesFilters[0].checked) return itemsData;

	for (var category of itemsCategoriesFilters) {
		if (category.checked) filter.push(category.value);
	}

	return itemsData.filter(valueFilter(filter, ITEMS.CATEGORY))
}
// shabby but technically works.... for now.
function searchFor(string) {
	var regex = new RegExp(string, "i");
	var searchResults = itemsData.filter(function (item) {
		return item[ITEMS.NAME].concat(item[ITEMS.SERIES], item[ITEMS.DESCRIPTION]).search(regex) != -1;
	});

	var tbody = document.querySelector("#searchTable > tbody");
	tbody.innerHTML
		= ""; //wipe before replace

	for (var i = 0; i < searchResults.length; i++) {
		if(!searchResults[i]) break;
		var element = searchResults[i];
		var newRow = document.createElement("tr");
		newRow.innerHTML = "<td>" + element[0] + "</td><td>" + element[1] + "</td><td>" + element[2] + "</td><td>" + element[3] + "</td><td>" + element[4] + "</td><td>" + element[5] + "</td><td>" + element[6] + "</td><td>" + element[7] + "</td><td>" + element[8] + "</td><td>" + element[9] + "</td><td>" + element[10] + "</td><td>" + element[11] + "</td><td>" + element[12] + "</td><td>" + element[13] + "</td><td>" + element[14] + "</td><td>" + element[15] + "</td><td>" + element[16] + "</td><td>" + element[17] + "</td><td>" + element[18] + "</td><td>" + element[19] + "</td><td>" + element[20] + "</td>";
		tbody.append(newRow);
	}
}