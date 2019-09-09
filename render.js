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

async function render(map) {
    let width = map.reduce((a,b)=>Math.max(a,b.length),0);
    let height = map.length;
    let canvas = new Canvas(32 * width, 32 * height);
    let ctx = canvas.getContext('2d');
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let tile = data.tiles_list[data.tiles_by_name[map[y][x]]-1];
            let sprite = await loadImage(sprites_dir+tile.sprite+".png");
            tctx.globalCompositeOperation = "source-over";
            tctx.fillStyle = palettes.default[tile.color[0]][tile.color[1]];
            tctx.fillRect(0, 0, 32, 32);
            tctx.globalCompositeOperation = "multiply";
            tctx.drawImage(sprite, 0, 0);
            tctx.globalCompositeOperation = "destination-in";
            tctx.drawImage(sprite, 0, 0);
            // other stuff etc
            
            ctx.drawImage(tcanvas, x*32, y*32);
        }
    }
    
    return canvas.createPNGStream();
}

module.exports = render;