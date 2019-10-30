"use strict";
//--global--

//--main--

//--functions--
//Check if field is empty
function isFieldEmpty (field) {
	if (field.value == "") return true;
	else return false;
}

//Check password for complexity
function isPWgood (pw) {
	if(!isFieldEmpty(pw)){
		if (pw.value.length >= 8 && pw.value.match(/[0-9]/g)){
		return true;
		}
	}
	return false
}

//Check password for similarity
function isPWsimilar (pw1, pw2) {
	if(!isFieldEmpty(pw1) && !isFieldEmpty(pw2)){
		if (pw1.value.localeCompare(pw2.value) == 0) return true;
	}
	return false;
}

//Validate email
function validateEmail (email) {
	if(!isFieldEmpty(email)){
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email.value);
	}
	return false;
}

//Submit registration
function submit() {
	let name1 = document.getElementById("userName");
	let name2 = document.getElementById("userName2");
	let email = document.getElementById("setMail");
	let pw1 = document.getElementById("enterPW");
	let pw2 = document.getElementById("repeatPW");
	let error = "";

	if (isFieldEmpty(name1))
 		error += "<p>-Поле Ім'я пусте</p>";
	if (isFieldEmpty(name2))
		error += "<p>-Поле Прізвище пусте</p>";
	if (!validateEmail(email))
		error += "<p>-Некоректний Email</p>";
	if (!isPWgood(pw1))
		error += "<p>-Пароль повинен складатися з літер, цифр і містити 8 і більше символів</p>";
	if (!isPWsimilar(pw1, pw2))	
		error += "<p>-Паролі не співпадають</p>";
	

	if (error == ""){
		let regData = {};
		regData.email = email.value;
		regData.firstName = name1.value;
		regData.secondName = name2.value;
		regData.password = pw1.value;
		let xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
		xmlhttp.responseType = "text";
		xmlhttp.onreadystatechange = function() {
	        //if (this.readyState == 4 && this.status == 200) {
	            console.log(this.responseText);
	            document.getElementById("regError")
				.innerHTML = "<p>"+ this.responseText +"</p>";
	        }
		xmlhttp.open("POST", "/reg");
		xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.send(JSON.stringify(regData));
		//console.log(JSON.stringify(regData));
	}
	else{
		document.getElementById("regError").innerHTML = error;
	}
}