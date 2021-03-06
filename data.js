const {exec} = require('child_process');
const fs = require('fs');

const data = require("./data-base");

data.tiles = {};
data.tiles_list = []; // tile array for searching
data.overlays = {}; // pride flags and stuff

// this looks awful but idk javascript so
function loadDirectory(dir) {
    fs.readdir(dir, function(e, files) {
        if (e) {
            console.error(e);
        } else {
            files.forEach(function (file) {
                fs.stat(dir + file, function(e, stats) {
                    if (e) {
                        console.error(e);
                    } else {
                        if (stats.isDirectory()) {
                            loadDirectory(dir + file + "/");
                        } else if (file.endsWith(".json")) {
                            fs.readFile(dir + file, function(e, data) {
                                if (e) {
                                    console.error(e);
                                } else {
                                    loadTiles(JSON.parse(data));
                                }
                            });
                        }
                    }
                });
            });
        }
    })
}

let aliases = {};
aliases["l..uv"] = ["luv"];
aliases["txt_l..uv"] = ["txt_luv"];
aliases["letter_colon"] = ["txt_:", "letter_:"];
aliases["letter_parenthesis"] = ["txt_(", "letter_(", "txt_)", "letter_)"];
aliases["txt_loop"] = ["txt_infloop"];
aliases["loop"] = ["infloop"];
aliases["txt_nt"] = ["txt_n't"];
aliases["this"] = ["txt_this"];
aliases["txt_themself"] = ["txt_herself", "txt_itself", "txt_xemself", "txt_himself", "txt_hirself", "txt_themselves"];
aliases["txt_wont"] = ["txt_won't"];
aliases["txt_wontn't"] = ["txt_wo"];

function loadTiles(tiles_list) {
    tiles_list.forEach((tile, i) => {
        data.tiles_list.push(tile);
        let names = [tile.name.toLowerCase()];
        if (tile.name.match(" ")) {
            console.log("Found space in: "+tile.name);
            names.push(names[0].replace(/ /g,""));
            names.push(names[0].replace(/ /g,"_"));
        }
        names.forEach(name=>{
            data.tiles[name] = tile;
            if (name.startsWith("letter_") && !data.tiles[name.replace("letter_","txt_")]) {
                data.tiles[name.replace("letter_","text_")] = tile;
                data.tiles[name.replace("letter_","txt_")] = tile;
            }
            if (name.startsWith("txt_")) {
                data.tiles[name.replace("txt_","text_")] = tile;
                if (tile.overlay) {
                    data.overlays[name.substr(4)] = tile.overlay.sprite;
                    data.overlays[tile.overlay.sprite] = tile.overlay.sprite;
                }
            }
            if (name in aliases) {
                aliases[name].forEach(alias=>{
                    data.tiles[alias] = tile;
                    if (alias.startsWith("txt_")) {
                        data.tiles[alias.replace("txt_","text_")] = tile;
                    }
                });
            }
        });
    });
}

loadDirectory("../bab-be-u/assets/tiles/");

module.exports = data;