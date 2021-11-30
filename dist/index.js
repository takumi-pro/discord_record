"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var dotenv_1 = __importDefault(require("dotenv"));
var fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
var Discord = require('discord.js');
var client = new Discord.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES] });
if (!process.env.TOKEN) {
    console.error("Make sure there is token in .env file.");
    process.exit(1);
}
function createNewChunk() {
    var pathToFile = __dirname + "/../recordings/".concat(Date.now(), ".pcm");
    return fs_1.default.createWriteStream(pathToFile);
}
;
client.on('voiceStateUpdate', function (oldState, newState) {
    var voiceState = newState.channel || oldState.channel;
    if (!voiceState || voiceState.name !== process.argv[2])
        return;
    // bot参加
    userJoinAndRecordChannel(newState, oldState, client);
    // bot退出
    userLeaveChannel(oldState, newState, client);
});
function userJoinAndRecordChannel(voiceState, oldState, client) {
    if (!voiceState.channel || !voiceState.channel.members || !voiceState.channel.members.size || voiceState.channel.type !== 'voice')
        return;
    var voiceMemberSize = voiceState.channel.members.size;
    // チャンネル参加人数が1以上で参加（bot含める）
    if (voiceMemberSize > 0 && oldState.channelID !== voiceState.channelID) {
        var joinPromise = voiceState.channel.join();
        //参加人数が3人以上で録音開始（bot含める）
        if (voiceMemberSize > 2) {
            joinPromise.then(function (conn) {
                var receiver = conn.receiver;
                conn.on('speaking', function (user, speaking) {
                    if (speaking) {
                        console.log("".concat(user.username, " started speaking"));
                        var audioStream = receiver.createStream(user, { mode: 'pcm' });
                        audioStream.pipe(createNewChunk());
                        audioStream.on('end', function () { console.log("".concat(user.username, " stopped speaking")); });
                    }
                });
            })
                .catch(function (err) { throw err; });
        }
    }
}
function userLeaveChannel(voiceState, newState, client) {
    if (!voiceState.channel || !voiceState.channel.members || !voiceState.channel.members.size)
        return;
    // 参加人数が2人以下になれば退出（bot含める）
    if (voiceState.channel.members.size < 3 && newState.channelID !== voiceState.channelID) {
        voiceState.channel.leave();
        console.log('stoped recording');
    }
}
client.login(process.env.TOKEN);
client.on('ready', function () {
    console.log("\nONLINE\n");
});
