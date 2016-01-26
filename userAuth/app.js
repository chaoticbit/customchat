var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var chat = require('./routes/chat');
var config = require('./oauth.js');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var uuid = require('node-uuid');

var app = express();
app.io = require('socket.io')();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Socket.IO
var clients = 0;
var usernames = [];
var defaultId = '4d5e6f1a3u3l2t';
var rooms = [defaultId];
var socketsArr = [];
var toSocketId;

function exists(obj, objs){
    var objStr = JSON.stringify(obj);
    for(var i=0;i<objs.length; i++){
        if(JSON.stringify(objs[i]) == objStr){
            return 1;
        }
    }
    return 0;
}


app.io.on('connection',function(socket) {
    socket.on('adduser', function(username,roomId) {
        var obj = {
            username : username,
            socketId : socket.id
        };
        if(!exists(obj, usernames)) {
            ++clients;
            socket.username = username;
            socket.room = roomId;
            usernames.push(obj);
        }
        socket.join(defaultId);
        socket.broadcast.emit('updateusers',username,socket.id);
        console.log('usernames: ' + JSON.stringify(usernames));
    });
    socket.on('updatelist',function(){
        socket.broadcast.to(defaultId).emit('updatelist',usernames);
    });

    socket.on('createroom',function(nameTo, u) {
        var dynRoomId = uuid.v1();
        rooms.push(dynRoomId);
        socket.join(dynRoomId);
        socket.room = dynRoomId;
        //socket.broadcast.emit()
    });

    socket.on('sendchat',function(payload) {
        // var dynRoomId = uuid.v1();
        // rooms.push(dynRoomId);
        // socket.join(dynRoomId);
        // socket.room(dy)
        var to = payload.to;
        for(var i = 0; i < usernames.length; i++) {
            if(usernames[i].username == to){
                toSocketId = usernames[i].socketId;
            }
        }
        app.io.sockets.connected[toSocketId].emit('updatechat', payload);
        console.log('tosocketid: ' + toSocketId);
        console.log(JSON.stringify(payload));

    });

    socket.on('disconnect', function() {
        --clients;
        for(var i = 0; i < usernames.length; i++) {
            if(usernames[i].username == socket.username){
                usernames.splice(i,1);
            }
        }
        console.log('usernames: ' + JSON.stringify(usernames));
        socket.broadcast.to(defaultId).emit('disconnected',socket.username);
        socket.leave(socket.room);
    });
});


// app.io.on('connection', function(socket) {
//     socket.on('adduser', function(username) {
//         ++clients;
//         console.log('total active users: ' + clients);
//         socket.broadcast.emit('totalusers',clients);
//         socket.username = username;
//         socket.room = 'Lobby';
//         usernames[username] = username;
//         socket.join('Lobby');
//         socket.emit('updatechat','JARVIS', 'you have connected to the Lobby');
//         socket.broadcast.to('Lobby').emit('updatechat','JARVIS', username + ' has connected to this room');
//         socket.emit('updaterooms', rooms, 'Lobby');
//     });
//     socket.on('create', function(room) {
//         rooms.push(room);
//         socket.broadcast.emit('updaterooms', rooms, socket.room);
//     });
//     socket.on('sendchat', function(message) {
//         app.io.sockets["in"](socket.room).emit('updatechat', socket.username, message);
//     });
//     socket.on('switchRoom', function(newroom) {
//         var oldroom;
//         oldroom = socket.room;
//         socket.leave(socket.room);
//         socket.join(newroom);
//         socket.emit('updatechat','JARVIS', 'you have connected to ' + newroom);
//         socket.broadcast.to(oldroom).emit('updatechat','JARVIS', socket.username + ' has left this room');
//         socket.room = newroom;
//         socket.broadcast.to(newroom).emit('updatechat','JARVIS', socket.username + ' has joined this room');
//         socket.emit('updatrooms', rooms, newroom);
//     });
//     socket.on('disconnect', function() {
//         --clients;
//         socket.broadcast.emit('totalusers',clients);
//         delete usernames[socket.username];
//         //app.io.sockets.emit('updateusers', usernames);
//         socket.broadcast.emit('updatechat','JARVIS',socket.username + ' has disconnected');
//         socket.leave(socket.room);
//     });
// });

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

app.use('/', routes);
app.use('/users', users);
app.use('/auth',auth);
app.use('/chat',chat);

//facebookAuth and googleAuth
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

var token;

passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      token = accessToken;
      process.nextTick(function () {
        return done(null, profile);
      });
    }
));
app.get('/auth/facebook',passport.authenticate('facebook'),function(req, res){});
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    function(req, res) {
        console.log('FbToken: ' + token + '\n');
        res.json({accessToken: token});

});

passport.use(new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackURL,
  passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    token = accessToken;
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));
app.get('/auth/google',
  passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/userinfo.email'
  ] }
));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    console.log('googleToken: ' + token);
    res.json({accessToken: token});
  });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

module.exports = app;
