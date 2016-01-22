var express = require('express');
var router = express.Router();
var auth = require('../api/auth/user.controller');

router.post('/register', function(req, res, next) {
    auth.userRegister(req, res);
});

router.post('/me', function(req, res, next) {
    auth.verifyToken(req, res);
});

module.exports = router;
