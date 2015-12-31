'use strict';

// server
// var auth = require('koa-basic-auth');
var serve = require('koa-static');
var route = require('koa-route');
var parse = require('koa-body');
var koa = require('koa');
var path = require('path');
var app = koa();

// database
var mongoose = require('mongoose');
var db = mongoose.connection;

// connect to database
var connect = () => {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  mongoose.connect('mongodb://localhost/irene');
};
connect();

// database listeners
db.on('error', console.log);
db.on('disconnected', connect);

// schema
var userSchema = new mongoose.Schema({
  user: {type: String, required: true, unique: true},
  score: Number,
  sessions: Array,
});
var challengeSchema = new mongoose.Schema({
  user: String,
  score: Number,
  desc: String,
  dateCreated: Date,
  dateDone: Date,
});

userSchema.methods.addScore = (inc) => {
  this.score += inc;
  return this.score;
};

challengeSchema.methods.finish = (date, user) => {
  if(this.user) return;

  var done = new Date();
  if(date) done = date;
  this.dateDone = done;

  return this.dateDone;
};



// models
var user = mongoose.model('users', userSchema);
var challenge = mongoose.model('challenges', challengeSchema);

var irene = new user({
  user: 'i',
  score: '1',
});
var jj = new user({
  user: 'j',
  score: '1',
});

irene.save();
jj.save();

var ch1 = new challenge({
  user: 'j',
  score: 1,
  desc: 'testing',
  dateCreated: new Date(),
});

ch1.save();

var routes = {
  *getScores() {
    var users = yield user.find().sort({user: 1});
    // console.log(users);
    this.body = JSON.stringify({
      i: users[0].score,
      j: users[1].score,
    });
  },
  *postScore(id) {
    var score = parseInt(this.request.body);
    // console.log(score, id);
    var success = yield user.findOneAndUpdate({user: id}, {$inc: {score: score}});
    this.body = score;
  },
  *getChallenges() {
    var challenges = yield challenge.find().sort({dateCreated: 1});
    this.body = JSON.stringify(challenges);
  },
  *putChallenge() {
    var obj = this.request.body;
    // console.log(obj);
    if(!obj.dateCreated) obj.dateCreated = new Date();
    var newChallenge = new challenge(obj);
    yield newChallenge.save();
    this.body = newChallenge;
  },
  *deleteChallenge(id) {
    var remove = yield challenge.remove({_id: id});
    this.body = remove;
  },
}

app.use(parse());

app.use(route.get('/api/scores', routes.getScores));
app.use(route.post('/api/scores/:id', routes.postScore));
app.use(route.get('/api/challenges', routes.getChallenges));
app.use(route.put('/api/challenges', routes.putChallenge));
app.use(route.delete('/api/challenges/:id', routes.deleteChallenge));

app.use(serve(path.join(__dirname, 'public')));

app.listen(8008);