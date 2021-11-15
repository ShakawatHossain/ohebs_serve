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
	console.log("without params");
	console.log(req.query.year);
	var sql = "SELECT * FROM event_investigation "+
			"INNER JOIN event_prior_investigation ON event_prior_investigation.id = event_investigation.prior_id "+
			"INNER JOIN event_verify ON event_prior_investigation.verified_id = event_verify.id "+
			"WHERE event_investigation.is_visualized=1";
	if(req.query.year>0){
		console.log("year appears");
		sql += " and year(event_prior_investigation.notification_date)='"+req.query.year+"'";
	}
	console.log(sql);
	con.query(sql, function(err,result){
		if (err) {
			res.status(200).json({data: null, msg: "Query error!"});
		}
		res.setHeader('Content-Type','application/json');
		res.status(200).send({data: result,msg:'Data fetch successfull!'});
	});
	
});
router.get('/:year', function(req, res, next) {
	console.log("with params");
	
	var sql = "SELECT * FROM event_investigation "+
			"INNER JOIN event_prior_investigation ON event_prior_investigation.id = event_investigation.prior_id "+
			"INNER JOIN event_verify ON event_prior_investigation.verified_id = event_verify.id "+
			"WHERE event_investigation.is_visualized=1";
	if(req.params.year>0){
		console.log("year appears");
		sql += " and year(event_prior_investigation.notification_date)='"+req.body.year+"'";
	}
	con.query(sql, function(err,result){
		if (err) {
			res.status(200).json({data: null, msg: "Query error!"});
		}
		res.setHeader('Content-Type','application/json');
		res.status(200).send({data: result,msg:'Data fetch successfull!'});
	});
	
});

module.exports = router;

