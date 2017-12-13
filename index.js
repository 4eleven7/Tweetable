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
router.get('/', function(req, res)
{
  res.statusCode = 400;
  return res.json({ faliure: ['Dont do it'] });
});

router.post('/bet', function(req, res)
{
  console.log(req.body);
  twitterBet.post('statuses/update', constructTweet(req.body.tweet), function(err, data, response)
  {
    if (err)
    {
      console.log("There was a problem tweeting the message.", err);
      res.statusCode = err.statusCode;
      return res.json({ error : { message : err.message, errorCode : err.code } });
    }
    
    return res.json({ tweet_id_str : data.id_str });
  });
});

router.post('/', function(req, res)
{
  twitterBet.post('statuses/update', constructTweet("BET PLACED"), function(err, data, response)
  {
    if (err) {
      console.log("There was a problem tweeting the message.", err);
      return res.json({ error : err });
    }

    twitterStat.post('statuses/update', constructTweet("BET WON", config.twitter.bets.username, data.id_str), function(err, data, response)
    {
      if (err) {
        console.log("There was a problem tweeting the message.", err);
        return res.json({ error : err });
      }
      
      return res.json({ tweet_id_str : data.id_str, data : data });
    });
  });
  /*
  var json =
  {
    status : "success",
    bet:
    {
      type: req.body.type
    }
  };

  return res.json(json);
  */
});


function constructTweet(message, user, tweet_id)
{
  var json = { status : message };

  if (user !== undefined) {
    json["status"] = user + " " + message;
  }

  if (tweet_id != undefined) {
    json["in_reply_to_status_id"] = tweet_id;
  }

  return json;
}

app.use('/tweet', router);

module.exports = app;



/*
var Twit = require('twit');

var twitter = new Twit(config.twitter);

twitter.post('statuses/update',
      { status: "TEST"  },
      function(err, data, response)
{
  if(err) {
    console.log("There was a problem tweeting the message.", err);
  }
});
*/


/*
var b64content = fs.readFileSync('/path/to/img', { encoding: 'base64' })

// first we must post the media to Twitter
T.post('media/upload', { media_data: b64content }, function (err, data, response) {
  // now we can assign alt text to the media, for use by screen readers and
  // other text-based presentations and interpreters
  var mediaIdStr = data.media_id_string
  var altText = "Small flowers in a planter on a sunny balcony, blossoming."
  var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

  T.post('media/metadata/create', meta_params, function (err, data, response) {
    if (!err) {
      // now we can reference the media and post a tweet (media will attach to the tweet)
      var params = { status: 'loving life #nofilter', media_ids: [mediaIdStr] }

      T.post('statuses/update', params, function (err, data, response) {
        console.log(data)
      })
    }
  })
})
*/
