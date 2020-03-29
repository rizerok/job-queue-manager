const { sublog } = require('../prefix-logger');

const action = (actionFn, name) => async (...args) => {
    const t0 = new Date().getTime();
    const log = sublog(name);
    log('----====start====----');

    const result = await actionFn({
        args,
        log
    });

    const t1 = new Date().getTime();
    log(`----====finish, time - ${(t1 - t0) / 1000}s====---`);
    return result;
};

module.exports = action;
