var ids = {
    facebook: {
        clientID: '897606013651344',
        clientSecret: '090d9a500426f917f70c708a67b20d44',
        callbackURL: 'http://localhost:3000/auth/facebook/callback'
    },
    google: {
        clientID: '837932560966-mhdfmcvpne6nea2bdv7n9rao5r4982ra.apps.googleusercontent.com',
        clientSecret: '9CO8yjFutT2O5-v5rGr5h4Ru',
        callbackURL: 'http://localhost:3000/auth/google/callback'
    }
};
module.exports = ids;

/*

thread = {
    tid: Number,
    title: String,
    desc: String,
    imagepath: String,
    timestamp: DATETIME,
    user_id: user_id,
    likes {
        id: Number,
    }
}


*/
