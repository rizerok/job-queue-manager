const moment = require('moment');
const { CronJob } = require('cron');
const JobModel = require('./mongo/job');
const { sublog } = require('./prefix-logger/index');
const JobQueueManager = require('./job-queue-manager');

const log = sublog('main');

const createJob = (name, pathToScript, allowRunningDate = null) => {
    const job = new JobModel({
        name,
        pathToScript,
        allowRunningDate,
        dateStart: null,
        dateFinish: null,
        status: 'created',
        logs: [],
        result: ''
    });
    return job.save();
};

// 1) createJob
// 2) JobQueueManager
// 3) jqm.tick()

const main = async () => {
    log('start');
    const jqm = new JobQueueManager(4);
    for (let i = 0; i < 10; i++) {
        await createJob(`My job ${i}`, './workers/job');
    }
    console.log(jqm.queue.length);
    const cron = new CronJob('* * * * * *', function() {
        const time = moment().format('MMMM Do YYYY, HH:mm:ss');
        log(time);
        jqm.tick();
    });

    cron.start();
};

main();
