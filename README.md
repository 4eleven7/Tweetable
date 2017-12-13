# Tweetable

Used by my automated betting solution to post bet tips to Twitter feeds.
Supports three different Twitter apps to post to different accounts.

TWEET="Testing Tweet";    
TYPE="bet";     
IMAGE="base64EncodedImage";     
curl -d '{ "tweet" : "'"$TWEET"'", "type" : "'"$TYPE"'", "image" : "'"$IMAGE"'" }' -H "Content-Type: application/json" -X POST http://localhost:3000
