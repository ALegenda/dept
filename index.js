var express = require('express');
var app = express();
var mongodb = require("mongodb");
var passwordHash = require('password-hash');
var db;
var ObjectID = require('mongodb').ObjectID;
var url = "mongodb://TomKuper:dbpassword1234@ds121212.mlab.com:21212/heroku_w1ckvk1j";

mongodb.MongoClient.connect(
    process.env.MONGODB_URI || url,
    function (err, database)
    {
        if (err)
        {
            console.log(err);
            process.exit(1);
        }

        db = database;
        console.log('ok');

    }
);

app.set('port', (process.env.PORT || 5000));

app.get(
    '/',
    function (request, response)
    {
        response.send('All right');
    }
);

app.get(
    '/kek',
    function (request, response)
    {
        response.send('kek');
    }
);

app.get(
    '/api/adduser',
    function (request, response)
    {

        var params = request.query;
        var collection = db.collection('Users');
        var login = params['login'];
        var password = params['password'];

        if (params['password'] !== params['psw-repeat'])
            response.send('Passwords  can\'t be different');
        else
        {
            collection.findOne({'login': login}).then(
                function (doc)
                {
                    if (doc)
                    {
                        response.send('this login already exist');
                    }
                    else
                    {
                        var password = params['password'];
                        var hash = passwordHash.generate((password));
                        collection.insertOne({"login": login, "password": password, "hash": hash, "teams": []});
                        response.send(passwordHash.generate(login));
                    }
                });
        }
    }
);

app.get(
    '/api/addteam/:login/:password',
    function (request, response)
    {
        var collection = db.collection('Teams');
        var login = request.params.login;
        collection.findOne({'login': login}).then(
            function (doc)
            {
                if (doc)
                {
                    response.send('this login already exist');
                }
                else
                {
                    var password = request.params.password;
                    var hash = passwordHash.generate((password));
                    collection.insertOne({"login": login, "password": password, "hash": hash, "users": []});
                    response.send(hash);
                }
            });
    }
);

app.get(
    '/api/verifyuser',
    function (request, response)
    {
        var params = request.query;
        var collection = db.collection('Users');
        var login = params['login'];
        var password = params['password'];
        collection.findOne({'login': login}).then(
            function (doc)
            {
                if (doc)
                {
                    if (passwordHash.verify(password, doc.hash))
                        response.redirect("https://google.com");
                    else
                        response.send('Incorrect password');
                }
                else
                {
                    response.send('I  have not this user');
                }
            });

    }
);

app.get(
    '/api/userfrom/:userlogin',
    function (request, response)
    {
        var collection = db.collection('Tranzactions');
        var login = request.params.userlogin;

        collection.find({'user': login}).toArray(function (err, results)
                                                 {
                                                     response.send(results); // output all records
                                                 });
    }
);

app.get(
    '/api/userto/:userlogin',
    function (request, response)
    {
        var collection = db.collection('Tranzactions');
        var login = request.params.userlogin;

        collection.find({'aim': login}).toArray(function (err, results)
                                                {
                                                    response.send(results); // output all records
                                                });
    }
);

app.get(
    '/api/teamtranzactions/:team',
    function (requset, response)
    {
        var collection = db.collection('Tranzactions');
        var team = request.params.team;

        collection.find({'team': team}).toArray(function (err, results)
                                                {
                                                    response.send(results); // output all records
                                                });
    }
);

app.get(
    '/api/verifyteam/:login/:password',
    function (request, response)
    {
        var collection = db.collection('Teams');
        var login = request.params.login;
        var password = request.params.password;
        collection.findOne({'login': login}).then(
            function (doc)
            {
                if (doc)
                {
                    if (passwordHash.verify(password, doc.hash))
                        response.send(doc.hash);
                    else
                        response.send('Incorrect password');
                }
                else
                {
                    response.send('I have not this team');
                }
            });
    }
);

app.get(
    '/api/addusertoteam/:user/:hashpass/:team/:hashteam',
    function (request, response)
    {
        var collectionUser = db.collection('Users');
        var collectionTeam = db.collection('Teams');
        collectionUser.findOne(
            {'login': request.params.user, 'hash': request.params.hashpass},
            function (err, item)
            {
                if (item)
                {
                    collectionTeam.findOne(
                        {'login': request.params.team, 'hash': request.params.hashteam},
                        function (err2, item2)
                        {
                            if (item2)
                            {
                                var u = item2.users;
                                if (!(u.indexOf(item.login) > -1))
                                    u.push(item.login);
                                var t = item.teams;
                                if (!(t.indexOf(item2.login) > -1))
                                    t.push(item2.login);
                                collectionTeam.updateOne({'login': request.params.team}, {$set: {'users': u}});
                                collectionUser.updateOne({'login': request.params.user}, {$set: {'teams': t}});

                                response.send('ok');
                            }
                            else
                                response.send('I have not this team');
                        }
                    );
                }
                else
                    response.send('I have not this user');
            }
        );

    }
);

app.get(
    '/api/addtranzaction',
    function (request, response)
    {
        var collection = db.collection('Tranzactions');
        var params = request.query;

        response.send(params); // output all records
    }
);

app.listen(
    app.get('port'),
    function ()
    {
        console.log('Node app is running on port', app.get('port'));
    }
);

//app.listen(3000);

