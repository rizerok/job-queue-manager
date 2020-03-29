const mongoose = require('mongoose');
const jobSchedulerConnection = require('./connection');

const Schema = mongoose.Schema;

const jobSchema = new Schema({
    name: {
        type: String
    },
    pathToScript: {
        type: String
    },
    dateStart: {
        type: Date
    },
    dateFinish: {
        type: Date
    },
    status: {
        type: String
    },
    logs: {
        type: [String]
    },
    result: {
        type: String
    },
    runningTime: {
        type: Number
    }
},{
    toObject: {
        transform(doc, ret) {
            ret._id = ret._id.toString();
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = jobSchedulerConnection.model('Job', jobSchema);
