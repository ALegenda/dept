var express = require('express');
var app = express();
var mongodb = require("mongodb");
var db;
var ObjectID = require('mongodb').ObjectID;
var url = "mongodb://TomKuper:dbpassword1234@ds121212.mlab.com:21212/heroku_w1ckvk1j";

mongodb.MongoClient.connect(process.env.MONGODB_URI||url, function (err, database)
{
    if (err)
    {
        console.log(err);
        process.exit(1);
    }

    db = database;
    console.log('ok');
});

app.set('port', (process.env.PORT || 5000));


app.get('/', function(request, response) {
    response.send('All right');
});



app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
//app.listen(process.env.PORT);

