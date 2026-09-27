export{
	smartSplit,
	arrayMerge
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
	var finalArray = [""];
	var index = 0;

	for (let char of splitArray) {
		if (char == '\"') {
			insideQuote = !insideQuote;
			continue;
		}
		if (char == split && !insideQuote) {
			finalArray.push("");
			index++;
		}
		else {
			finalArray[index] += char;
		}
	}
	return finalArray;
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
