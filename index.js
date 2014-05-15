var request = require('request')
    , cheerio = require('cheerio')
    , async = require('async')
    , steam = require("steam")
    , util = require("util")
    , fs = require("fs")
    , bot = new steam.SteamClient(); //WHERE THE MAGIC HAPPENS FOR NOW

global.config = require("./config");

var onSteamLogOn = function onSteamLogOn() {
        bot.setPersonaState(steam.EPersonaState.Busy); // to display your bot's status as "Online"
        bot.setPersonaName(config.steam_name); // to change its nickname

        util.log("Logged on.");

        var game_to_idle = 0;
        var url = config.badge_url;
        var j = request.jar();

        var getCookie = function (callback) {
            bot.webLogOn(function (cookie) {
                util.log("Grabbing new cookie.");
                //util.log(cookie);

                var cookie_string_split = cookie.toString().split(',');

                cookie_string_split.every(function (value) {
                    util.log(value);
                    j.setCookie(request.cookie(value), url);
                    return 1;
                });

                callback();
            });
        };

        var findGameToIdle = function (callback) {
            //var gameToIdleTemp = game_to_idle;
            //util.log('Re-enumerating remaining drops');
            request({url: url, jar: j}, function (err, response, body) {
                game_to_idle = 0;
                //if (err) throw err;
                if (err) {
                    util.log('Problem grabbing card status.');
                    callback(game_to_idle);
                }
                else {
                    fs.writeFileSync('test.html', body); //SO WE CAN SEE WHAT IT SEES

                    var doBadgeProfileReq = function(callback2){
                        var $ = cheerio.load(body);
                        $('span.progress_info_bold').each(function () {
                            if (($(this).text() !== 'undefined')
                                && ($(this).text() !== null)
                                && ($(this).text() != 'No card drops remaining')) {

                                //var num_drops = $(this).text().replace(' card drops remaining', '');
                                game_to_idle = $(this).prev().parent().children('div.badge_title_playgame').children('a.btn_green_white_innerfade').attr('href').replace('steam://run/', '');
                                //util.log(game_to_idle + ' || ' + num_drops);
                            }
                        });
                        callback2();
                    };

                    doBadgeProfileReq(function(){
                        callback(game_to_idle);
                    });
                }
            });
        };

        var gameToIdle_index = 0;
        var numTimesNoGame = 0;

        function cardIdleMain() {
            findGameToIdle(function (gameToIdle) {
                //util.log('Finished poll');
                if (gameToIdle != gameToIdle_index) {
                    if (gameToIdle == 0) {
                        util.log('No game to idle.');
                        if (numTimesNoGame > 30) {
                            util.log('Still nothing. Time to quit.');
                            process.exit(1);
                        }
                        else if (numTimesNoGame == 0) {
                            bot.gamesPlayed([gameToIdle]);
                        }
                        util.log('Getting a new cookie and waiting until next check. Attempt: ' + numTimesNoGame);
                        numTimesNoGame++;
                        getCookie(function () {
                            util.log('Cookie set.');
                        });
                    }
                    else {
                        util.log('Changing idle game to: ' + gameToIdle);
                        bot.gamesPlayed([gameToIdle]);
                        gameToIdle_index = gameToIdle;
                        numTimesNoGame = 0;
                    }
                }
                else {
                    util.log('Still idling: ' + gameToIdle);
                    numTimesNoGame = 0;
                }
            });
        }

        getCookie(function () {
            util.log('Cookie set.');
            cardIdleMain();
        });

        setInterval(function () {
            cardIdleMain();
        }, config.badge_check_idle);
    },
    onSteamSentry = function onSteamSentry(sentry) {
        util.log("Received sentry.");
        require('fs').writeFileSync('sentry', sentry);
    },
    onSteamServers = function onSteamServers(servers) {
        util.log("Received servers.");
        fs.writeFile('servers', JSON.stringify(servers));
    };
//,onWebSessionID = function onWebSessionID(webSessionID) {
//util.log("Received web session id.");
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
//};

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
    .on('servers', onSteamServers);
// .on('webSessionID', onWebSessionID);