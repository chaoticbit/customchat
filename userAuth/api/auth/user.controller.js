exports.userLogin = function(req, res) {

    var User = require('../user/user.model').User;
    var jwt = require('jsonwebtoken');

    var username = req.body.username;
    var password = req.body.password;

    console.log('username: '+username + ' password: ' + password);

    User.findOne({username: username}, function(err, user) {
        if (err) {
            console.log(err);
            res.json({success: false});
        }
        if(user) {
            if(password == user.password) {
                var token = jwt.sign(user,'this is matrix');
                console.log(token);
                res.json({success: true,token: token});
                console.dir(user);
            }
            else {
                res.json({success: false});
            }
        }
        else {
            res.json({success: false});
        }
    });
}

exports.userRegister = function(req, res) {

    var User = require('../user/user.model').User;

    req.checkBody("email","Enter a valid email address.").isEmail();
    req.checkBody("username","Can contain only characters.").isAlpha();
    var errors = req.validationErrors();

    if (errors) {
        res.json({err:errors});
    }
    else {
        var user = new User({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        });
        user.save(function(err, user) {
            if( err ) {
                console.error(err);
                res.json({success:false,err:{0:{msg:'Error'}}});
            }
            else {
                console.dir(user);
                res.json({success:true});
            }
        });
    }
}

exports.verifyToken = function(req, res) {
    var jwt = require('jsonwebtoken');

    var decoded = jwt.verify(req.body.headers.Authorization, 'this is matrix');
    console.log(decoded.user);
    res.json({user:decoded.user});
}
