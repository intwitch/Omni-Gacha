export { gachaCurse }
import { gachaTerm } from "./gachaTerm";

class gachaCurse extends gachaTerm{
    /**
     * @type {{
     *   name: string,
     *   description: string,
     *   resolution: string,
     *   level: string,
     *   target: string,
     *   affects: string,
     *   nsfw: boolean,
     *   reward: string,
     * }}
     */
    #values;

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
    toString() {
        let sfw = ""
        if (this.nsfw) sfw = " | NSFW"
        return `${this.name} | ${this.level}${sfw}\n${this.description}\nResolution: ${this.resolution}`
    }

    toBasicForm(){
        const basicValues = [this.#values.name, this.#values.description, this.#values.resolution, this.#values.level]
        return super.toBasicForm(basicValues)
    }
}