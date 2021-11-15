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

router.get('/', function(req, res, next) {
	if(!req.header('Authorization')){
		res.status(500).send('Not null');
	}else{
		jwt.verify(req.header('Authorization'),'encrypt', (err,result)=>{
			if(err){
				res.status(500).send('Mismatched token!');		
			}
			var user_id = result.id;
			var sql = "SELECT * FROM user_role where user_id = "+user_id+" order by role_id";
			con.query(sql,function(err,result){
				if(err){
					console.log(err);
					res.status(500).send({data:null,msg:"Query error"});
				}else{
					var data=[];
					result.forEach((row)=>{
						data.push(row.role_id);
					})
					console.log(data);
					res.setHeader('Content-Type', 'application/json');
					res.status(200).send({"data":data});		
				}
			});
		});
	}
});
router.get('/:id', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({"id":req.params.id,"token":"aBk48=76C48kcHolla"}));
});
module.exports = router;