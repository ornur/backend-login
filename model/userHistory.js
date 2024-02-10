const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userHistorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    username: {
        type: String,
        required: true
    },
    weatherData: [{
        type: Object, // Assuming weatherData is an object
        required: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const UserHistory = mongoose.model('UserHistory', userHistorySchema);

module.exports = UserHistory;