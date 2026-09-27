import { gachaItem } from "./gachaItem.js";
import { gachaCurse } from "./gachaCurse.js";
import { describe, expect, test } from "vitest";
import { filteringHandler } from "./filteringHandler.js"
import sampleValues from "../data/sampleValues.json" assert {type: "json"}
import gachaValues from "../data/values.json" assert {type: "json"}
import { gachaBuildsOptionsHandler } from "./gachaBuildsOptionsHandler.js";

const sampleItemsArray = Array.from(sampleValues.items).splice(1, Infinity)

test("sample data verify", () => {
    expect(sampleItemsArray[0][0]).toEqual("Fire Manipulation")
})

describe("sample data", function () {
    const ItemsArray = []
    for (let item of sampleItemsArray) {
        ItemsArray.push(new gachaItem(gachaItem.arrayToKeyedObject(item), []))
    }
    const optionHandler = new gachaBuildsOptionsHandler()
    const filterHandler = new filteringHandler(optionHandler, {"items": ItemsArray, "curses": []})
    filterHandler.updateContentFilter();
    
    test("get random item", function(){
        const result = filterHandler.getRandomItem()

        expect(result).toBeInstanceOf(gachaItem)
        // one size array, for now
        expect(result.get("name")).toBe("Fire Manipulation")
    })

    test("search name",function(){
        const result = filterHandler.searchItems("name:fire")[0]

        expect(result.get("name")).toMatch(/manip/ig)
        expect(result.get("nsfw")).toBeFalsy()
    })
})

function parseJSON(data){
    const values = data

    const itemsArray = []
    const cursesArray = []

    for (let value of values.items) {
        itemsArray.push(new gachaItem(gachaItem.arrayToKeyedObject(value), value.splice(23, Infinity)))
    }
    for (let value of values.curses) {
        cursesArray.push(new gachaCurse(gachaCurse.arrayToKeyedObject(value)))
    }

    console.log(`items: ${values.items.length}`)

    return {
        items: itemsArray,
        curses: cursesArray
    }
}

describe("data tests", () => {
    //setup
    const values = parseJSON(gachaValues)
    const optionHandler = new gachaBuildsOptionsHandler()
    const filterHandler = new filteringHandler(optionHandler, values)
    filterHandler.updateContentFilter();

    test("search tests", function(){
        const magicE = filterHandler.searchItems("magic:e").length
        const magicF = filterHandler.searchItems("magic:f").length
        const magicEF = filterHandler.searchItems("magic:e,f").length

        expect(magicEF).toBe(magicE + magicF)
        expect(magicEF).toBeGreaterThan(0)
    })
})
