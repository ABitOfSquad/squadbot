require("./leakdetector");

var fs = require("fs");
var events = require("events");
var emoji = require("./emoji");
var plugins = require("./pluginmanager");
var terminalhandler = require("./terminalhandler");
var spm = require("./spm.js");

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

/**
 * Prints a fancier line to the console
 *
 * @param text
 * @param color
 */
global.print = function print(text, color, style) {
    var colors =  {
        "black": '30m', // Should probably not be used
        "red": '31m',
        "green": '32m',
        "brown": '33m',
        "blue": '34m',
        "purple": '35m',
        "cyan": '36m',
        "gray": '37m',
        "white": '0m'
    }
    
    var styles = {
        "bold": "1;",
        "lighter": "2;",
        "italic": "3;",
        "underline": "4;"
    }
    
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
    
    console.log(output);
};

// Uncomment for color demo

// print("black", "black")
// print("red", "red", "bold")
// print("green", "green", "lighter")
// print("brown", "brown", "italic")
// print("blue", "blue", "underline")
// print("purple", "purple")
// print("cyan", "cyan")
// print("gray", "gray")
// print("normal")
// process.exit();


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

spm.initProtocols();

/**
 * Fired when the protocol is done loading
 */
bot.on("loadingProtocolDone", function() {
    print("Protocol loaded, loading plugins");
    //lets start the pluginmanager
    plugins.init(settings["plugin_folder"]);
})
