const {exec} = require('child_process');

const data = {}

exec("lua robobot/data.lua", {cwd: ".."}, (e, stdout, stderr) => {
    if (e) {
        console.error(e);
    } else if (stderr) {
        console.error(stderr);
    } else {
        Object.assign(data, JSON.parse(stdout))
        data.tiles_list[data.tiles_by_name["text_gay"]].sprite = "text_gay-colored";
        data.tiles_list[data.tiles_by_name["text_tranz"]].sprite = "text_tranz-colored";
        data.tiles_list[data.tiles_by_name["text_enby"]].sprite = "text_enby-colored";
    }
});

module.exports = data;