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
    res.status(200).json({data:null,msg:"Token missing!"});
  }else{
    jwt.verify(req.header('Authorization'),'encrypt', (err,result)=>{
      if(err){
        res.status(200).json({data:null,msg:"Token mismatch!"});    
      }else{
        var sql = "SELECT *,event_investigation.id as 'pri_id' from event_investigation "+
          "INNER JOIN event_prior_investigation ON event_investigation.prior_id=event_prior_investigation.id "+
          "INNER JOIN event_verify ON event_prior_investigation.verified_id=event_verify.id ";
        con.query(sql,function(err,result){
          if(err){
            res.status(200).send({data:null,msg:"Querry error!"});
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
    res.status(200).json({data:null,msg:'Not null'});
  }else{
    jwt.verify(req.body.Authorization,'encrypt', (err,result)=>{
      if(err){
        res.status(200).json({data:null,msg:'Mismatched token!'});    
      }else{

        var sql = "UPDATE event_investigation SET is_visualized="+req.body.visual+
        ", visualized_by="+result.id+" WHERE id="+req.body.pri_id;
        console.log(sql);
        con.query(sql,function(err,result){
          if(err){
            res.status(200).send({data:null,msg:"Query Error!"});
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