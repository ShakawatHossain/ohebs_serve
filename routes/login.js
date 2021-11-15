var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var mysql = require('mysql');
var con = mysql.createConnection({
	host: '127.0.0.1',
	port: '3306',
	user: 'root',
  	password : '',
  	database : 'ohebs'
});

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({"token":"aBk48=76C48kcHolla"}));
});

router.post('/', async (req,res)=>{
	var sql = "SELECT * FROM users WHERE email='"+req.body.email+"'";
	// console.log(sql);
	con.query(sql,function(err,result){
		if(err){
			console.log(err);
			res.status(500).send({data:null,msg:"Query error"});
		}else if(result.length==0){
			res.status(200).send({data:null,msg:"No account found"});
		}else if(result[0].is_approved==0){
			res.status(200).send({data:null,msg:"Account not permissable"});
		}else{
			try{
				bcrypt.compare(req.body.pass,result[0].password, (err,bresult)=>{
					if (bresult) {
						const token = jwt.sign({id:result[0].id},'encrypt');
						res.status(200).send({data:result[0],token:token,msg:"Welcome"});
					}else{
						res.status(200).send({data:null,msg:"Email or password mismatch"});
					}
				});
			}catch(err){
				console.log(err);
				res.status(200).send({data:null,msg:"Encryption error"});
			}

		}
		console.log("Login: "+result);
	});
	

})

module.exports = router;