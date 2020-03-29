const JobModel = require('./mongo/job');
const Job = require('./job');
const action = require('./action-decorator');

class JobQueueManager {
    constructor(limit) {
        this.queueLimit = limit;
        this.queue = [];
    }

    async getJobsForQueue (limit) {
        const mongoDocs = await JobModel.find({
            status: 'created',
            $or: [
                { allowRunningDate: null},
                { allowRunningDate: { $gte: Date.now() }}
            ],
        }).limit(limit);

        return mongoDocs.map((mongoDoc) => new Job(mongoDoc));
    }

    getQueueStatus() {
        const runningsJobs = this.queue.filter(job => job.status === 'starting' || job.status === 'progress');
        let countEmptyCellsInQueue = this.queueLimit - this.queue.length;
        return {
            length: this.queue.length,
            limit: this.queueLimit,
            countEmptyCellsInQueue,
            runningsJobs: runningsJobs.length, // starting || progress
            inCreated: this.queue.filter(job => job.status === 'created').length,
            inStarting: this.queue.filter(job => job.status === 'starting').length,
            inProgress: this.queue.filter(job => job.status === 'progress').length,
            inFinish: this.queue.filter(job => job.status === 'finish').length
        }
    }

    clearQueue() {
        this.queue = this.queue.filter(job => job.status !== 'finish');
    }

    async update() {
        return action(async ({ log }) => {
            log('queue status', this.getQueueStatus());
            this.clearQueue();
            const queueStatus = this.getQueueStatus();
            log('queue status after clear', queueStatus);
            let { countEmptyCellsInQueue } =  queueStatus;
            if (countEmptyCellsInQueue > 0) {
                // detect jobs count
                const createdJobs = await this.getJobsForQueue(countEmptyCellsInQueue);
                log('created but not running jobs', createdJobs.length);
                const countJobsForRunning = countEmptyCellsInQueue > createdJobs.length
                    ? createdJobs.length
                    : countEmptyCellsInQueue;
                log(`now will add ${countJobsForRunning} jobs`);
                // pushing jobs
                for (let i = 0; i < countJobsForRunning; i++) {
                    this.queue.push(createdJobs[i]);
                }
            }
            return this.getQueueStatus();
        }, `JQM update`)();
    }

    async runner() {
        return action(async () => {
            const runningTasks = this.queue.filter(job => job.status === 'created');
            return Promise.all(runningTasks.map(job => job.start()));
        }, 'JQM runner')();
    }

    async tick() {
        return action(async ({ log }) => {
            const queueStatus = await this.update();
            log('queue status after update', queueStatus);
            const runnerResult = await this.runner();
            log(`finished runned ${runnerResult.length} jobs`);
        }, 'JQM tick')()
    }
}

module.exports = JobQueueManager;
