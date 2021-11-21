var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
var con = mysql.createConnection({
	host: '127.0.0.1',
	port: '3306',
	user: 'root',
  	password : '',
  	database : 'ohebs'
});
router.get('/', function(req, res, next) {
	console.log("Forgetpass without params ");
	if(!req.query.email){
		res.status(200).send({data: null,msg:'No email address provided!'});
	}
	var tkn = parseInt(Math.random()*10000000);
	var tme = Date.now();
	var sql = "UPDATE users set temp_token='"+tkn+"', token_time='"+tme+"' where email='"+req.query.email+"'";
	console.log(sql)
	con.query(sql,function(err,result){
		if (err) {
			res.status(200).json({data: null, msg: "Query error!"});
			return;
		}
		if(result.affectedRows==0){
			res.status(200).json({data: null, msg: "No record found for this email!"});
			return;
		}
		var transport = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 587,
			auth: {
				user: "contact.ohebsdd@gmail.com",
				pass: "conOHEBSDD321"
			}
	    });
	    var mailOptions = {
			from: '"Contact OneHealthEventBasedDataDashboard Team" <contact.ohebsdd@gmail.com>',
			to: req.query.email,
			subject: 'Request to recover password',
			text: 'Hey there, please click the below link to reset your password with in 15 minutes. ',
			// html: '<b>Link </b><br> This is our first message sent with Nodemailer<br /><img src="cid:uniq-mailtrap.png" alt="mailtrap" />',
			html: 'Hey there, please click the below link to reset your password with in 15 minutes. <br><b>Link </b> http://192.168.10.53:8080/password_recovery?q='
			+tkn+'-'+tme,
			attachments: [
			// {
			// filename: 'mailtrap.png',
			// path: __dirname + '/assets/img/apple-icon.png',
			// cid: 'uniq-mailtrap.png' 
			// }
			]
	    };
	    transport.sendMail(mailOptions, (error, info) => {
	      if (error) {
	        console.log(error);
	        res.status(200).json({data: null,msg:'Email sending error!'});
	        return;
	      }
	      console.log('Message sent: %s', info.messageId);
	      res.status(200).json({data: result,msg:'Please check your email!'});
	    });	
	})
});
router.post('/', async(req, res, next) => {
	// console.log(req.params);
	// console.log(req.query);
	// console.log(req.body.tkn);
	try{var tkn = req.body.tkn.split("-");
		var otkn = tkn[0];
		var gen_tme = parseInt(tkn[1]);
		var tme = Date.now();
		var df_tme = tme-gen_tme;
		console.log(df_tme);
		if(df_tme > 15*60*1000){
			res.status(200).json({data:null,msg:"Token time expired try again"});	
		}else{
			const salt = await bcrypt.genSalt();
			const hashpass = await bcrypt.hash(req.body.pass, salt);
			sql = "UPDATE users SET password = '"+hashpass+"' WHERE temp_token='"+otkn+"' and token_time='"+gen_tme+"' ";
			con.query(sql,function(err,result){
			if (err) {
				res.status(200).json({data: null, msg: "Query error!"});
				return;
			}
				res.status(200).json({data:result,msg:"Password changed accordingly!"});	
			});
		}
	}catch(err){
		console.log(err);
		res.status(200).json({data: null, msg: "Failed to reset password!"});
	}
	// res.status(200).json({data:req.body.tkn,msg:req.body.pass});

});
module.exports = router;