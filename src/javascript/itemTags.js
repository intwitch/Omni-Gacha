export {
    itemTags
}

class itemTags{

    #tags = {
        "tech": false,
        "magitech": false,
        "magicGeneric": false,
        "magicEast": false,
        "magicWest": false,
        "beast": false,
        "human": false,
        "mech": false,
        "inanimate": false,
        "tome": false
    }

    static properNames = {
        "tech": "Tech",
        "magitech": "Magi-Tech",
        "magicGeneric": "Magic Generic",
        "magicEast": "Magic East",
        "magicWest": "Magic West",
        "beast": "Beast",
        "human": "Human",
        "mech": "Mech",
        "inanimate": "Inanimate",
        "tome": "Tome"
    }

    /**
     * given an array of booleans, construct the tags.
     * order does matter. done this way bc this is how the spreadsheet ends up sending them.
     * @param {boolean[]} givenTags
     */
    constructor(givenTags = []){
        const current = this.getAll()
        for(let i = 0; i < givenTags.length; i++){
            this.#tags[current[i][0]] = (givenTags[i].toUpperCase() == "TRUE")
        }
    }

    /**
     * 
     * @returns {string[]} all keys where value is true
     */
    getAllTrue(){
        const trueTags = []
        for(let tag in this.#tags){
            if(this.#tags[tag]) trueTags.push(tag)
        }
        return trueTags
    }

    /**
     * get all entries from the private tags object
     * @returns {[string, boolean][]} all entries
     */
    getAll(){
        return Object.entries(this.#tags);
    }

    /**
     * replace internal camelCase name with user friendly string
     * @param {string} key 
     */
    static getProperName(key){
        return this.properNames[key]
    }

    /**
     * 
     * @param {string} key 
     * @returns {boolean|undefined} value if found, undefeinied if not
     */
    get(key){
        return this.#tags[key]
    }

    /**
     * 
     * @param {string} key 
     * @param {boolean} value must be boolean
     * @returns {boolean|null} value on success null on fail
     */
    set(key, value){
        if(typeof(value) != "boolean") return null
        return this.#tags[key] = value
    }

    /**
     * return all keys where value is true, in a string, sperated by spaces
     * @returns {string}
     */
    toString(){
        let string = ""

        for(let tag of this.getAllTrue()){
            string += `${itemTags.getProperName(tag)} | `
        }
        return string.slice(0,-3)
    }
}