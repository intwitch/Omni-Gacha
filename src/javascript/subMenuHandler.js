export { subMenuHandler }

/**
 * class designed to handle a group of submenus, with dynamic animations
 * only one menu per group is allowed to be open at a time.
 * only other class other than page handler allowed to interact with document.
 */
class subMenuHandler{
    /**
     * @type {{
     * "elementID": {
     * "animation": [],
     * "options": {
     * duration: Number
     * },
     * "status": Animation
     * }
     * }}
     */
    #properties = {};

    /**
     * @type {string}
     */
    #currentOpenID = "";

    constructor(elementProperties){
        for(let ID in elementProperties){
            this.#properties[ID] = {
                "animation": elementProperties[ID].animation,
                "options": elementProperties[ID].options,
                "status": null
            }
        }
    }

    /**
     * if a submenu is open, and someone clicks outside of it, close it.
     * @param {Element} clickedElement specific element that was clicked.
     * @returns {boolean} true if something was closed, otehrwise
     */
    closeByClickAnywhere(clickedElement){
        if(this.#currentOpenID == "") { return false }

        if(document.getElementById(this.#currentOpenID).contains(clickedElement)){
            return false;
        } else{
            this.#newCurrent("")
            return true
        }
    }
    
    /**
     * once a fully completed closing animation is done, cancel the animation and hide the element.
     * @param {string} elementID 
     */
    #close(elementID){
        const animationStatus = this.#properties[elementID].status

        animationStatus.cancel()
        this.#properties[elementID].status = null;
        document.getElementById(elementID).style.display = "none";
    }

    /**
     * open something completely closed by creating an animation
     * @param {string} elementID 
     */
    #open(elementID){
        if(this.#currentOpenID != ""){
            this.#reverse(this.#currentOpenID)
        }
        this.#currentOpenID = elementID
        const element = document.getElementById(elementID)
        
        element.style.display = "block"
        this.#properties[elementID].status = element.animate(this.#properties[elementID].animation, this.#properties[elementID].options)
    }

    /**
     * define new current meant-to-be-open submenu, close reverse one (if it exists)
     * @param {elementID} elementID 
     */
    #newCurrent(elementID){
        if(elementID != ""){
            this.#reverse(elementID)
        }
        if(this.#currentOpenID != ""){
            this.#reverse(this.#currentOpenID)
        }
        this.#currentOpenID = elementID
    }

    /**
     * reverse animation for element and once it's done closing kill animation
     * @param {string} elementID 
     */
    #reverse(elementID) {
        const animationStatus = this.#properties[elementID].status

        animationStatus.reverse()

        animationStatus.finished.then(() => {
            if (animationStatus.playbackRate < 0) {
                this.#close(elementID)
            }
        })
    }

    /**
     * open the given element if it's closed or closing and close any other open or opening elements
     * or close the open or opening element.
     * @param {string} elementID 
     */
    toggle(elementID){
        const animationStatus = this.#properties[elementID].status

        if (animationStatus == null) {
            this.#open(elementID)
            return;
        }
        
        if(this.#currentOpenID == elementID){
            this.#newCurrent("")
        }
        else{
            this.#newCurrent(elementID)
        }
    }
}