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
        });
        data.tiles.luv = data.tiles["l..uv"];
        data.tiles["\\:o"] = data.tiles[":o"];
        data.tiles[":o\\"] = data.tiles[":o"];
    }
});

module.exports = data;