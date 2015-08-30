var fs = require("fs");
var events = require("events");
var emoji = require("./emoji");
var plugins = require("./pluginmanager");
var homegroup;


global.settings;
global.bot = new events.EventEmitter()
global.encodeEmoji = function(msg) { emoji.parse(msg) };

/**
 * UTIL METHODS
 */

global.print = function print(text, color) {
    var output = ""
    
    if (color) {
        output += '\033[31m'
    }
    
    var d = new Date()
    var h = (d.getHours() < 10 ? "0" : "") + d.getHours()
    var m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes()
    var s = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds()
    
    output += "[" + h + ":" + m + ":" + s + "] " + text
    
    if (color) {
        output += '\033[0m'
    }
    
    console.log(output);
};


/**
 * SETTINGS
 */

try {
    settings = JSON.parse(fs.readFileSync("settings.json", "utf8"))

    bot.setMaxListeners(settings["max_event_listeners"]);
} 
catch (err) {
    print("Could not load settings file", "red");
    process.exit();
}

require("./spm.js").spm.on("done", function() {
    console.log("done");
    plugins.init(settings["plugin_folder"]);
})
