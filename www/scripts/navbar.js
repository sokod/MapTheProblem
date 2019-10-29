"use strict";
//--global--

//--main--

//--functions--
//Show loginbar
function showLogBar () {
	offAllOverlays();
	setMapClickArea(L.point(0, 30), right_corner);
	document.getElementById("loginBar").style.display = "block";

	/*
	document.getElementById("logButton").style.background = "#ffffff";
	document.getElementById("logButton").style.color = "#18386b";
	document.getElementById("logLink").style.color = "#18386b";
	*/
}

//Clear text fields
function clearText (field) {
	field.value = "";
}