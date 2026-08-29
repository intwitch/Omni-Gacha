import { describe, expect, test } from "vitest";
import { itemTags } from "./itemTags.js"

test('test itemTags getAllTrue()', function () {
    const testTags = new itemTags()
    expect(testTags.getAllTrue()).toEqual([])
    testTags.set("tech", true)
    expect(testTags.getAllTrue()).toEqual(["tech"])
})

test.for([
    [[true], "tech"],
    [[true, false, true], "tech magicGeneric"],
    [[false, false, false, false, false, false, false, false, false, true], "tome"]
])("test toString based on constructor %s", ([values, expected]) => {
    const tags = new itemTags(values)
    expect(tags.toString()).toEqual(expected)
})