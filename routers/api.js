let express = require('express');
let router = express.Router();
let connection = require('../db/db');
let Util = require('../util/util');

let {
	copyJson
} = new Util();
let resWrap = {
	"code": 0,
  "data": {},
	"msg": "",
	"result": false
};
let mergeRes = (json, ...moreJson) => {
	return Object.assign(copyJson(resWrap), json, ...moreJson);
};

router.get('/', function(req, res, next) {
	res.send('api');
	return;
});

// 获取账号列表
router.post('/getAccountList', function(req, res, next) {
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

	connection.query(sql, function (error, results, fields) {
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
router.post('/login', function(req, res, next) {
	let {
		user,
		password
	} = req.body;

	let sql = `SELECT * FROM user WHERE(mobile = '${user}' OR email = '${user}')`;

	connection.query(sql, function (error, results, fields) {
	  if (error) throw error;
	  if (results.length === 0) {
	  	return res.json(mergeRes({
	  		msg: '该账号尚未注册',
				result: false
	  	}));
	  };
	  if (password !== results[0].password) {
	  	return res.json(mergeRes({
		  	msg: '密码错误，请重试',
		  	result: false
		  }));
	  };
	  return res.json(mergeRes({
	  	msg: '登录成功',
	  	result: true
	  }));
	});
});

module.exports = router;
