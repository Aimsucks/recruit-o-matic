require('dotenv').config()

// ******************************************
// Database
// ******************************************

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGOOSE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
    .then(console.log('Connected to database'))
    .catch(err => {
        console.error(err)
        process.exit()
    })

const Whitelist = mongoose.model(
    'Whitelist',
    mongoose.Schema({
        phrase: { type: String, unique: true }
    }, { timestamps: true }))

const Blacklist = mongoose.model(
    'Blacklist',
    mongoose.Schema({
        phrase: String
    }, { timestamps: true }))

const User = mongoose.model(
    'User',
    mongoose.Schema({
        userID: String,
        score: Number
    }, { timestamps: true })
)

var whitelist
Whitelist.find({}).lean().then(object => whitelist = ((object.map(o => new RegExp(`\\b(${o.phrase})\\b`, 'gi')))))

var blacklist
Blacklist.find({}).lean().then(object => blacklist = ((object.map(o => new RegExp(`\\b(${o.phrase})\\b`, 'gi')))))

// ******************************************
// Discord
// ******************************************

const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on('message', async message => {
    if (
        !message.content.startsWith(process.env.DISCORD_PREFIX) ||
        message.author.bot ||
        message.channel.type === 'dm'
    ) { return }

    const args = message.content
        .slice(process.env.DISCORD_PREFIX.length)
        .split(/ +/)
    const command = args.shift().toLowerCase()

    if (command === 'whitelist') {
        const phrase = new Whitelist({ phrase: args.join(' ') })
        phrase.save((err) => { if (err) return message.channel.send("Already added!") })
        whitelist.push(`\\b(${args.join(' ')})\\b`, 'gi')
    }

    if (command === 'blacklist') {
        const phrase = new Blacklist({ phrase: args.join(' ') })
        phrase.save((err) => { if (err) return message.channel.send("Already added!") })
        blacklist.push(`\\b(${args.join(' ')})\\b`, 'gi')
    }
})

const checkmarks = ['☑️', '✔️', '✅', '🗸']
const crosses = ['✖️', '❎', '❌']

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.client.user.id === client.user.id) {
        if (checkmarks.includes(reaction.emoji.name)) {
            // console.log("yes")
        } else if (crosses.includes(reaction.emoji.name)) {
            reaction.message.delete()
        }
    }
})

client.login(process.env.DISCORD_TOKEN)

// ******************************************
// Reddit
// ******************************************

const Snoowrap = require('snoowrap')
const { SubmissionStream } = require('snoostorm')

const r = new Snoowrap({
    userAgent: 'Recruit-o-Matic',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_SECRET,
    refreshToken: process.env.REDDIT_REFRESH_TOKEN
})

const startTime = Math.round(Date.now() / 1000)

const submissions = new SubmissionStream(r, { subreddit: "Aimsucks", limit: 1 });
submissions.on("item", submission => {
    if (submission.is_self &&
        submission.created_utc > startTime &&
        whitelist.some(regex => { return regex.test(submission.selftext) }) &&
        !blacklist.some(regex => { return regex.test(submission.selftext) })) {

        channel = client.channels.cache.get(process.env.DISCORD_CHANNEL)

        const selftext = text => {
            if (text.length < 125) return text
            else return `${text.substring(0, 125)}...`
        }

        const embed = new Discord.MessageEmbed()
            .setColor(channel.guild.me.displayColor)
            .setTitle(submission.title)
            .setURL(submission.url)
            .setAuthor(submission.author.name, null, `https://reddit.com/u/${submission.author.name}`)
            .setDescription(selftext(submission.selftext))
            .setFooter(channel.guild.me.displayName, client.user.avatarURL())
            .setTimestamp()

        channel.send(embed)
    }
});
