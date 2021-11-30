import { Intents, Message, VoiceState, Client } from "discord.js";
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()
const Discord = require('discord.js');
const client = new Discord.Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});

if(!process.env.TOKEN) {
    console.error("Make sure there is token in .env file.");
    process.exit(1);
}

function createNewChunk (){
    const pathToFile = __dirname + `/../recordings/${Date.now()}.pcm`;
    return fs.createWriteStream(pathToFile);
};

client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
    const voiceState = newState.channel || oldState.channel
    if (!voiceState || voiceState.name !== process.argv[2]) return

    // bot参加
    userJoinAndRecordChannel(newState, oldState, client)

    // bot退出
    userLeaveChannel(oldState, newState, client)
})

function userJoinAndRecordChannel (voiceState: VoiceState, oldState: VoiceState, client: Client) {
    if (!voiceState.channel || !voiceState.channel.members || !voiceState.channel.members.size || voiceState.channel.type !== 'voice') return
    const voiceMemberSize = voiceState.channel.members.size

    // チャンネル参加人数が1以上で参加（bot含める）
    if (voiceMemberSize > 0 && oldState.channelID!==voiceState.channelID) {
        const joinPromise = voiceState.channel.join()

        //参加人数が3人以上で録音開始（bot含める）
        if (voiceMemberSize > 2) {
            joinPromise.then(conn => {
                const receiver = conn.receiver;
                conn.on('speaking', (user, speaking) => {
                    if (speaking) {
                        console.log(`${user.username} started speaking`);
                        const audioStream = receiver.createStream(user, { mode: 'pcm' });
                        audioStream.pipe(createNewChunk());
                        audioStream.on('end', () => { console.log(`${user.username} stopped speaking`); });
                    }
                });
            })
            .catch(err => { throw err; });
        }
    }
}

function userLeaveChannel (voiceState: VoiceState, newState: VoiceState, client: Client) {
    if (!voiceState.channel || !voiceState.channel.members || !voiceState.channel.members.size) return

    // 参加人数が2人以下になれば退出（bot含める）
    if (voiceState.channel.members.size < 3 && newState.channelID!==voiceState.channelID) {
        voiceState.channel.leave()
        console.log('stoped recording')
    }
}

client.login(process.env.TOKEN);

client.on('ready', () => {
    console.log(`\nONLINE\n`);
});