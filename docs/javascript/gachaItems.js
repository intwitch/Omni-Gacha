export {gachaItem}

import { itemTags } from "./itemTags"
import { gachaTerm } from "./gachaTerm"

class gachaItem extends gachaItem {
    /** @type {{
     *   name: string,
     *   series: string,
     *   description: string,
     *   category: string,
     *   gender: string,
     *   magic: string,
     *   memetic: string,
     *   might: string,
     *   mind: string,
     *   motion: string,
     *   moxie: string,
     *   mutation: string,
     *   myth: string,
     *   stats: number,
     *   rank: string,
     *   growthType: string,
     *   growthRate: string,
     *   restock: string,
     *   returnValue: string,
     *   gift: string,
     *   nsfw: boolean
     * }} */
    #values

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
            gift: array[19],
            nsfw: array[20] === true,
        }
    }

    /**
     * 
     * @param {object} object object as definied by static arrayToKeyedObject function
     * @param {boolean[]} tags array of tags values gotten from sheet
     */
    constructor(object, tags){
        for(let key in object){
            this.#values[key] = object[key]
        }

        this.#tags = new itemTags(tags)
    }

    

    /**
     * convert an item to a string
     * @returns {string}
     */
    toString() {
        let sfw = ""
        if (this.#nsfw) sfw = " | NSFW"
        return `${this.#name} | ${this.#series}\nRank ${this.#series} | ${this.#category}${sfw}\n${this.#description}`
    }

    /**
     * basic row conversion of the item.
     * get desired values and call super function
     * TODO, replace with a better presentation
     * @returns {HTMLTableRowElement}
     */
    toBasicForm(){
        const basicValues = [this.#values.name, this.#values.series, this.#values.description, this.#values.category]
        return super.toBasicForm(basicValues)
    }
}