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

router.get('/',function(req, res, next) {
	if(!req.header('Authorization')){
		res.status(200).json({data:null,msg:'Not null'});
	}else{
		jwt.verify(req.header('Authorization'),'encrypt', (err,result)=>{
			if(err){
				res.status(200).json({data:null,msg:'Mismatched token!'});		
			}
			var user_id = result.id;
			var sql = "SELECT * FROM user_role where user_id = "+user_id;
			con.query(sql,function(err,result){
				if(err){
					console.log(err);
					res.status(200).send({data:null,msg:"Query error"});
				}else{
					var has_access = false;
					result.forEach((res) => {
						if(res.role_id == 3){
							has_access=true;
						}
					});
					if(has_access){
						var sql_ecaps = "SELECT * FROM event_verify ORDER BY id DESC";
						con.query(sql_ecaps,function(err,result){
							if(err){
								console.log(err);
								res.status(200).send({data:null,msg:"Query error"});
							}else{
								res.status(200).json({data:result,msg:"Get events list"});
							}
						});
					}else{
						res.status(200).json({data:null,msg:"No access"});
					}
				}
			});
		});
	}
});
router.post('/',function(req, res, next) {
	console.log(req.body);
	if(!req.body.Authorization){
		res.status(200).json({data:null,msg:'Not null'});
	}else{
		jwt.verify(req.body.Authorization,'encrypt', (err,result)=>{
			if(err){
				res.status(500).json({data:null,msg:'Mismatched token!'});	
				return;	
			}
			var user_id = result.id;
			var sql = "INSERT INTO event_prior_investigation(verified_id, title, origin,"+
			" notification_date, inv_st_date, hu_suspect_dis, hu_suspect_case, hu_lab_confm_case,"+
			" hu_death, hu_infec_src, an_suspect_dis, an_suspect_case, an_lab_confm_case,"+
			" an_death, an_infec_src, user_id) VALUES ('"+
			req.body.verified_id+"', '"+
			req.body.title+"', '"+
			req.body.origin+"', '"+
			req.body.notification_date+"', '"+
			req.body.inv_st_date+"', '"+
			req.body.hu_suspect_dis+"', '"+
			req.body.hu_suspect_case+"', '"+
			req.body.hu_lab_confm_case+"', '"+
			req.body.hu_death+"', '"+
			req.body.hu_infec_src+"', '"+
			req.body.an_suspect_dis+"', '"+
			req.body.an_suspect_case+"', '"+
			req.body.an_lab_confm_case+"', '"+
			req.body.an_death+"', '"+
			req.body.an_infec_src+"', '"+
			user_id+"')";
			
			con.query(sql,function(err,result){
				if(err){
					console.log(err);
					res.status(200).json({data:null,msg:"Query error"});
				}else{
					var upSql = "UPDATE event_verify SET is_priorinvestigate=1 WHERE id="+req.body.verified_id;
					con.query(upSql,function(err,result){
						if(err){
							res.status(200).json({data:null,msg:"Event capture update error!"});
						}else{
							res.status(200).json({data:result,msg:"Successfully entered"});
						}
					});
				}
			});
		});
	}
});
module.exports = router;