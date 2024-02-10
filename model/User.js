//models/User.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
	username: {
		type: String,
		unique: true,
	},
	password: {
		type: String
	},
	creationDate: {
		type: Date,
		default: Date.now
	},
	updateDate: {
		type: Date,
		default: Date.now
	},
	deletionDate: {
		type: Date,
		default: null
	},
	adminStatus: {
		type: Boolean,
		default: false
	}
})

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema)
