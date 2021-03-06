var fs = require("fs");
var events = require("events");
var emoji = require("./util/emoji");
var plugins = require("./pluginmanager");
var terminalhandler = require("./util/terminalhandler");

var isRunning = false;

// Because seeing "squadbot" in the system monitor is reay cool
process.title = "squadbot"

global.bot = new events.EventEmitter();
global.terminal = new events.EventEmitter();

// Now listening for console input
terminalhandler.listen();

/**
 * parses emoji strings to unicode characters
 *
 * @param msg stringe to parse emojis from
 * @returns msg string with emoji unicode chars
 */
global.encodeEmoji = function(msg) {return emoji.parse(msg) };

var colors =  {
    "black": '30m', // Should probably not be used
    "red": '31m',
    "green": '32m',
    "yellow": '33m',
    "blue": '34m',
    "purple": '35m',
    "cyan": '36m',
    "gray": '37m',
    "white": '0m',
    "orange": '38;5;202m'
}

var styles = {
    "bold": "1;",
    "lighter": "2;",
    "italic": "3;",
    "underline": "4;"
}

/**
 * Prints a fancier line to the console
 *
 * @param text
 * @param color
 */
global.print = function print(text, color, style) {
    var output = '\033[0m' // Clear all previous colors (just in case)

    if (color) {
        if (colors[color]) {
            var styleCode = ""

            if (styles[style]) {
                styleCode = styles[style]
            }

            output += '\033[' + styleCode + colors[color]
        }
    }

    var d = new Date()
    var h = (d.getHours() < 10 ? "0" : "") + d.getHours()
    var m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes()
    var s = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds()

    output += "[" + h + ":" + m + ":" + s + "] " + text

    if (color) {
        output += '\033[0m'
    }

    process.stdout.write(output.split("\n").join("\n           ") + "\n");
};

global.style = function(color, style) {
    if (color && color != "reset") {
        if (colors[color]) {
            var styleCode = "";

            if (styles[style]) {
                styleCode = styles[style];
            }

            return '\033[' + styleCode + colors[color];
        }
    }
    else {
        return '\033[0m';
    }
}

/**
 * SETTINGS (initializes settings.json)
 */
try {
    global.settings = JSON.parse(fs.readFileSync("settings.json", "utf8"));
    print("Settings.json successfully loaded into memory!");

    bot.setMaxListeners(settings["max_event_listeners"]);
}
catch (err) {
    print("Could not load settings file", "red");
    process.exit();
}

/**
 * Fired when completely done loading squadbot and its plugins!
 */
bot.on("finishedLoading", function(){
    if(!isRunning){
        isRunning = true;
        print("Done loading in " + process.uptime() + "s!", "green", "bold");
    }
});

/**
 * Fired when the protocol is done loading
 */
bot.on("loadingProtocolDone", function() {
    print("Protocol loaded, loading plugins");
    //lets start the pluginmanager
    plugins.init(settings["plugin_folder"]);
});

/**
 * If spm is enabled, do your thing, and download some protocols!
 */
if(settings.spm.enabled){
    var spm = require("./spm.js");
    spm.initProtocols();
}
