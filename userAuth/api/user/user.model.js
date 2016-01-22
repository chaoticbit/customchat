var mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/testdb", function(err) {
    if (err) {
        console.error(err);
    }
    console.log('Connected');
});
var Schema = mongoose.Schema;
var usersSchema = new Schema({
    username: String,
    password: String,
    email: String
});

var User = mongoose.model("User", usersSchema);

module.exports = {
    User:User
};
