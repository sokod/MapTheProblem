let express = require('express');
let app = express();
let mysql = require('mysql');
let nodemailer = require("nodemailer");
let crypto = require('crypto');

const HTTP_PORT = 8080;
const DB_PORT = 3306;

let host, port;

//--set server--

let server = app.listen(HTTP_PORT, function () {

    host = server.address().address
    port = server.address().port

    console.log('Express app listening at http://%s:%s', host, port)

})

//--sql connection--

let con = mysql.createConnection({
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

let smtpTransport = nodemailer.createTransport({
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
let rand, mailOptions, link;
let userdata = {};
//--main requests--

//registration request
app.post("/reg", function(request, response){
	regData = request.body;
	//console.log(regData);

	//adding user to db
	let checkUser = `SELECT COUNT(*) FROM users WHERE email = ?`;
	con.query(checkUser, regData.email, function (err, result) {
		if (err) throw err;
		//console.log(result[0]['COUNT(*)']);
		if (result[0]['COUNT(*)'] < 1 ){
			let addUser = "INSERT INTO users (password, email, Fname, Sname, online) VALUES (?, ?, ?, ?, ?)";
			con.query(addUser, [
				getSHA(regData.password),
				regData.email,
				regData.firstName,
				regData.secondName,
				'0',
			], function (err, result) {
				if (err) throw err;
				//console.log("1 record inserted");
			});
		}
		else response.end("Даний Email вже зареестровано.");
	});

	//letyfying email
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
    //console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, res){
	    if(error){
	        //console.log(error);
	        response.end("Не вдалося відправити email для підтверження.");
	    }else{
	        //console.log("Message sent: " + response.message);
	        response.end("На ваш email відправлено посилання для підтверження.");
	    }
});
});

//verify email
app.get('/verify',function(req,res){
	//console.log(req.protocol+":/"+host);
	if((req.protocol+"://"+host)==("http://"+host))
	{
	    //console.log("Domain is matched. Information is from Authentic email");
	    if(req.query.id==rand)
	    {
	        //console.log("email is verified");

	        let setletified = `Update users SET verified = 1 WHERE email = ?`;
	        con.query(setletified, mailOptions.to, function (err, result) {
			if (err) throw err;
			//console.log("email verified");
			});

	        res.end("Email "+mailOptions.to+" is been Successfully verified");
	    }
	    else
	    {
	        //console.log("email is not verified");
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
	let login = request.body;
	let checkUser = `SELECT user_id FROM users WHERE email = ? AND password = ? AND verified = 1`;
	con.query(checkUser, [
			login.email,
			getSHA(login.password)
		], function (err, result1) {
		if (err) throw err;
		//console.log(result[0]['COUNT(*)']);
		if (result1.length > 0 ){
			//console.log(result[0]['user_id']);
			let setOnline = `Update users SET online = ? WHERE email = ?`;		
			con.query(setOnline, [getSHA(String(result1[0]['user_id'])), login.email], function (err, result) {
				if (err) throw err;
				//console.log(login.email + " joined");	
				//console.log(1);
				response.end(JSON.stringify(getSHA(String(result1[0]['user_id']))));
			});
			
		}
		else response.end("Неправильний email фбо пароль.");
	});
});

//is online
app.post("/isonline", function(request, response){
	let login = request.body;
	console.log(request.body);
	let user = {isOnline: false, Fname: "", Sname: ""};
	let checkUser = `SELECT COUNT(*) FROM users WHERE online = ?`;
	if (login.token.length == 64) con.query(checkUser, login.token, function (err, result) {
		if (err) throw err;
		console.log(result[0]['COUNT(*)']);
		if (result[0]['COUNT(*)'] == 1 ){
			user.isOnline = true;
			let getInfo1 = `SELECT (Fname) FROM users WHERE online = ?`;
			con.query(getInfo1, login.token, function (err, result1) {
				if (err) throw err;
				user.Fname = result1[0]['Fname'];
				let getInfo2 = `SELECT (Sname) FROM users WHERE online = ?`;
					con.query(getInfo2, login.token, function (err, result2) {
					if (err) throw err;
					user.Sname = result2[0]['Sname'];
					response.end(JSON.stringify(userdata));
				});		
			});
		}
	});
	response.end(null);
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

//load one marker
app.post("/onemarker", function(request, response){
	let search = request.body;
	//console.log(search.user_id);
	let marker = {};
	con.query(`SELECT Sname, Fname, online FROM users WHERE user_id = ?`, 
		search.user_id, 
		function (err, result){
			if (err) throw err;
			//console.log(result);
			marker.sname = result[0]['Sname'];
			marker.fname = result[0]['Fname'];
			marker.online = result[0]['online'];
			con.query(`SELECT description FROM marker WHERE marker_id = ?`, 
				search.marker_id, 
				function (err, result){
					if (err) throw err;
					marker.description = result[0]['description'];
					//console.log(JSON.stringify(marker));
					response.end(JSON.stringify(marker));
				});
		});
});

//add markers
app.post("/addmarker", function(request, response){
	let marker = request.body;
	marker.token = marker.token.replace(/"/g, '');
	//console.log(marker);
	
	con.query(`SELECT user_id FROM users WHERE online = ?`, 
		marker.token, 
		function (err, result1){
			console.log(result1);
		con.query("INSERT INTO marker (position, description, user_id, title)" + 
			" VALUES (point(?, ?), ?, ?, ?)",
			[
				marker.lat,
				marker.lng,
				marker.desc,
				result1[0]['user_id'],
				marker.name
			],
			function (err, result){
				if (err) throw err;
				response.end("")
		});
	});
});

//load one marker
app.post("/removemarker", function(request, response){
	let marker ={};
	marker = request.body;
	marker.token = marker.token.replace(/"/g, '');
	console.log(marker);
	con.query(`SELECT user_id FROM users WHERE online = ?`, 
		marker.token, 
		function (err, result1){
			if (err) throw err;
			console.log(result1);
			if (result1.length > 0 ){
			//console.log(result);
			marker.user_id = result1[0]['user_id'];
			con.query(`DELETE FROM marker WHERE marker_id = ? AND user_id = ?`, 
				[marker.marker_id, marker.user_id], 
				function (err, result2){
					if (err) throw err;
					//console.log(JSON.stringify(marker));
					response.end(JSON.stringify(marker.marker_id));
				});
			}
			else response.end("");
			});
});

//--aditional functions--

//get password hash

function getSHA(pwd) {
	let hash = crypto.createHash('sha256').update(pwd).digest('base64');
	return hash;
}

//--process termination--

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated')
    con.end();
  })
});