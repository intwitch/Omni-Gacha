export { curse }

class curse {
    name = String
    description = String
    resolution = String
    level = String
    target = String
    affects = String
    nsfw = Boolean
    reward = String

    /**
     * 
     * @param {string[]} array 
     * @returns object to pass to constructor
     */
    static arrayToKeyedObject(array) {
        return {
            name: array[0],
            description: array[1],
            resolution: array[2],
            level: array[3],
            target: array[4],
            affects: array[5],
            nsfw: array[6],
            reward: array[7],
        }
    }

    constructor(curseObject) {
        for (let key in curseObject) {
            this[key] = curseObject[key]
        }
    }

    /**
    * converts a curse to a string
    * @returns {string}
    */
    toString(this) {
        let sfw = ""
        if (this.nsfw) sfw = " | NSFW"
        return `${this.name} | ${this.level}${sfw}\n${this.description}\nResolution: ${this.resolution}`
    }
}