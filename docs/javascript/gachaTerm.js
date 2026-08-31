export { gachaTerm }

/**
 * a superclass for gachaItem & gachaCurse due to a certain amount of shared functionality
 * do not attempt to actually use it
 */
class gachaTerm{
    /**
     * some amount of keys with values of one of those types.
     * @type {{
     *  "key": string|boolean|number,
     * }}
     */
    #values

    /**
     * 
     * @param {string} key 
     * @returns {string|number|boolean} value of that key
     */
    get(key){
        return this.#values[key]
    }

    /**
     * 
     * @param {string} key 
     * @param {string|number|boolean} value value to set
     * @returns {string|number|boolean} value
     */
    set(key, value){
        this.#keyValueMatchCheck(key, value)
        return this.#values[key] = value
    }

    /**
     * throws a type error if #values[key] type isn't the same as provided value
     * @param {string} key 
     * @param {string|number|boolean} value 
     */
    #keyValueMatchCheck(key, value){
        const keyType = typeof this.#values[key]
        const valueType = typeof value
        if(keyType != valueType) throw new TypeError(`given value type "${valueType}" does not match resolved key value "${keyType}"`);
    }

    /**
     * returns a row with all data attached. Soon to be legacy. for now while refactoring, it stays.
     * TODO: make this legacy
     * @returns {HTMLTableRowElement}
     */
    toFullRow(){
        const row = document.createElement("tr")

        for(let value of this.#values){
            const cell = document.createElement("td")
            cell.append(value)
            row.appendChild(cell)
        }

        return row
    }

    /**
     * basic row conversion of the item.
     * TODO, replace with a better presentation
     * @param {(string|number|boolean)[]} values values to be put inside the basic form
     * @returns {HTMLTableRowElement}
     */
    toBasicForm(values){
        const row = document.createElement("tr")

        for(let value of values){
            const cell = document.createElement("td")
            cell.append(value)
            row.appendChild(cell)
        }

        return row
    }
}