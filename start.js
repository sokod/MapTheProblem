var express = require('express');
var app = express();
var mysql = require('mysql');

const HTTP_PORT = 8080;
const DB_PORT = 3306;

var con = mysql.createConnection({
		  host: 'db4free.net',
		  user: 'vsumah',
		  password: 'ghjgbpljy',
		  database: 'vsumah',
		});

app.use(express.static('www'));
app.use(express.json());

//--main requests--

//registration request
app.post("/reg", function(request, response){
	regData = request.body;
	console.log(regData);
	//if (validateEmail(regData.email)){
		con.connect(function(err) {
			if (err) throw err;
			var sql = "INSERT INTO users (password, email, Fname, Sname) " +
			 `VALUES ('${regData.password}', '${regData.email}', '${regData.firstName}', '${regData.secondName}')`;
			con.query(sql, function (err, result) {
			if (err) throw err;
			console.log("1 record inserted");
			});
		});
	//}
	//else response.end("Помилка реєстрації! Сервер не отримав дані.");
	//response.end("Сервер отримав дані.");
})

//set server
var server = app.listen(HTTP_PORT, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Express app listening at http://%s:%s', host, port)

})

//--aditional functions--

//Validate email
/*function validateEmail (email) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email.value);
}
*/