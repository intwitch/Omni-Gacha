import { gachaItem } from "./gachaItem.js";
import { describe, expect, test } from "vitest";
import valuesJson from "../data/values.json" assert {type: "json"}

console.log("")

/**
 * 
 * @param {*} rawData 
 * @returns {{"items": gachaItem[]}}
 */
function setup(rawData) {
	const values = structuredClone(valuesJson)

	const itemsArray = []

	for(let value of values.items){
		itemsArray.push(new gachaItem(gachaItem.arrayToKeyedObject(value), value.splice(23, Infinity)))
	}

	rawData = {
		items: itemsArray,
	}
    return rawData
}


test("first item tests", function () {
    const data = setup()

    const firstItem = data.items[0]
    expect(firstItem.get("name")).toEqual("Fire Manipulation")
    expect(firstItem.get("nsfw")).toBe(false)
    expect(firstItem.get("stats")).toBe(10)
})

test("first item tag tests", function () {
    const data = setup()
    const firstItem = data.items[0]

    expect(firstItem.tags.toString()).toEqual("magicGeneric")
})
