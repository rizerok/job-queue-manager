const mongoose = require('mongoose');

const jobSchedulerConnection = mongoose.createConnection('mongodb://localhost/job-scheduler', {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});
jobSchedulerConnection.then((connection) => {
        console.log(`mongoDB has started mongodb://localhost/job-scheduler`);
        return connection;
    });

module.exports = jobSchedulerConnection;
