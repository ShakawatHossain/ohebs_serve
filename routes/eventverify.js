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
						var sql_ecaps = "SELECT * FROM event_capture ORDER BY id DESC";
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
			var sql = "INSERT INTO event_verify(inf_src, captured_id, veri_mod, veri_start, veri_end, ev_des, "+
			"ev_team, ev_fac, file, s_div, s_dis, s_upz, adds, verified_by) VALUES ('"+
			req.body.inf_src+"', '"+
			req.body.capture_id+"', '"+
			req.body.veri_mod+"', '"+
			req.body.veri_start+"', '"+
			req.body.veri_end+"', '"+
			req.body.ev_des+"', '"+
			req.body.ev_team+"', '"+
			req.body.ev_fac+"', '"+
			file_name+"', '"+
			req.body.s_div+"', '"+
			req.body.s_dis+"', '"+
			req.body.s_upz+"', '"+
			req.body.adds+"', '"+
			user_id+"')";
			console.log(file_name);
			
			con.query(sql,function(err,result){
				if(err){
					console.log(err);
					res.status(200).send({data:null,msg:"Query error"});
				}else{
					var upSql = "UPDATE event_capture SET is_verified=1 WHERE id="+req.body.capture_id;
					con.query(upSql,function(err,result){
						if(err){
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