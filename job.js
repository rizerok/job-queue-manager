const { spawn, Thread, Worker } = require('threads');
const action = require('./action-decorator');

class Job {
    constructor(mongoDoc) {
        this.mongoDoc = mongoDoc;
    }

    get status () { // created -> starting -> progress -> finish
        return this.mongoDoc.status;
    }

    get allowRunningDate() {
        return this.mongoDoc.allowRunningDate;
    }

    async start() {
        action(async ({ log }) => {
            const t0 = new Date().getTime();
            this.mongoDoc.dateStart = Date.now();
            this.mongoDoc.status = 'starting';
            this.mongoDoc.save();

            this.thread = await spawn(new Worker(this.mongoDoc.pathToScript, {
                workerData: { name: this.mongoDoc.name }
            }));
            this.mongoDoc.status = 'progress';
            await this.mongoDoc.save();

            const result = await this.thread();

            this.mongoDoc.status = 'finish';
            this.mongoDoc.result = JSON.stringify(result);
            this.mongoDoc.dateFinish = Date.now();
            const t1 = new Date().getTime();
            this.mongoDoc.runningTime = (t1 - t0) / 1000;
            await this.mongoDoc.save();

            await this.terminate();
        }, this.mongoDoc.name)();
    }

    async terminate() {
        await Thread.terminate(this.thread);
    }
}

module.exports = Job;
