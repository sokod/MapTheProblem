var express = require('express');
var app = express();
var mysql = require('mysql');
var nodemailer = require("nodemailer");
var crypto = require('crypto');

const HTTP_PORT = 8080;
const DB_PORT = 3306;

var host, port;

//--set server--

var server = app.listen(HTTP_PORT, function () {

    host = server.address().address
    port = server.address().port

    console.log('Express app listening at http://%s:%s', host, port)

})

//--sql connection--

var con = mysql.createConnection({
		  host: 'db4free.net',
		  user: 'vsumah',
		  password: 'ghjgbpljy',
		  database: 'vsumah',
		});
con.connect(function(err) {
		if (err) throw err;
	});

app.use(express.static('www'));
app.use(express.json());

//--SMTP--

var smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: "map.the.problem@gmail.com",
        pass: "nodejs2343"
    },
    tls:{
        rejectUnauthorized: false
    }
});
var rand, mailOptions, link;
var userdata = {};
//--main requests--

//registration request
app.post("/reg", function(request, response){
	regData = request.body;
	//console.log(regData);

	//adding user to db
	var checkUser = `SELECT COUNT(*) FROM users WHERE email = ?`;
	con.query(checkUser, regData.email, function (err, result) {
		if (err) throw err;
		//console.log(result[0]['COUNT(*)']);
		if (result[0]['COUNT(*)'] < 1 ){
			var addUser = "INSERT INTO users (password, email, Fname, Sname) VALUES (?, ?, ?, ?)";
			con.query(addUser, [
				getSHA(regData.password),
				regData.email,
				regData.firstName,
				regData.secondName
			], function (err, result) {
				if (err) throw err;
				console.log("1 record inserted");
			});
		}
		else response.end("Даний Email вже зареестровано.");
	});

	//varyfying email
	rand=Math.floor((Math.random() * 100) + 54);
    host=request.get('host');
    link="http://"+ request.get('host') + "/verify?id=" + rand;
    mailOptions={
    	from: "map.the.problem@gmail.com",
    	to : "",
        subject : "MapTheProblem",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
    }
    mailOptions.to = regData.email;
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, res){
	    if(error){
	        console.log(error);
	        response.end("Не вдалося відправити email для підтверження.");
	    }else{
	        console.log("Message sent: " + response.message);
	        response.end("На ваш email відправлено посилання для підтверження.");
	    }
});
});

//verify email
app.get('/verify',function(req,res){
	console.log(req.protocol+":/"+host);
	if((req.protocol+"://"+host)==("http://"+host))
	{
	    console.log("Domain is matched. Information is from Authentic email");
	    if(req.query.id==rand)
	    {
	        console.log("email is verified");

	        var setVarified = `Update users SET verified = 1 WHERE email = ?`;
	        con.query(setVarified, mailOptions.to, function (err, result) {
			if (err) throw err;
			console.log("email verified");
			});

	        res.end("Email "+mailOptions.to+" is been Successfully verified");
	    }
	    else
	    {
	        console.log("email is not verified");
	        res.end("Bad Request");
	    }
	}
	else
	{
	    res.end("Request is from unknown source");
	}
});

//login
app.post("/login", function(request, response){
	var login = request.body;
	var checkUser = `SELECT COUNT(*) FROM users WHERE email = ? AND password = ? AND verified = 1`;
	con.query(checkUser, [
			login.email,
			getSHA(login.password)
		], function (err, result) {
		if (err) throw err;
		//console.log(result[0]['COUNT(*)']);
		if (result[0]['COUNT(*)'] == 1 ){
			
			var setOnline = `Update users SET online = 1 WHERE email = ?`;		
			con.query(setOnline, login.email, function (err, result) {
				if (err) throw err;
				//console.log(login.email + " joined");	
			});
			
			console.log(1);
			response.end(JSON.stringify(userdata));
		}
		else response.end("Неправильний email фбо пароль.");
	});
});

app.get("/isonline", function(request, response){
	var login = request.body;
	userdata[0] = login.email;
	var checkUser = `SELECT COUNT(*) FROM users WHERE email = ? AND password = ? AND online = 1`;
	con.query(checkUser, [login.email, getSHA(login.password)], function (err, result) {
		if (err) throw err;
		//console.log(result[0]['COUNT(*)']);
		if (result[0]['COUNT(*)'] == 1 ){
			userdata[1] = true;
			var getInfo1 = `SELECT (Fname) FROM users WHERE email = ? AND password = ?`;
			con.query(getInfo1, [login.email, getSHA(login.password)],function (err, result1) {
				if (err) throw err;
				userdata[2] = result1[0]['Fname'];
				console.log(userdata[1]);
			});
			var getInfo2 = `SELECT (Sname) FROM users WHERE email = ? AND password = ?`;
				con.query(getInfo2, [login.email, getSHA(login.password)], function (err, result2) {
				if (err) throw err;
				userdata[3] = result2[0]['Sname'];
				console.log(userdata[2]);
			});	
			
		} else userdata[1] = false;
		response.end(JSON.stringify(userdata));
	});
});

//--marker functions--

//load all markers
app.get("/getmarkers", function(request, response){
	con.query("SELECT users.user_id, marker.marker_id, marker.position, marker.title FROM users JOIN marker USING (user_id)",
		function (err, result){
				if (err) throw err;
				//console.log(result);
				response.end(JSON.stringify(result));
			});
});

//add markers
app.post("/addmarker", function(request, response){
	var marker = request.body;
	//console.log(marker);
	con.query("SELECT user_id FROM users WHERE email = ?", marker.email,
		function (err, result_id){
		if (err) throw err;
		//console.log(result_id[0]['user_id']);
		con.query("INSERT INTO marker (position, description, user_id, title)" + 
			" VALUES (point(?, ?), ?, ?, ?)",
			[
				marker.lat,
				marker.lng,
				marker.desc,
				result_id[0]['user_id'],
				marker.name
			],
			function (err, result){
				if (err) throw err;
				response.end("")
			});
	});

});

//--aditional functions--

//get password hash
function getSHA(pwd) {
	var hash = crypto.createHash('sha256').update(pwd).digest('base64');
	return hash;
}


//--process termination--

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated')
    con.end();
  })
});