const fs = require('fs');
const { parentPort } = require('worker_threads');
let stream = null;


const logCreateWriteStream = (pathToFile) => {
    stream = fs.createWriteStream(pathToFile);
};

const logCloseWriteStream = () => {
    stream.close();
};

const sringify = (any) => {
    if (typeof any !== 'string') {
        return JSON.stringify(any);
    }
    return any;
};

const log = (...args) => {
    const message = `${args[0]} ${args.slice(1).reduce((acc, cur) => acc + ' ' + sringify(cur), '')}`;
    console.log(`====${message}`);
    if(stream){
        stream.write(message + '\n');
    }
};

const sublog = (submes) => (...args) => {
    return log(`[${submes}]: `, ...args);
};




module.exports = {
    log,
    sublog,
    logCreateWriteStream,
    logCloseWriteStream
};
