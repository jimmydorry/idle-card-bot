idle-card-bot
=============

Idle bot for trading cards. This bot will check to see what games you have card drops available for, and will run those games. Every `user definied` amount of time, the bot will re-check to see what cards are available to drop.

### Setting up
* `npm install` in the repository root.
* Edit `config.js` appropriately.
* Attempt to log-in, you'll receive Error 63 - which means you need to provide a Steam Guard code.
* Set the Steam Guard code in `config.js` and launch again.
* After launching and successfully logging in, remove the SteamGuard code from the config.
