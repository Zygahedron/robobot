const {Canvas, loadImage} = require("canvas");
const fs = require('fs');
const sprites_dir = "../bab-be-u/assets/sprites/";
let wat_sprite;
loadImage(sprites_dir+"wat.png").then(s => wat_sprite = s);

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

async function loadSprite(sprite) {
    try {
        return await loadImage(sprite);
    } catch (e) {
        return wat_sprite;
    }
}

function setColor(color) {
    if (color.length == 2) {
        tctx.fillStyle = palettes[palette][color[0]][color[1]];
    } else {
        tctx.fillStyle = "#"+color.map(n=>{
            let str = "0"+n.toString(16);
            return str.substr(str.length-2, str.length);
        }).join('');
    }
}

function drawSprite(sprite, x, y, dir = 0, colored = true, overlay) {
    if (colored) {
        tcanvas.width = sprite.width;
        tcanvas.height = sprite.height;
        
        tctx.globalCompositeOperation = "source-over"; // color
        if (overlay) {
            tctx.drawImage(overlay, 0, 0)
        } else {
            tctx.fillRect(0, 0, sprite.width, sprite.height);
        }
        tctx.globalCompositeOperation = "multiply"; // brightness
        tctx.drawImage(sprite, 0, 0);
        tctx.globalCompositeOperation = "destination-in"; // transparency
        tctx.drawImage(sprite, 0, 0);
    }
    
    ctx.translate(x*32+16, y*32+16);
    ctx.rotate(dir);
    ctx.drawImage(colored ? tcanvas : sprite, -sprite.width/2, -sprite.height/2);
    ctx.rotate(-dir);
    ctx.translate(-x*32-16, -y*32-16);
}

async function drawTile(name, args) {
    if (name == "" || name == "text_" || name == "txt_" || name == "letter_") name += ":" + args.shift();
    if (is_rul) name = "text_" + name;
    if (name.startsWith("text_tile_")) name = name.substr(10);
    if (name.startsWith("text_til_")) name = name.substr(9);
    if (name.startsWith("txt_tile_")) name = name.substr(9);
    if (name.startsWith("txt_til_")) name = name.substr(8);
    if (name.startsWith("text_letter_")) name = name.substr(5);
    if (name.startsWith("txt_letter_")) name = name.substr(4);
    let mods = {dir: 0};
    args.forEach((arg, i)=>{
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
                break;
            case "nt":
            case "n't":
                mods.nt = true;
                break;
            case "slep":
            case "sleep":
                mods.sleep = true;
                break;
            case "windows":
            case "windous":
                mods.os = "windous";
                break;
            case "mac":
            case "mak":
                mods.os = "mak";
                break;
            case "linux":
            case "linx":
                mods.os = "linx";
                break;
            case "android":
            case "androd":
                mods.os = "androd";
                break;
            case "hidden":
                mods.hidden = true;
                break;
            case "gate":
                mods.gate = true;
                break;
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
    if (name == ")") mods.dir = (mods.dir || 0) + Math.PI;
    let tile = data.tiles[name];
    while (!tile && name.startsWith("text_") && name != "text_this") {
        name = name.substr(5);
        tile = data.tiles[name];
        mods.meta = (mods.meta || 0) + 1;
    }
    if (name == "gate") {
        name = "lin";
        mods.gate = true;
        tile = data.tiles[name];
    }
    if (name == "text_this") name = "this";
    if (!tile) return;
    if (mods.nt && data.tiles[name+"n't"]) {
        mods.nt = false;
        name += "n't";
        tile = data.tiles[name];
    }
    let sprites, colors, colored;
    if (Array.isArray(tile.sprite)) {
        sprites = tile.sprite;
        colors = tile.color;
        colored = tile.colored;
    } else {
        sprites = [tile.sprite];
        colors = [tile.color];
        colored = [true];
    }
    for (let j = 0; j < sprites.length; j++) {
        let spritename;
        if (mods.meta && tile.metasprite) {
            spritename = tile.metasprite // this won't work if there's multiple metasprites, but I don't think anything does that
        } else if (tile.name == "os" && mods.os) {
            spritename = "os_" + mods.os;
        } else {
            spritename = sprites[j]
        }
        if (tile.name == "lin" && mods.gate) {
            spritename += "_gate";
            colors[j] = [2,2];
        }
        if ((tile.name == "lin" || tile.name == "lvl") && mods.hidden) {
            spritename += "_hidden";
        }
        if (mods.sleep && tile.slep) {
            spritename += "_slep";
        }
        
        let sprite = await loadSprite(sprites_dir + spritename + ".png");
        let color;
        if (colored[j]) color = mods.color || colors[j];
        else color = colors[j];
        
        setColor(color);
        drawSprite(sprite, x, y, mods.dir, colored[j], mods.overlay)
    }
    
    if (mods.nt) {
        setColor([2,2]);
        drawSprite(await loadSprite(sprites_dir+"n't.png"), x, y);
    }
    if (mods.meta) {
        setColor([4,1]);
        drawSprite(await loadSprite(sprites_dir+`meta${mods.meta == 2 ? 2 : 1}.png`), x, y)
        
        if (mods.meta > 2) {
            ctx.fillStyle = tctx.fillStyle;
            ctx.font = "10px Arial";
            ctx.fillText(""+mods.meta, x*32 + 28, y*32 + 34);
        }
    }
}

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
                let args = stack[i].toLowerCase().split(":");
                let name = args.shift();
                await drawTile(name, args);
            }
        }
    }
    
    return canvas.createPNGStream();
}

module.exports = render;