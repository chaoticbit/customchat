var express = require('express');
var router = express.Router();
var auth = require('../api/auth/user.controller');

router.post('/', function(req, res, next) {
    auth.userLogin(req, res);
});

module.exports = router;
