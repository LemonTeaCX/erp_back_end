let express = require('express');
let router = express.Router();
let connection = require('../db/db');
let Util = require('../util/util');
let md5 = require("blueimp-md5");
let token = require('../util/token');

let { 
	copyJson, 
	treeMenu
} = new Util();

let resWrap = {
  "data": {},
	"msg": "",
	"result": false
};
let mergeRes = (json, ...moreJson) => {
	return Object.assign(copyJson(resWrap), json, ...moreJson);
};

router.get('/', (req, res, next) => {
	res.send('api');
	return;
});

// 获取菜单
router.post('/getMenu', (req, res, next) => {
 	let sql = `SELECT * FROM menu;`;

	connection.query(sql, (error, results, fields) => {
	  if (error) throw error;

	  let menuArr = treeMenu(results);
	  return res.json(mergeRes({
	  	result: true,
	  	data: menuArr
	  }));
	});
});

// 获取账号列表
router.post('/getAccountList', (req, res, next) => {
	let {
		searchVal,
		pageIndex,
		pageSize
	} = req.body;

 	let sqlSearchVal = searchVal
 		? `WHERE(name REGEXP '${searchVal}' OR email REGEXP '${searchVal}')`
 		: '';
 	let sqlPage = `limit ${(pageIndex-1)*pageSize}, ${pageSize}`;
 	let sql = `SELECT SQL_CALC_FOUND_ROWS * FROM account ${sqlSearchVal} ${sqlPage}; SELECT FOUND_ROWS() as total;`;

	connection.query(sql, (error, results, fields) => {
	  if (error) throw error;
	  return res.json({
	  	data: {
	  		list: results[0],
	  		total: results[1][0].total
	  	}
	  });
	});
});

// 登录
router.post('/login', (req, res, next) => {
	let {
		user,
		password
	} = req.body;

	password = md5(password);

	let sql = `SELECT * FROM user WHERE(username = '${user}' OR phone = '${user}');`;

	connection.query(sql, (error, results, fields) => {
	  if (error) throw error;

	  let userInfo = results[0];
	  if (!userInfo) {
	  	return res.json(mergeRes({
	  		msg: '该账号尚未注册',
				result: false
	  	}));
	  };
	  if (password !== userInfo.password) {
	  	return res.json(mergeRes({
		  	msg: '密码错误，请重试',
		  	result: false
		  }));
	  };
	  return res.json(mergeRes({
	  	msg: '登录成功',
	  	result: true,
	  	token: token.signToken({user}),
	  	data: userInfo
	  }));
	});
});

// 注册
router.post('/register', (req, res, next) => {
	let {
		username,
		password,
		phone,
		email,
		sex,
		remark
	} = req.body;

	let sql01 = `SELECT * FROM user WHERE(username = '${username}' OR phone = '${phone}');`;

	connection.query(sql01, (error, results, fields) => {
	  if (error) throw error;
	  if (results.length !== 0) {
	  	return res.json(mergeRes({
	  		msg: '该账号或手机号已被注册',
				result: false
	  	}));
	  };
	  password = md5(password);
	  let sql02 = `INSERT INTO user (username, password, phone, email, sex, remark) VALUES ('${username}', '${password}', '${phone}', '${email}', '${sex}', '${remark}');`;
	  connection.query(sql02, (error, results, fields) => {
	  	return res.json(mergeRes({
	  		msg: '注册成功',
				result: true
	  	}));
	  });
	});
});

module.exports = router;
