var TwitterPackage = require('twitter');
var mongoose = require('mongoose');
var config = require('./config');

// Get the model from database
var Tweet = require('./models/tweetSchema');

// For twitter API
var secret = {
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
}

var Twitter = new TwitterPackage(secret);

var options = {
    user: config.mongo_user,
    pass: config.mongo_pwd
};

mongoose.Promise = global.Promise;
mongoose.connect(config.uri, options);

mongoose.connection.on('connected', function() {
    console.log('Mongoose default connection open to ' + config.uri);
    twitterInit();
});

// If the connection throws an error
mongoose.connection.on('error', function(err) {
    console.log('Mongoose default connection error: ' + err);
});


function twitterInit() {
    Twitter.stream('statuses/filter', {
        track: 'demo_Tweet,kitchenSG ,horsesID'
    }, function(stream) {

        stream.on('data', function(tweet) {

            var TweetData = new Tweet({
                tweet: JSON.stringify(tweet),
                tweetID: tweet.id_str
            })

            TweetData.save(function(err) {
                if (err) throw err;
                console.log("Tweets saved successfully");
            })

            //build our reply object
            var statusObj = {
                status: "Hi @" + tweet.user.screen_name + ", How are you?",
                in_reply_to_status_id: tweet.id_str
            }

            //call the post function to tweet something
            Twitter.post('statuses/update', statusObj, function(error, tweetReply, response) {

                //if we get an error print it out
                if (error) {
                    console.log(error);
                }

                //print the text of the tweet we sent out
                console.log(tweetReply.text);
            });
        });

        stream.on('error', function(error) {
            //print out the error
            console.log(error);
        });
    });
}
