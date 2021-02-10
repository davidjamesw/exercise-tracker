const mongoose = require('mongoose');
const mongodb = require('mongodb');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String, required: true},
  description: {type: String},
  duration: {type: Number},
  date: {type: String},
  userId: {type: String}
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
  console.log(`Updating user ${exercise.userId} with following exercise details ${userExercise.description}, ${userExercise.duration}, ${userExercise.date}`);
  User.findByIdAndUpdate(exercise.userId, userExercise, { new: true }, (err, data) => {
      if (err) {
        response(err, null);
        console.error(err);
      }
      userExercise.username = data.username;
      userExercise._id = data._id;
      response(null, userExercise);
  });
}

exports.saveNewUserToDatabase = saveNewUserToDatabase;
exports.getAllUsersFromDatabase = getAllUsersFromDatabase;
exports.addExercise = addExercise;
