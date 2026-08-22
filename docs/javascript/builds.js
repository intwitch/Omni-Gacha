// create a new build, and switch to it
function createNewBuildEventHandler(event){
	const value = event.target.value
	if(event.key != "Enter" || value == "") return;

	createNewBuild(value)
}
/**
 * 
 * @param {String} newBuild 
 * @returns -1 on fail null on success
 */
function createNewBuild(newBuild){
	const select = document.getElementById("optionsBuildSelector")
	
	if(optionsValues.buildsArray.indexOf(newBuild) != -1){
		alert(event.target.placeholder = `"${newBuild}" already a build`)
		return -1;
	}
	buildCookieCreator(newBuild);
	populateBuildSelector()
	select.value = newBuild
	return null
}

/**
 * event handler to get value then call switchBuild()
 * @param {Event} event
**/
function switchBuildEventHandler(event){
	switchBuild(event.target.value)
}
/**
 * switch build to the desired.
 * @param {String} buildValue 
 */
function switchBuild(buildValue){
	if(optionsValues.buildsArray.indexOf(buildValue) == -1){
		console.err(`"${buildValue}" not in buildsList`)
		return;
	}

	optionsValues.build = buildValue
	savedItemRolls = buildsValues[buildValue]["items"]
	savedCurseRolls = buildsValues[buildValue]["curses"]
	optionsCookieSetFunction()
	redrawAllSaveTables()
}

/**
 * delete build determined by string.
 * @param {String} build 
 */
function deleteBuild(build){
	delete buildsValues[build]
	optionsValues.buildsArray.splice(optionsValues.buildsArray.indexOf(build), 1)
	switch(true){
		case (optionsValues.buildsArray.length == 0):
			createNewBuild("default")
			break;
		case (optionsValues.build == build):
			switchBuild(optionsValues.buildsArray[0])
			populateBuildSelector()
			break;
		default:
			populateBuildSelector()
			break;
	}
	optionsCookieSetFunction()
	buildCookieSetFunction()
}
/**
 * confirm user wants to delete current build then call deleteBuild
 */
function deleteCurrentBuildConfirm(){
	const currentBuild = optionsValues.build
	if(confirm(`Are you sure you want to delete build "${currentBuild}"?`)) deleteBuild(currentBuild)
}

export {
	createNewBuildEventHandler,
	createNewBuild,
	switchBuildEventHandler,
	switchBuild,
	deleteBuild,
	deleteCurrentBuildConfirm,
};