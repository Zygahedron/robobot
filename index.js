require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const palette_dir = "../bab-be-u/assets/palettes/";

const render = require("./render.js");
const data = require("./data.js");

const FuzzySearch = require("fuzzy-search");

let searcher;

bot.on("ready", ()=>{
    console.log("Ready.");
});

bot.on("message", message=>{
    if (message.content == "-ping") {
        message.reply("pong");
    }
    if (message.content == "-help") {
        message.reply(
`\`\`\`
bab be u
 til
render tils (use text_bab for txt)
 rul
render ruls (use tile_bab for bab)
 ping
pong
 help
u kno wat this dos, u did it to seee this
 palettes
show pallets

how 2 use args:
:left, :gay, :slep, etc (and they stack)
palatttes:
-til palette=marshmallow keek
\`\`\``
        );
    }
    if (message.content == "-palettes") {
        fs.readdir(palette_dir, (err, list)=>{
            if (err) {
                message.reply(err);
            } else {
                message.reply("```\n"+list.map(f=>f.replace(".png","")).join("\n")+"\n```");
            }
        });
    }
    if (message.content.startsWith("-search ")) {
        if (!searcher) searcher = new FuzzySearch(data.tiles_list, ["name"], {sort: true});
        let result = searcher.search(message.content.substr(8));
        if (result.length > 0) {
            let m = "";
            if (result.length > 10) {
                m = "Only the first 10 results are shown. (" + result.length + " total)\n";
                result = result.slice(0, 10);
            }
            message.reply(m+"```\n" + result.map(tile=>tile.name).join("\n") + "\n```");
        } else {
            message.reply("No matches.");
        }
    }
    if (message.content.startsWith("-til ")) {
        let map = message.content.substr(5).split("\n").map(row=>row.split(" "));
        render(map).then(img=>{
            message.reply("", {file: new Discord.Attachment(img, "render.png")});
        }, err=>{
            console.error(err);
            message.reply("An error occured while rendering:" + err);
        });
    }
    if (message.content.startsWith("-rul ")) {
        let map = message.content.substr(5).split("\n").map(row=>row.split(" "));
        render(map, true).then(img=>{
            message.reply("", {file: new Discord.Attachment(img, "render.png")});
        }, err=>{
            console.error(err);
            message.reply("An error occured while rendering:" + err);
        });
    }
});

process.on('SIGINT', () => {
    console.log("Shutting down.");
    bot.destroy();
    process.exit();
});
process.on('SIGTERM', () => {
    console.log("Shutting down.");
    bot.destroy();
    process.exit();
});
process.on("uncaughtException", (err)=>{
    console.error(err);
    bot.destroy();
    process.exit();
});

bot.login();