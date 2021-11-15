var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
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
      }else{
        var sql = "select * from role";
        con.query(sql,function(err,result){
          if(err){
            res.status(403).send({data:"",msg:"Query Error!"});
          }else{
            console.log(result);
            res.status(200).json({data:result});
          }
        });
      }
    });
  }
});
router.post('/', function(req, res, next) {
  if(!req.body.Authorization){
    res.status(500).send('Not null');
  }else{
    jwt.verify(req.body.Authorization,'encrypt', (err,result)=>{
      if(err){
        res.status(500).send('Mismatched token!');    
      }else{
        var sql = "INSERT INTO user_role (user_id, role_id) VALUES ("+req.body.usrid+", "+
        req.body.roleid+")";
        con.query(sql,function(err,result){
          if(err){
            res.status(403).send({data:"",msg:"Query Error!"});
          }else{
            console.log(result);
            res.status(200).json({data:result});
          }
        });
      }
    });
  }
});


module.exports = router;