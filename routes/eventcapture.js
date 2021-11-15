var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const multer = require('multer');
const bcrypt = require('bcrypt');
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
	res.send("heloo world");
});
router.post('/',upload.single('file') ,function(req, res, next) {
	console.log("from event_capture");
	console.log(req.headers);
	console.log(req.body);
	
	var sql = "INSERT INTO event_capture (c_name, c_num, ev_des, file_link, s_div, s_dis, s_upz, adds, u_name, user_id) VALUES ('"
	+req.body.c_name+"','"+req.body.c_num+"','"+
	req.body.ev_des+"','"+file_name+"','"+req.body.s_div+"','"+req.body.s_dis+"','"+
	req.body.s_upz+"','"+req.body.adds+"','"+req.body.u_name+"','"+req.body.u_id+"')";
	console.log(sql);
	con.query(sql,function(err,result){
		if(err){
			console.log(err);
			res.status(500).send({data:null,msg:"Query error"});
		}else{
			
			res.status(200).json({"data":result});		
		}
	});

	// res.json({file:req.file});
});

router.use(function(err,req, res, next){
	console.log(err);
	if(err.code === "LIMIT_FILE_TYPE"){
		res.status(500).json({data:null,msg:"Wrong file type"});
	}else if(err.code === "LIMIT_FILE_SIZE"){
		res.status(500).json({data:null,msg:"File size not allowed"});
	}
})

module.exports = router;