import { describe, expect, test } from "vitest";
import { itemTags } from "./itemTags.js"

test('test itemTags getAllTrue()', function () {
    const testTags = new itemTags()
    expect(testTags.getAllTrue()).toEqual([])
    testTags.set("tech", true)
    expect(testTags.getAllTrue()).toEqual(["tech"])
})

test.for([
    [["TRUE"], "tech"],
    [["TRUE", "FALSE", "TRUE"], "tech magicGeneric"],
    [["FALSE", "FALSE", "FALSE", "FALSE", "FALSE", "FALSE", "FALSE", "FALSE", "FALSE", "TRUE"], "tome"]
])("test toString based on constructor %s", ([values, expected]) => {
    const tags = new itemTags(values)
    expect(tags.toString()).toEqual(expected)
})