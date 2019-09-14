require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');

const render = require("./render.js")

bot.on("ready", ()=>{
    console.log("Ready.")
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

    args
:left, :gay, :slep, etc (and they stack)
\`\`\``
        )
    }
    if (message.content.startsWith("-til ")) {
        let map = message.content.substr(5).split("\n").map(row=>row.split(" "));
        render(map).then(img=>{
            message.reply("", {file: new Discord.Attachment(img, "render.png")})
        }, err=>{
            console.error(err);
            message.reply("An error occured while rendering:" + err);
        });
    }
    if (message.content.startsWith("-rul ")) {
        let map = message.content.substr(5).split("\n").map(row=>row.split(" "));
        render(map, true).then(img=>{
            message.reply("", {file: new Discord.Attachment(img, "render.png")})
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