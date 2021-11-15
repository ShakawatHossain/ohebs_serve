var express = require('express');
var router = express.Router();
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
	try{
		const salt = await bcrypt.genSalt();
		const hashpass = await bcrypt.hash(req.body.pass, salt);
		var ch_sql = "SELECT * FROM users WHERE email='"+req.body.email+"'";
		con.query(ch_sql,function(err,result){
			if (err) {
				res.status(200).json({data: null, msg: "Query error!"});
			}else if(result.length>0){
				res.setHeader('Content-Type','application/json');
				res.status(200).send({data: null,msg:'Email already exist'});
			}else{
				var sql ="INSERT INTO users(name, mob, email, designation, institution, password, sectors) VALUES ('"+
				req.body.name+"', '"+
				req.body.mob+"', '"+
				req.body.email+"', '"+
				req.body.desg+"', '"+
				req.body.ins+"', '"+
				hashpass+"', '"+
				req.body.skls+"') ";
				con.query(sql, function(err,result){
					if (err) {
						res.status(200).json({data: null, msg: "Query error!"});
					}
					res.setHeader('Content-Type','application/json');
					res.status(200).send({data: result.affectedRows,msg:'Registration Successfull'});
				});
			}
		});
	}catch(err){
		console.log(err);
		res.status(200).json({data: null, msg: "Failed to login!"});
	}

})

module.exports = router;