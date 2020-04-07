<h1 align="center">Recruit-o-matic</h1>
<div align="center">
<strong><i>Recruitment tool to help EVE Online corporations find applicants on Reddit</i></strong>
<br /><br />

![node-lts](https://img.shields.io/node/v-lts/discord.js?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/aimsucks/recruit-o-matic?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/aimsucks/recruit-o-matic?style=for-the-badge)

</div>
<br />
<div  align="center">
Very simple Reddit API scraper and Discord bot that automatically posts whitelisted submissions to Discord for user review.
</div>

## Installation

Set up an [application on Reddit](https://www.reddit.com/prefs/apps) and use [this](https://not-an-aardvark.github.io/reddit-oauth-helper/) tool to get a refresh token for your app.

Configure your `.env` file with the following parameters:

```
REDDIT_CLIENT_ID=""
REDDIT_SECRET=""
REDDIT_REFRESH_TOKEN=""

DISCORD_TOKEN=""
DISCORD_PREFIX="!"
DISCORD_CHANNEL=""

MONGOOSE_URI="mongodb://localhost/reddit"
```

For development, run the app with `nodemon`. In production, I recommend using `PM2` to run.

```commandline
nodemon app.js

pm2 start app.js
```

## License

This project is licensed under MIT.
