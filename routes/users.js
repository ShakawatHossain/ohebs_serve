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

/* GET users listing. */
router.get('/', function(req, res, next) {

  if(!req.header('Authorization')){
    res.status(500).send('Not null');
  }else{
    jwt.verify(req.header('Authorization'),'encrypt', (err,result)=>{
      if(err){
        res.status(500).send('Mismatched token!');    
      }else{
        var sql = "SELECT users.*,institute.name as 'ins_name' FROM users "+
        "INNER JOIN institute ON users.institution = institute.id "+
        "WHERE users.institution = (SELECT institution FROM users WHERE id="+result.id+")";
        con.query(sql,function(err,result){
          if(err){
            res.status(403).send({data:"",msg:"Query Error!"+sql});
          }else{
            // console.log(result);
            res.status(200).json({data:result});
          }
        });
      }
    });
  }
});
router.post('/', function(req, res, next){
  jwt.verify(req.body.user_id,'encrypt', (err,result)=>{
    if(err){
      res.status(500).send('Mismatched token!');    
    }else{
      var sql = "UPDATE users SET is_approved="+req.body.action+" WHERE id="+req.body.usrid ;
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
});
router.get('/:id', function(req, res, next) {
  if(!req.header('Authorization')){
    res.status(500).send('Not null');
  }else{
    jwt.verify(req.header('Authorization'),'encrypt', (err,result)=>{
      if(err){
        res.status(500).send('Mismatched token!');    
      }else{
        var sql = "select user_role.id,role.role_name,user_role.created_at as 'created_at' from user_role INNER JOIN role on user_role.role_id=role.id where user_id="+req.params.id;
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
router.post('/:id', function(req, res, next) {

  var sql = "DELETE from user_role where user_id="+req.params.id+" and id="+req.body.id;
  con.query(sql,function(err,result){
    if(err){
      res.status(403).send({data:"",msg:"Query Error!"});
    }else{
      console.log(result);
      res.status(200).json({data:result});
    }
  });
});
module.exports = router;
