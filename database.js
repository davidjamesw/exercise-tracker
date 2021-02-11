const mongoose = require('mongoose');
const mongodb = require('mongodb');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String, required: true},
  description: {type: String},
  duration: {type: Number},
  date: {type: String},
  userId: {type: String},
  log: {type: Array}
})
const User = mongoose.model("User", userSchema);

function saveNewUserToDatabase(username, response) {
  let newUser = new User({"username": username});
  console.log(`Writing ${newUser} to the database`);

  newUser.save((err, data) => {
    if (err) {
      console.error(err);
      response(err, null);
    }
    response(null, {_id: data._id, username: username});
  });
}

function getAllUsersFromDatabase(response) {
  User.find({}, (err, results) => {
    if (err) {
      console.error(err);
      response(err, null);
    } else {
      response(null, results);
    }
  });
}

function addExercise(exercise, response) {
  let exerciseDate = new Date();
  if (exercise.date) {
    exerciseDate = new Date(exercise.date);
  }
  let userExercise = {
    description: exercise.description,
    duration: parseInt(exercise.duration),
    date: exerciseDate.toDateString()
  };
  
  User
    .findById(exercise.userId)
    .then(user => {
      console.log(`Updating user ${user._id} with following exercise details ${userExercise.description}, ${userExercise.duration}, ${userExercise.date}`);
      let addToSet =  { $addToSet: { log: [userExercise] } };
      User.updateOne({_id: user._id}, addToSet, (err, data) => {
        if (err) {
          response(err, null);
          console.error(err);
        } else {
          userExercise.username = user.username;
          userExercise._id = user._id;
          response(null, userExercise);          
        }
      });
    });
}

function getLogByUserId(userId, fromDate, toDate, limit, response) {
  User.findById(userId).then(user => {
    user.log = user.log.filter((log) => {
      if (!fromDate) {
        return true;
      }
      return new Date(log.date) >= new Date(fromDate);
    });
    user.log = user.log.filter((log) => {
      if (!toDate) {
        return true;
      }
      return new Date(log.date) <= new Date(toDate);
    });
    response(null, user.log);
  }).catch(err => {
    response(err, null);
    console.error(err);
  });
}

exports.saveNewUserToDatabase = saveNewUserToDatabase;
exports.getAllUsersFromDatabase = getAllUsersFromDatabase;
exports.addExercise = addExercise;
exports.getLogByUserId = getLogByUserId;
