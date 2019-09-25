const {exec} = require('child_process');

const data = require("./data-base");

exec("lua robobot/data.lua", {cwd: ".."}, (e, stdout, stderr) => {
    if (e) {
        console.error(e);
    } else if (stderr) {
        console.error(stderr);
    } else {
        Object.assign(data, JSON.parse(stdout))
        data.tiles = {};
        data.tiles_list.forEach((tile, i) => {
            let names = [tile.name.toLowerCase()];
            if (tile.name.match(" ")) {
                names.push(names[0].replace(/ /g,""));
                names.push(names[0].replace(/ /g,"_"));
            }
            names.forEach(name=>{
                data.tiles[name] = tile;
                if (name.startsWith("letter_") && name != "letter_o" && name != "letter_u" && name != "letter_go") {
                    data.tiles[name.replace("letter_","text_")] = tile;
                    data.tiles[name.replace("letter_","txt_")] = tile;
                }
                if (name.startsWith("text_")) {
                    data.tiles[name.replace("text_","txt_")] = tile;
                }
            });
        });
        data.tiles["luv"] = data.tiles["l..uv"];
        data.tiles["text_luv"] = data.tiles["text_l..uv"];
        data.tiles["text_txt"] = data.tiles["text_text"];
        data.tiles["text_:"] = data.tiles["letter_colon"];
        data.tiles["letter_:"] = data.tiles["letter_colon"];
        data.tiles["text_("] = data.tiles["letter_parenthesis"];
        data.tiles["letter_("] = data.tiles["letter_parenthesis"];
        data.tiles["text_)"] = data.tiles["letter_parenthesis"];
        data.tiles["letter_)"] = data.tiles["letter_parenthesis"];
        data.tiles["text_infloop"] = data.tiles["text_loop"];
        data.tiles["text_nt"] = data.tiles["text_n't"];
    }
});

module.exports = data;