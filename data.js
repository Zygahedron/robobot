const {exec} = require('child_process');

const data = {}

exec("lua robobot/data.lua", {cwd: ".."}, (e, stdout, stderr) => {
    if (e) {
        console.error(e);
    } else if (stderr) {
        console.error(stderr);
    } else {
        Object.assign(data, JSON.parse(stdout))
        data.tiles = {};
        data.tiles_list.forEach((tile, i) => {
            data.tiles[tile.name.toLowerCase()] = tile;
            if (tile.name.match(" ")) {
                data.tiles[tile.name.toLowerCase().replace(/ /g,"")] = tile;
                data.tiles[tile.name.toLowerCase().replace(/ /g,"_")] = tile;
            }
            if (tile.name.startsWith("letter_")) {
                data.tiles[tile.name.toLowerCase().replace("letter_","text_")] = tile;
            }
        });
        data.tiles["luv"] = data.tiles["l..uv"];
        data.tiles["text_luv"] = data.tiles["text_l..uv"];
    }
});

module.exports = data;