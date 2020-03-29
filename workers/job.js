const { expose } = require('threads/worker');
const { workerData } = require('worker_threads');
const { sublog } = require('../prefix-logger/index');

const log = sublog(`worker (${workerData.name}) start`);

const sleep = () => new Promise((res) => {
    setTimeout(() => {
        res('ura!!');
    }, 3000);
});

const jobWork = async () => {
    const result = await sleep();
    return result;
};

expose(jobWork);
