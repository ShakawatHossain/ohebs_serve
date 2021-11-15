var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
var mysql = require('mysql');
var con = mysql.createConnection({
	host: '127.0.0.1',
	port: '3306',
	user: 'root',
  	password : '',
  	database : 'ohebs'
});
var file_name = '';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
  	file_name = '/public/';
    cb(null, './public/')
  } ,
  filename: function (req, file, cb) {
  	const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  	file_name += uniqueSuffix+file.originalname;
    cb(null,uniqueSuffix+file.originalname)
  }
})

const fileFilter=function(req, file, cb){
	const allowedTypes = ["image/jpeg","image/png","application/pdf"];
	if(!allowedTypes.includes(file.mimetype)){
		const error = new Error("Wrong file type");
		error.code = "LIMIT_FILE_TYPE";
		return cb(error,false);
	}
	return cb(null,true);
}
const upload = multer({
	storage: storage,
	fileFilter,
	limits: {
		fileSize: 5242880
	}
});
router.get('/',function(req, res, next) {
	if(!req.header('Authorization')){
		res.status(500).send('Not null');
	}else{
		jwt.verify(req.header('Authorization'),'encrypt', (err,result)=>{
			if(err){
				res.status(500).send('Mismatched token!');		
			}
			var user_id = result.id;
			var sql = "SELECT * FROM user_role where user_id = "+user_id;
			con.query(sql,function(err,result){
				if(err){
					console.log(err);
					res.status(500).send({data:null,msg:"Query error"});
				}else{
					var has_access = false;
					result.forEach((res) => {
						if(res.role_id == 2){
							has_access=true;
						}
					});
					if(has_access){
						var sql_ecaps = "SELECT * FROM event_prior_investigation ORDER BY id DESC";
						con.query(sql_ecaps,function(err,result){
							if(err){
								console.log(err);
								res.status(500).send({data:null,msg:"Query error"});
							}else{
								res.status(200).json({data:result,msg:"Get events list"});
							}
						});
					}else{
						res.status(200).json({data:null,msg:"No access"});
					}
					// res.json({res:result});
				}
			});
		});
	}
});
router.post('/',upload.single('file'),function(req, res, next) {
	console.log(req.body);
	if(!req.body.Authorization){
		res.status(500).send('Not null');
	}else{
		jwt.verify(req.body.Authorization,'encrypt', (err,result)=>{
			if(err){
				res.status(500).send('Mismatched token!');	
				return;	
			}
			var user_id = result.id;
			var sql = "INSERT INTO event_investigation (prior_id, investigation_end,"+
			 "hu_con_dis, hu_sus_case, hu_lab_case, hu_mortal, hu_src_infec, an_con_dis,"+
			 " an_sus_case, an_lab_case, an_mortal, an_src_infec, res_ins, evt_details, "+
			 "evt_file, risk_age_grp, risk_gender, risk_behav, risk_oth, short_inter, "+
			 "long_inter, outcome, recommendation, limitation, user_id) VALUES ('"+
			req.body.prior_id+"', '"+
			req.body.investigation_end+"', '"+
			req.body.hu_con_dis+"', '"+
			req.body.hu_sus_case+"', '"+
			req.body.hu_lab_case+"', '"+
			req.body.hu_mortal+"', '"+
			req.body.hu_src_infec+"', '"+
			req.body.an_con_dis+"', '"+
			req.body.an_sus_case+"', '"+
			req.body.an_lab_case+"', '"+
			req.body.an_mortal+"', '"+
			req.body.an_src_infec+"', '"+
			req.body.res_ins+"', '"+
			req.body.evt_details+"', '"+
			file_name+"', '"+
			req.body.risk_age_grp+"', '"+
			req.body.risk_gender+"', '"+
			req.body.risk_behav+"', '"+
			req.body.risk_oth+"', '"+
			req.body.short_inter+"', '"+
			req.body.long_inter+"', '"+
			req.body.outcome+"', '"+
			req.body.recommendation+"', '"+
			req.body.limitation+"', '"+
			user_id+"')";
			console.log(file_name);
			
			con.query(sql,function(err,result){
				if(err){
					console.log(err);
					res.status(200).send({data:null,msg:"Query error"});
				}else{
					var upSql = "UPDATE event_prior_investigation SET is_investigate=1 WHERE id="+req.body.prior_id;
					con.query(upSql,function(err,result){
						if(err){
							console.log("Query Error!");
							console.log(err);
							res.status(200).send({data:null,msg:"Event capture update error!"});
						}else{
							res.status(200).json({data:result,msg:"Successfully entered"});
						}
					});
				}
			});
		});
	}
});
router.use(function(err,req, res, next){
	console.log(err);
	if(err.code === "LIMIT_FILE_TYPE"){
		res.status(500).json({data:null,msg:"Wrong file type"});
	}else if(err.code === "LIMIT_FILE_SIZE"){
		res.status(500).json({data:null,msg:"File size not allowed"});
	}
});
module.exports = router;