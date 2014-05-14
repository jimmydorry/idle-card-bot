// Configure and mv to config.js
var config = {};

config.steam_name = "";
config.steam_user = "";
config.steam_pass = "";
config.steam_guard_code = "";

config.badge_url = "http://steamcommunity.com/id/XXXXXXX/badges";
config.badge_check_idle = 5 * 60 * 1000; //Check which game to idle next every 5mins
config.badge_check_idle_no_cards = 30 * 60 * 1000; //When no cards left to idle, check every 30mins

module.exports = config;
