export {gachaItem}

import { itemTags } from "./itemTags"
import { gachaTerm } from "./gachaTerm"

class gachaItem extends gachaTerm {

    /** @type {itemTags} */
    tags
    
    /**
     * 
     * @param {*[]} array 
     * @returns {object} object that can be passed into constructor
     */
    static arrayToKeyedObject(array) {
        return {
            name: array[0],
            series: array[1],
            description: array[2],
            category: array[3],
            gender: array[4],
            magic: array[5],
            memetic: array[6],
            might: array[7],
            mind: array[8],
            motion: array[9],
            moxie: array[10],
            mutation: array[11],
            myth: array[12],
            stats: parseInt(array[13]),
            rank: array[14],
            growthType: array[15],
            growthRate: array[16],
            restock: array[17],
            returnValue: array[18],
            gift: array[19] == "TRUE",
            nsfw: array[20] == "TRUE",
        }
    }
    /**
     * values to consider as false
     */
    static falseValues = {
        growthType: "N/A",
        growthRate: "N/A",
        restock: "N/A",
        returnValue: "N/A",
        gift: false,
        nsfw: false,
    }

    static formattedKeys = {
        name: "Name",
        series: "Series",
        description: "Description",
        category: "Category",
        gender: "Gender",
        magic: "Magic",
        memetic: "Memetic",
        might: "Might",
        mind: "Mind",
        motion: "Motion",
        moxie: "Moxie",
        mutation: "Mutation",
        myth: "Myth",
        stats: "Stats",
        rank: "Rank",
        growthType: "Growth Type",
        growthRate: "Growth Rate",
        restock: "Restock",
        returnValue: "Return",
        gift: "Gift",
        nsfw: "NSFW"
    }

    /**
     * if a keys given value is truthy
     * @param {string} key
     * @param {string|number|boolean}
     * @returns {boolean}
     */
    static isTruthy(key, value){
        return (this.falseValues[key] != value)
    }

    static formatKey(key){
        return this.formattedKeys[key]
    }

    /**
     * 
     * @param {object} object object as definied by static arrayToKeyedObject function
     * @param {boolean[]} tags array of tags values gotten from sheet
     */
    constructor(object, tags){
        const values = structuredClone(object)
        super(values)

        this.tags = new itemTags(tags)
    }

    /**
     * convert an item to a string
     * @returns {string}
     */
    toString() {
        let sfw = ""
        if (super.get("nsfw")) sfw = " | NSFW"
        return `${super.get("name")} | ${super.get("series")} | Rank ${super.get("rank")} | ${super.get("category")}${sfw}\n${super.get("description")}`
    }

    /**
     * basic row conversion of the item.
     * get desired values and call super function
     * TODO, replace with a better presentation
     * @returns {HTMLTableRowElement}
     */
    toBasicForm(){
        const basicValues = [super.get("name"), super.get("series"), super.get("description"), super.get("category")]
        return super.toBasicForm(basicValues)
    }

    getTrueFormattedValues(...keys){
        const values = {}
        for(let key of keys){ 
            if(gachaItem.isTruthy(key, super.get(key))){
            values[key] = super.get(key)
        }}
        return values
    }

    /**
     * convert an array of gacha items to an array of their names. used to save builds.
     * @param {gachaItem[]} itemsArray 
     * @returns {string[]}
     */
    static toNameArray(itemsArray){
        return super.toNameArray(itemsArray)
    }

    /**
	 * given a name of a curse, return the array of all data
	 * if passed argument is not a string, assume it's an array, and return that array (backwards compatibility with old saves)
	 * if name is not found return undefined
	 * @param {string} name
	 * @param {gachaItems[]} rawItems
     * @returns {gachaItem} Item that matches the name
	*/
	static nameToFull(name, rawItems){
        return super.nameToFull(name, rawItems)
    }
}