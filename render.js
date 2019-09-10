const {Canvas, loadImage} = require("canvas");
const fs = require('fs');
const sprites_dir = "../bab-be-u/assets/sprites/";

let tcanvas = new Canvas(32, 32);
let tctx = tcanvas.getContext('2d');

const data = require("./data.js");

const palettes = {}
const palette_dir = "../bab-be-u/assets/palettes/"
fs.readdir(palette_dir, (err, files)=>{
    files.forEach(f=>{
        let p = f.substr(0, f.length-4);
        loadImage(palette_dir+f).then(img=>{
            tctx.drawImage(img, 0, 0);
            palettes[p] = [[],[],[],[],[],[],[]];
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < 5; j++) {
                    let imagedata = tctx.getImageData(i,j,1,1)
                    palettes[p][i][j] = "#"+[...imagedata.data].map(n=>{
                        let str = "0"+n.toString(16);
                        return str.substr(str.length-2, str.length);
                    }).join('').substr(0,6);
                }
            }
        });
    });
});

async function render(map, is_rul) {
    let palette = "default";
    if (map[0][0].startsWith("palette=")) {
        palette = map[0].shift().substr("palette=".length);
        if (!palettes[palette]) palette = "default";
    }
    let width = map.reduce((a,b)=>Math.max(a,b.length),0);
    let height = map.length;
    let canvas = new Canvas(32*width + 16, 32*height + 16);
    let ctx = canvas.getContext('2d');
    ctx.translate(8, 8);
    ctx.imageSmoothingEnabled = false
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (!map[y][x]) continue;
            let stack = map[y][x].split("+");
            for (let i = 0; i < stack.length; i++) {
                if (!stack[i]) continue;
                let args = stack[i].split(":");
                let name = args.shift();
                if (is_rul) name = "text_" + name;
                if (name.startsWith("text_tile_")) name = name.substr(10);
                let mods = {dir: 0};
                args.forEach(arg=>{
                    switch (arg) {
                        case "right":
                        case "r":
                            mods.dir = 0;
                            break;
                        case "downright":
                        case "dr":
                            mods.dir = Math.PI/4;
                            break;
                        case "down":
                        case "d":
                            mods.dir = Math.PI/2;
                            break;
                        case "downleft":
                        case "dl":
                            mods.dir = Math.PI*3/4;
                            break;
                        case "left":
                        case "l":
                            mods.dir = Math.PI;
                            break;
                        case "upleft":
                        case "ul":
                            mods.dir = Math.PI*5/4;
                            break;
                        case "up":
                        case "u":
                            mods.dir = Math.PI*3/2;
                            break;
                        case "upright":
                        case "ur":
                            mods.dir = Math.PI*7/4;
                            break;
                        case "tranz":
                            mods.overlay = "trans"; // why is this different
                            break;
                        case "gay":
                        case "enby":
                            mods.overlay = arg;
                            break;
                        case "meta":
                            mods.meta = 1;
                            break
                        default:
                            if (arg in data.colors) {
                                mods.color = data.colors[arg];
                            } else if (arg.match(/^[0-6],[0-4]$/)) {
                                mods.color = arg.split(",");
                            } else if (arg.match(/^meta_\d+$/)) {
                                mods.meta = +arg.substr(5);
                            } else {
                                // throw error here
                            }
                    }
                });
                let tile = data.tiles_list[data.tiles_by_name[name]-1];
                while (!tile && name.startsWith("text_")) {
                    name = name.substr(5);
                    tile = data.tiles_list[data.tiles_by_name[name]-1];
                    mods.meta = (mods.meta || 0) + 1;
                }
                if (!tile) continue;
                let sprite
                if (mods.meta && tile.metasprite) {
                    sprite = await loadImage(sprites_dir+tile.metasprite+".png");
                } else {
                    sprite = await loadImage(sprites_dir+tile.sprite+".png");
                }
                tcanvas.width = sprite.width;
                tcanvas.height = sprite.height;
                
                tctx.globalCompositeOperation = "source-over"; // color
                if (mods.overlay) {
                    tctx.drawImage(await loadImage(sprites_dir+"overlay/"+mods.overlay+".png"), 0, 0)
                } else {
                    tctx.fillStyle = palettes[palette][(mods.color || tile.color)[0]][(mods.color || tile.color)[1]];
                    tctx.fillRect(0, 0, sprite.width, sprite.height);
                }
                
                tctx.globalCompositeOperation = "multiply"; // brightness
                tctx.drawImage(sprite, 0, 0);
                tctx.globalCompositeOperation = "destination-in"; // transparency
                tctx.drawImage(sprite, 0, 0);
                // other stuff etc
                
                ctx.translate(x*32+sprite.width/2, y*32+sprite.height/2);
                ctx.rotate(mods.dir);
                ctx.drawImage(tcanvas, -sprite.width/2, -sprite.height/2);
                ctx.rotate(-mods.dir);
                ctx.translate(-x*32-sprite.width/2, -y*32-sprite.height/2);
                
                if (mods.meta) {
                    let metasprite_name = "meta1.png";
                    if (mods.meta == 2) metasprite_name = "meta2.png";
                    let metasprite = await loadImage(sprites_dir+metasprite_name)
                    tcanvas.width = 32;
                    tcanvas.height = 32;
                    tctx.globalCompositeOperation = "source-over";
                    tctx.fillStyle = palettes[palette][4][1];
                    tctx.fillRect(0, 0, sprite.width, sprite.height);
                    tctx.globalCompositeOperation = "multiply"; // brightness
                    tctx.drawImage(metasprite, 0, 0);
                    tctx.globalCompositeOperation = "destination-in"; // transparency
                    tctx.drawImage(metasprite, 0, 0);
                    
                    ctx.drawImage(tcanvas, x*32, y*32);
                    
                    if (mods.meta > 2) {
                        ctx.fillStyle = palettes[palette][4][1];
                        ctx.font = "10px Arial";
                        ctx.fillText(""+mods.meta, 28, 34);
                    }
                }
            }
        }
    }
    
    return canvas.createPNGStream();
}

module.exports = render;