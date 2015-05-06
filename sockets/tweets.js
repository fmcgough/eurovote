var socket = require('socket.io')
 , Twitter = require('twitter');

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

module.exports = function(server) {
    console.log("using tweets");
    var io = socket(server);
    var tweets = io.of("/tweets").on("connection", function(socket) {
        // Client just connected - give them some data
    });

    // TODO - make tracking configurable
    client.stream("statuses/filter", {track: 'eurovision2015,#greenparty'}, function(stream) {
        stream.on('data', function(tweet) {
            console.log(tweet.text);
            tweets.emit('tweet', tweet);
        });
        stream.on('error', function(error) {
            console.log(error);
        })
    });
}
