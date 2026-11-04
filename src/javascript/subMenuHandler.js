export { subMenuHandler }

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
    
    #close(elementID){
        const animationStatus = this.#properties[elementID].status

        animationStatus.cancel()
        this.#properties[elementID].status = null;
        document.getElementById(elementID).style.display = "none";
    }

    /**
     * 
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

    #newCurrent(elementID){
        if(elementID != ""){
            this.#reverse(elementID)
        }
        if(this.#currentOpenID != ""){
            this.#reverse(this.#currentOpenID)
        }
        this.#currentOpenID = elementID
    }

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
     * open the element if it's closed and close the currently open element (if any), or close it if it's open
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