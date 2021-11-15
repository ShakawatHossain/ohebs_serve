var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var con = mysql.createConnection({
	host: '127.0.0.1',
	port: '3306',
	user: 'root',
  	password : '',
  	database : 'ohebs'
});

router.get('/', function(req, res, next) {
	var sql = "SELECT * FROM institute";
		con.query(sql,function(err,result){
		if(err){
			console.log(err);
			res.status(500).send({data:null,msg:"Query error"});
		}else{
			res.status(200).send({data:result});		
		}
	});
});

module.exports = router;