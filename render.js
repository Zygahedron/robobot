const {Canvas, loadImage} = require("canvas");
const GifEncoder = require ('gif-encoder');
const fs = require('fs');
const sprites_dir = "../bab-be-u/assets/sprites/";
const sprites_cache = [];
let wat_sprite;
loadImage(sprites_dir+"wat.png").then(s => wat_sprite = s);

let tcanvas = new Canvas(32, 32);
let tctx = tcanvas.getContext('2d');
let ctx, gif;

const data = require("./data.js");

const ditto = require("./ditto.js");

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
let palette

async function loadSprite(sprite) {
    try {
        return sprites_cache[sprite] || (sprites_cache[sprite] = await loadImage(sprites_dir+sprite+".png"));
    } catch (e) {
        return wat_sprite;
    }
}

function simplifyName(name, args) {
    name = name.replace(/\\/g,"");
    name = name.replace(/🙂/g,":)");
    name = name.replace(/⭕/g,":o:");
    if (name == "" || name == "text_" || name == "txt_" || name == "letter_") name += ":" + args.shift();
    if (name.startsWith("text_tile_")) name = name.substr(10);
    if (name.startsWith("text_til_")) name = name.substr(9);
    if (name.startsWith("txt_tile_")) name = name.substr(9);
    if (name.startsWith("txt_til_")) name = name.substr(8);
    if (name.startsWith("text_letter_")) name = name.substr(5);
    if (name.startsWith("txt_letter_")) name = name.substr(4);

    let nt = false;
    let meta = 0;
    let poortoll = false;

    if (name.match(/^[^()]+\(.*\)$/)) { // foo(bar)
        let match = name.match(/^([^()]+)\((.*)\)$/);
        name = match[1];
        poortoll = match[2];
    }

    let tile = data.tiles[name];
    while (!tile) {
        if (name.endsWith("n't") && data.tiles[name.substr(0, name.length-3)]) {
            name = name.substr(0, name.length-3);
            tile = data.tiles[name];
            nt = !nt;
            continue;
        }
        if (name.startsWith("txt_") && name != "txt_this") {
            name = name.substr(4);
            tile = data.tiles[name];
            meta += 1;
            continue;
        }
        break;
    }
    if(!tile) return;

    return {"name": name, "nt": nt, "meta": meta, "poortoll": poortoll};
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

function drawSprite(sprite, x, y, dir = 0, painted = true, overlay, mask, maskdir = 0, offset_x = 0, offset_y = 0, width, height) {
    width = width || sprite.width;
    height = height || sprite.height;

    let color = tctx.fillStyle;
    tcanvas.width = width + height;
    tcanvas.height = width + height;
    tctx.fillStyle = color;
    tctx.imageSmoothingEnabled = false
    
    tctx.translate(tcanvas.width/2, tcanvas.height/2);
    tctx.rotate(dir);
    tctx.translate(-width/2 + offset_x, -height/2 + offset_y);
    tctx.globalCompositeOperation = "source-over"; // color
    if (painted && overlay) {
        tctx.drawImage(overlay, 0, 0)
    } else {
        tctx.fillRect(0, 0, sprite.width, sprite.height);
    }
    tctx.globalCompositeOperation = "multiply"; // brightness
    tctx.drawImage(sprite, 0, 0);
    tctx.globalCompositeOperation = "destination-in"; // transparency
    tctx.drawImage(sprite, 0, 0);
    
    if (mask) {
        tctx.translate(-offset_x + width/2, -offset_y + height/2);
        tctx.rotate(maskdir-dir);
        tctx.translate(-mask.width/2, -mask.height/2);
        tctx.globalCompositeOperation = "destination-in"; // transparency
        tctx.drawImage(mask, 0, 0);
    }
    tctx.setTransform(0,0,0,0,0,0);
    
    ctx.drawImage(tcanvas, x*32+16-tcanvas.width/2, y*32+16-tcanvas.height/2);
}

async function drawTile(name, meta, nt, poortoll, args, x, y, is_rul, frame, mask, maskdir) {
    let mods = {};
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
            case "meta":
                meta = meta + 1;
                break;
            case "meta_infinity":
            case "metainfinity":
            case "infinity":
                meta = Infinity;
                break;
            case "nt":
            case "n't":
                nt = !nt;
                break;
            case "slep":
            case "sleep":
                mods.sleep = true;
                break;
            case "shy":
            case "shy...":
                mods.shy = true;
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
            case "bowie":
                mods.bowie = true;
                break;
            case "sans":
                mods.sans = true;
                break;
            default:
                if (arg in data.colors) {
                    mods.color = data.colors[arg];
                } else if (arg.match(/^[0-6],[0-4]$/)) {
                    mods.color = arg.split(",");
                } else if (arg.match(/^meta_?\d+$/)) {
                    meta = meta + Number(arg.replace(/meta_?/,""));
                } else if (arg in data.features) {
                    mods.equip = mods.equip || [];
                    mods.equip.push(arg);
                } else if (arg in data.overlays) {
                    mods.overlay = data.overlays[arg];
                } else {
                    // throw error here
                }
        }
        if (name == "ditto" && ditto[arg]) {
            mods.ditto = ditto[arg];
        }
    });
    if (mods.dir == undefined) {
        if (name == "txt_)" || name == "text_)" || name == "letter_)") {
            mods.dir = Math.PI;
        } else {
            mods.dir = 0;
        }
    }
    let tile = data.tiles[name];
    if (name == "gate") {
        name = "lin";
        mods.gate = true;
        tile = data.tiles[name];
    }
    if (!tile) return;
    if (nt && data.tiles[name+"n't"]) {
        nt = false;
        name = name + "n't";
        tile = data.tiles[name];
    } else if (nt && name.endsWith("n't") && data.tiles[name.substr(0,name.length-3)]) {
        nt = false;
        name = name.substr(0,name.length-3);
        tile = data.tiles[name];
    }
    if (tile.wobble) {
        gif = true;
    }
    
    if (poortoll && tile.portal) {
        ctx.globalCompositeOperation = "destination-out";
        let mask = await loadSprite(tile.sprite+"_mask")
        ctx.translate(x*32+16, y*32+16);
        ctx.rotate(mods.dir);
        ctx.drawImage(mask, -mask.width/2, -mask.height/2);
        ctx.rotate(-mods.dir);
        ctx.translate(-x*32-16, -y*32-16);
        ctx.globalCompositeOperation = "source-over";
        let stack = poortoll.split("+");
        for (let i = 0; i < stack.length; i++) {
            if (!stack[i]) continue;
            let args = stack[i].toLowerCase().split(":");
            let name = args.shift();
            if (is_rul) name = "txt_" + name;
            let info = simplifyName(name, args);
            if (info) {
                await drawTile(info.name, info.meta, info.nt, info.poortoll, args, x, y, is_rul, frame+i, mask, mods.dir);
            }
        }
    }
    
    let sprites = tile.sprite;
    let colors = tile.color;
    let painted = tile.painted || [true];

    if (mods.bowie) {
        let feature_x, feature_y = 0;
        if (tile.features && tile.features["bowie"]) {
            feature_x = tile.features["bowie"].x || 0;
            feature_y = tile.features["bowie"].y || 0;
        }
        setColor([2,2]);
        drawSprite(await loadSprite("bowie_smol"), x, y, mods.dir, false, null, mask, maskdir, feature_x, feature_y, 32, 32);
    }
    
    if (mods.shy && tile.name == "boooo") {
        sprites = ["boooo_shy","boooo_mouth_shy","boooo_blush"];
    }
    
    for (let j = 0; j < sprites.length; j++) {
        let spritename = sprites[j];
        if (meta > 0 && tile.metasprite) {
            spritename = tile.metasprite // this won't work if there's multiple metasprites, but I don't think anything does that
        } else if (tile.name == "os" && mods.os) {
            spritename = "os_" + mods.os;
        }
        if (spritename == "txt/themself") {
            if (name.startsWith("txt_her") || name.startsWith("text_her")) spritename = "txt/herself";
            if (name.startsWith("txt_it") || name.startsWith("text_it")) spritename = "txt/itself";
            if (name.startsWith("txt_xem") || name.startsWith("text_xem")) spritename = "txt/xemself";
            if (name.startsWith("txt_him") || name.startsWith("text_him")) spritename = "txt/himself";
            if (name.startsWith("txt_hir") || name.startsWith("text_hir")) spritename = "txt/hirself";
        }
        if (spritename == "txt/themself_lower" && name.endsWith("selves")) {
            spritename = "txt/themselves_lower";
        }
        if (tile.name == "lin" && mods.gate) {
            spritename += "_gate";
            colors[j] = [2,2];
        }
        if ((tile.name == "lin" || tile.name == "lvl") && mods.hidden) {
            spritename += "_hidden";
        }
        if (mods.sleep && await loadSprite(spritename+"_slep") != wat_sprite) {
            spritename += "_slep";
        }
        if (tile.name == "ditto" && mods.ditto) {
            spritename = "ditto_"+mods.ditto;
        }
        if (tile.wobble) {
            let suffix = ((frame%3)+1);
            if (mods.sleep && await loadSprite(spritename+"_slep_"+suffix) != wat_sprite) {
                spritename += "_slep";
            }
            spritename += "_"+suffix;
        }
        
        let sprite = await loadSprite(spritename);
        let color;
        if (painted[j]) color = mods.color || colors[j];
        else color = colors[j];
        if (mods.overlay) mods.overlay = await loadSprite("overlay/"+mods.overlay);
        
        setColor(color);
        drawSprite(sprite, x, y, mods.dir, painted[j], mods.overlay, mask, maskdir)
    }
    
    if (mods.equip) {
        for (i in mods.equip) {
            let feature = data.features[mods.equip[i]];
            let feature_x = feature.offset[0]*32;
            let feature_y = feature.offset[1]*32;
            if (tile.features && tile.features[mods.equip[i]]) {
                feature_x += tile.features[mods.equip[i]].x || 0;
                feature_y += tile.features[mods.equip[i]].y || 0;
            }
            for (let i = 0; i < feature.sprite.length; i++) {
                let sprite = await loadSprite(feature.sprite[i]);
                if (feature.painted[i]) {
                    setColor(mods.color || colors[0]);
                } else {
                    setColor(feature.color[i]);
                }
                drawSprite(sprite, x, y, mods.dir, false, null, mask, maskdir, feature_x, feature_y, 32, 32);
            }
        }
    }

    if (mods.sans && !mods.sleep && tile.features && tile.features["sans"]) {
        ctx.save();
        ctx.translate(x*32+16, y*32+16);
        ctx.rotate(mods.dir);
        ctx.translate(-16, -16);
    
        ctx.fillStyle = palettes[palette][1][4];
        ctx.fillRect(tile.features["sans"].x, tile.features["sans"].y, tile.features["sans"].w, tile.features["sans"].h);
        for (let i = 1; i < tile.features["sans"].w; i++) {
            ctx.fillRect(tile.features["sans"].x + i, tile.features["sans"].y - i, tile.features["sans"].w - i, 1);
        }
    
        ctx.restore();
    }
    
    if (nt) {
        setColor([2,2]);
        drawSprite(await loadSprite("n't"), x, y);
    }
    if (meta > 0) {
        setColor([4,1]);
        drawSprite(await loadSprite("meta" + (meta == 2 ? 2 : 1)), x, y)
        
        if (meta > 2) {
            ctx.fillStyle = tctx.fillStyle;
            ctx.font = "10px Arial";
            ctx.fillText(meta, x*32 + 28, y*32 + 34);
        }
    }
}

async function render(map, is_rul) {
    palette = "default";
    let bg = false;
    let check_args = true;
    while (check_args) {
        if (map[0][0].startsWith("palette=")) {
            palette = map[0].shift().substr("palette=".length);
            if (!palettes[palette]) palette = "default";
        } else if (map[0][0].startsWith("background=")) {
            bg = map[0].shift() == "background=true";
        } else if (map[0][0] == "-b" || map[0][0] == "-bg") {
            map[0].shift();
            bg = true;
        } else {
            check_args = false;
        }
        if (map[0][0] == undefined) {
            throw "No tiles specified"; 
        }
    }
    let width = map.reduce((a,b)=>Math.max(a,b.length),0);
    let height = map.length;
    let canvas = new Canvas(32*width + 16, 32*height + 16);
    ctx = canvas.getContext('2d');
    ctx.translate(8, 8);
    ctx.imageSmoothingEnabled = false

    // just making another canvas here bc portal effects cut into the bg otherwise
    let bg_canvas = new Canvas(canvas.width, canvas.height);
    let bg_ctx = bg_canvas.getContext('2d');
    bg_ctx.imageSmoothingEnabled = false

    gif = false;
    let encoder = new GifEncoder(canvas.width, canvas.height);
    encoder.setRepeat(0);
    encoder.setDelay(180);
    encoder.setQuality(10);
    if (!bg) {
        // arbitrary transparent color hopefullly nothing uses this
        encoder.setTransparent(0xFF0BFF);
    }

    for (let frame = 0; frame < 3; frame++) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (!map[y][x]) continue;
                let stack = map[y][x].split(/\+(?!(?:[^()]|\:[()])*\))/); // "+" not in parentheses
                for (let i = 0; i < stack.length; i++) {
                    if (!stack[i]) continue;
                    let wobble_frame = (y * height) + x + i + frame;
                    let args = stack[i].split(/\:(?!(?:[^()]|\:[()])*\))/); // ":" not in parentheses
                    let name = args.shift();
                    if (is_rul) name = "txt_" + name;
                    let info = simplifyName(name, args);
                    if (info) {
                        await drawTile(info.name, info.meta, info.nt, info.poortoll, args, x, y, is_rul, wobble_frame);
                    }
                }
            }
        }
        if (!gif) break;
        
        if (frame == 0) {
            encoder.writeHeader();
        }

        if (bg) {
            bg_ctx.fillStyle = palettes[palette][0][4];
        } else {
            bg_ctx.fillStyle = "#FF0BFF";
        }
        bg_ctx.fillRect(0, 0, bg_canvas.width, bg_canvas.height);
        bg_ctx.drawImage(canvas, 0, 0);
        encoder.addFrame(bg_ctx.getImageData(0, 0, bg_canvas.width, bg_canvas.height).data);
        ctx.clearRect(-8, -8, canvas.width, canvas.height);
    }
    
    if (gif) {
        encoder.finish();
        return {"stream": encoder, "type": "gif"};
    } else if (bg) {
        bg_ctx.fillStyle = palettes[palette][0][4];
        bg_ctx.fillRect(0, 0, bg_canvas.width, bg_canvas.height);
        bg_ctx.drawImage(canvas, 0, 0);
        return {"stream": bg_canvas.createPNGStream(), "type": "png"};
    } else {
        return {"stream": canvas.createPNGStream(), "type": "png"};
    }
}

module.exports = render;