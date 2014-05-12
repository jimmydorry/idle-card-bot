idle-card-bot
=============

Idle bot for trading cards

### Setting up
* `npm install` in the repository root.
* Edit `config.js` appropriately.
* Attempt to log-in, you'll receive Error 63 - which means you need to provide a Steam Guard code.
* Set the Steam Guard code in `config.js` and launch again.
* After launching and successfully logging in, remove the SteamGuard code from the config

## Testing
There is no automated test suite for node-dota2 (I've no idea how I'd make one for the stuff this does :o), however there the `test` directory does contain a Steam bot with commented-out dota2 methods; you can use this bot to test the library.

