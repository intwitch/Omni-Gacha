export { gachaCurse }
import { gachaTerm } from "./gachaTerm";

class gachaCurse extends gachaTerm{
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
            nsfw: (array[6] == "TRUE"),
            reward: array[7],
        }
    }

    constructor(curseObject) {
        const values = structuredClone(curseObject)
        super(values)
    }

    /**
    * converts a curse to a string
    * @returns {string}
    */
    toString() {
        let sfw = ""
        if (super.get("nsfw")) sfw = " | NSFW"
        return `${super.get("name")} | ${super.get("level")}${sfw}\n${super.get("description")}\nResolution: ${super.get("resolution")}`
    }

    toBasicForm(){
        const basicValues = [super.get("name"), super.get("description"), super.get("resolution"), super.get("level")]
        return super.toBasicForm(basicValues)
    }

     /**
     * convert an array of gacha curses to an array of their names. used to save builds.
     * @param {gachaCurse[]} cursesArray 
     * @returns {string[]}
     */
    static toNameArray(cursesArray){
        return super.toNameArray(cursesArray)
    }

    /**
	 * given a name of a curse, return the array of all data
	 * if passed argument is not a string, assume it's an array, and return that array (backwards compatibility with old saves)
	 * if name is not found return undefined
	 * @param {string} name
	 * @param {gachaCurse[]} rawCurses
     * @returns {gachaCurse} Curse that matches the name
	*/
	static nameToFull(name, rawCurses){
        return super.nameToFull(name, rawCurses)
    }

}