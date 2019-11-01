"use strict";
//--global--

//--main--
//window.onload = function(event){
//};

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
function clearText(field) {
	field.value = "";
}

//login
function login(emailFieldId, pwFieldId)
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
	        		//add cookie          
	        		document.cookie = "token=" + this.responseText + ";";
					window.location.pathname = '/index.html';

		        } else alert(this.responseText);}
		    }
		xmlhttp.open("POST", "/login");
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.send(JSON.stringify(logData));
		//console.log(JSON.stringify(regData));
	} else alert("Неправильний email фбо пароль.");
}


function isOnline() {
	let token = getCookie("token");
		let userdata ={};
		let xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
		xmlhttp.responseType = "text";
		xmlhttp.onreadystatechange = function() {
	        if (this.readyState == 4 && this.status == 200){
	        	userdata = JSON.parse(this.responseText);
	        	console.log(this.responseText);
	        	if (!userdata.isOnline){
	        		document.cookie = "token=0;";
					document.getElementById("logLink").href = "/login.html";
					console.log("isOffline");
					console.log(getCookie("token"));
	        	}
	        	else{
					document.getElementById("logLink").href = "/profile.html";
					console.log("isOnline");
	        	}
	        	//return userdata.isOnline; 	        	
		    }
		xmlhttp.open("POST", "/isonline");
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.send(token);
		console.log(token);
		//return true;
}
}

function getCookie(cookiename) {
  // Get name followed by anything except a semicolon
  var cookiestring=RegExp(""+cookiename+"[^;]+").exec(document.cookie);
  // Return everything after the equal sign, or an empty string if the cookie name not found
  return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./,"") : "");
}

