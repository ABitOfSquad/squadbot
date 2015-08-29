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

print("Settings loaded");

/**
 * PROTOCOL
 */

var protocolList;

try {
    protocolList = fs.readdirSync("protocols")
} 
catch (err) {
    print("Could not load contents of protocols folder", "red");
    process.exit();
}

if (protocolList.length == 0) {
    print("Could not find a protocol", "red")
    process.exit()
}

if (process.argv[2]) {
    if (protocolList.indexOf(process.argv[2]) != -1) {
        loadProtocol(process.argv[2])
    }
    else {
        print('Unknown protocol "' + process.argv[2] + '"', "red")
        process.exit()
    }
} else if(settings["protocol"]) {
    if (protocolList.indexOf(settings["protocol"]) != -1) {
        loadProtocol(settings["protocol"])
    }
    else {
        print('Unknown protocol "' + process.argv[2] + '"', "red")
        process.exit()
    }
} else {
    print("Warning: No protocol given, using " + protocolList[0], "red")
    loadProtocol(protocolList[0])
}

function loadProtocol(name) {
    var protocol = require("./protocols/" + name + "/protocol.js")
    
    try {
        protocol.init(settings)
    } 
    catch (err) {
        protocol.init()
    }
    
    print("Protocol loaded, loading plugins");
}

/**
 * PLUGINS
 */
plugins.init(settings["plugin_folder"]);
