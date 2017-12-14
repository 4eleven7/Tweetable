var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');

var twitter = require('twit');
var twitterBet = new twitter(config.twitter.bets.api);
var twitterStatistics = new twitter(config.twitter.statistics.api);
var twitterPremium = new twitter(config.twitter.premium.api);

var app = express();
app.use(bodyParser.json({ type: 'application/json' }));

var router = express.Router();
router.post('/', function(req, res)
{
  console.log("Working on a tweet!");

  var type = req.body.type;
  if (type === null || type === undefined) {
    res.statusCode = 400
    return res.json({ error : { message : "Tweet Type not specified in JSON", errorCode : -1 } });
  }
  
  var message = req.body.tweet;
  var tweet_id = req.body.tweet_id;
  var image = req.body.image;
  var username = undefined;

  var twitterInstance = undefined;
  if (type === "bet") {
    twitterInstance = twitterBet;
  }
  else if (type === "premium") {
    twitterInstance = twitterPremium;
  }
  else if (type === "statistics")
  {
    // TODO Support premium stats
    twitterInstance = twitterStatistics;

    tweet_id = req.body.tweet_id;
    username = config.twitter.bets.username;
  }
  console.log("Still working on a tweet!");
  if (typeof image && image.length > 50)
  {
    console.log("Working on an image!");
    uploadImage(twitterInstance, image, res, function(media_id)
    {
      console.log("Now back to working on a tweet!");
      var tweet = constructTweet(message, username, tweet_id, media_id);
      postTweet(twitterInstance, tweet, res);
    });
  }
  else
  {
    console.log("Ready to Tweet " + message);
    
    var tweet = constructTweet(message, username, tweet_id, undefined);  
    postTweet(twitterInstance, tweet, res);
  }
});

app.use('/tweet', router);

module.exports = app;

function uploadImage(twitterInstance, image, res, callback)
{
  twitterInstance.post('media/upload', { media_data : image }, function(err, data, response)
  {
    if (err)
    {
      console.log("There was a problem uploading the image.", err);
      res.statusCode = err.statusCode;
      return res.json({ error : { message : err.message, errorCode : err.code } });
    }

    var media_id = data.media_id_string;
    var meta = { media_id : media_id };
    twitterInstance.post('media/metadata/create', meta, function(err, data, response)
    {
      if (err)
      {
        console.log("There was a problem tweeting the message.", err);
        res.statusCode = err.statusCode;
        return res.json({ error : { message : err.message, errorCode : err.code } });
      }

      callback(media_id);
    });
  });
}

function postTweet(twitterInstance, tweet, res)
{
  twitterInstance.post('statuses/update', tweet, function(err, data, response)
  {
    if (err)
    {
      console.log("There was a problem tweeting the message.", err);
      res.statusCode = err.statusCode;
      return res.json({ error : { message : err.message, errorCode : err.code } });
    }
    
    return res.json({ tweet_id : data.id_str });
  });
}

function constructTweet(message, user, tweet_id, image_id)
{
  var json = { status : message };

  if (user !== undefined && tweet_id !== undefined)
  {
    json["status"] = user + " " + message;
    json["in_reply_to_status_id"] = tweet_id;
  }

  if (image_id !== undefined) {
    json["media_ids"] = [image_id];
  }

  return json;
}
