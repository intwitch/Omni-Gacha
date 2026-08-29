export {gachaItem}

import { itemTags } from "./itemTags"

class gachaItem {
    name = String
    series = String
    description = String
    category = String
    gender = String
    magic = String
    memetic = String
    might = String
    mind = String
    motion = String
    moxie = String
    mutation = String
    myth = String
    stats = String
    rank = Number
    growthType = String
    growthRate = String
    restock = String
    returnValue = String
    gift = String
    nsfw = Boolean

    tags = itemTags
    
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
            this[key] = object[key]
        }

        this.tags = new itemTags(tags)
    }

    /**
     * convert an item to a string
     * @returns {string}
     */
    toString() {
        let sfw = ""
        if (this.nsfw) sfw = " | NSFW"
        return `${this.name} | ${this.series}\nRank ${this.series} | ${this.category}${sfw}\n${this.description}`
    }
}