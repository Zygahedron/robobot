const {exec} = require('child_process');

const data = {}

exec("lua robobot/data.lua", {cwd: ".."}, (e, stdout, stderr) => {
    if (e) {
        console.error(e);
    } else if (stderr) {
        console.error(stderr);
    } else {
        Object.assign(data, JSON.parse(stdout))
    }
});

module.exports = data;