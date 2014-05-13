var request = require('request')
    , cheerio = require('cheerio')
    , async = require('async')
    , steam = require("steam")
    , util = require("util")
    , fs = require("fs")
    , bot = new steam.SteamClient(); //WHERE THE MAGIC HAPPENS FOR NOW

global.config = require("./config");

var onSteamLogOn = function onSteamLogOn(){
        bot.setPersonaState(steam.EPersonaState.Busy); // to display your bot's status as "Online"
        bot.setPersonaName(config.steam_name); // to change its nickname
        util.log("Logged on.");

        bot.webLogOn(function(cookies){
            util.log("Received cookies.");
            //util.log(cookies);

            //var cookie_string = cookies.toString();
            var cookie_string_split = cookies.toString().split(',');
            var url = config.badge_url;
            var j = request.jar();
            var game_to_idle = 0;

            cookie_string_split.every(function(value){
                util.log(value);
                j.setCookie(request.cookie(value), url);
                return 1;
            });

            var findGameToIdle = function(callback) {
                request({url: url, jar: j}, function (err, response, body) {
                    game_to_idle = 0;
                    //fs.writeFileSync('test.html', body);

                    if (err) throw err;
                    var $ = cheerio.load(body);
                    $('span.progress_info_bold').each(function () {
                        if (($(this).text() !== 'undefined')
                            && ($(this).text() !== null)
                            && ($(this).text() != 'No card drops remaining')) {

                            var num_drops = $(this).text().replace(' card drops remaining', '');
                            game_to_idle = $(this).prev().parent().children('div.badge_title_playgame').children('a.btn_green_white_innerfade').attr('href').replace('steam://run/', '');
                            //util.log(game_to_idle + ' || ' + num_drops);
                        }
                    });
                    callback(game_to_idle);
                });
            };

            var gameToIdle_index = 0;
            setInterval(function () {
                util.log('Re-enumerating remaining drops');
                findGameToIdle(function(gameToIdle){
                    util.log('Finished poll');
                    if(gameToIdle != gameToIdle_index){
                        util.log('Changing idle game to: '+gameToIdle);
                        bot.gamesPlayed([gameToIdle]);
                        gameToIdle_index = gameToIdle;
                    }
                    else{
                        util.log('Still idling: '+gameToIdle);
                    }
                });
            }, config.badge_check_idle);
        });
    },
    onSteamSentry = function onSteamSentry(sentry) {
        util.log("Received sentry.");
        require('fs').writeFileSync('sentry', sentry);
    },
    onSteamServers = function onSteamServers(servers) {
        util.log("Received servers.");
        fs.writeFile('servers', JSON.stringify(servers));
    },
    onWebSessionID = function onWebSessionID(webSessionID) {
        util.log("Received web session id.");
        // steamTrade.sessionID = webSessionID;
        /*bot.webLogOn(function onWebLogonSetTradeCookies(cookies) {
            util.log("Received cookies.");
            util.log(cookies);
            fs.writeFileSync('cookie.txt', cookies);

           //for (var i = 0; i < cookies.length; i++) {
                // steamTrade.setCookie(cookies[i]);
                //util.log(i+" | "+cookies[i]);
            //}
        });*/
    };

// Login, only passing authCode if it exists
var logOnDetails = {
    "accountName": config.steam_user,
    "password": config.steam_pass
};
if (config.steam_guard_code) logOnDetails.authCode = config.steam_guard_code;
var sentry = fs.readFileSync('sentry');
if (sentry.length) logOnDetails.shaSentryfile = sentry;
bot.logOn(logOnDetails);
bot.on("loggedOn", onSteamLogOn)
    .on('sentry', onSteamSentry)
    .on('servers', onSteamServers)
    .on('webSessionID', onWebSessionID);