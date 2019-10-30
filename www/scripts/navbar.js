"use strict";
//--global--
var username = "", usermail = "";
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

//login
function login (emailFieldId, pwFieldId)
{
	let emailF = document.getElementById(emailFieldId);
	let pwF = document.getElementById(pwFieldId);
	if(emailF.value != "" && pwF.value != ""){
		let logData = {};
		logData.email = emailF.value;
		logData.password = pwF.value;

		let xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
		xmlhttp.responseType = "text";
		xmlhttp.onreadystatechange = function() {
	        if (this.readyState == 4 && this.status == 200){
	        	if (this.responseText != "Неправильний email фбо пароль.") {          

					window.location.pathname = '/index.html';

		        } else alert(this.responseText);}
		    }
		xmlhttp.open("POST", "/login");
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.send(JSON.stringify(logData));
		//console.log(JSON.stringify(regData));
	} else alert("Неправильний email фбо пароль.");
}

function profileLink () {
	if(username == "" || usermail == "")
	window.location.pathname = '/login.html';						
	else window.location.pathname = '/profile.html';
	console.log(username);
}

function isOnline() {
	let logData = {};
		logData.email = emailF.value;
		logData.password = pwF.value;

		let xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
		xmlhttp.responseType = "text";
		xmlhttp.onreadystatechange = function() {
	        if (this.readyState == 4 && this.status == 200){
	        	if (this.responseText != "Неправильний email фбо пароль.") {          

					window.location.pathname = '/index.html';

		        } else alert(this.responseText);}
		    }
		xmlhttp.open("POST", "/login");
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.send(JSON.stringify(logData));
		//console.log(JSON.stringify(regData));
}