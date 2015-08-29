var fs = require("fs");
var request = require("request");
var events = require("events");

var pluginList;
var homegroup;


global.settings
global.bot = new events.EventEmitter()
bot.setMaxListeners(250)

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
}

var emojis = JSON.parse(fs.readFileSync("emoji.json", "utf8"))

try {
    settings = JSON.parse(fs.readFileSync("settings.json", "utf8"))
} 
catch (err) {
    print("Could not load settings file", "red");
    process.exit();
}

print("Settings loaded");

var protocolList

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
    if (protocolList.indexOf(process.argv[2])) {
        loadProtocol(process.argv[2])
    }
    else {
        print('Unknown protocol "' + process.argv[2] + '"', "red")
        process.exit()
    }
}
else {
    print("Warning: No protocol given, using " + protocolList[0], "red")
    loadProtocol(protocolList[0])
}

function loadProtocol(name) {
    var protocol = require("./protocols/" + name + "/protocol.js")
    
    try {
        protocol.init(JSON.parse(fs.readFileSync("./protocols/" + name + "/settings.json", "utf8")))
    } 
    catch (err) {
        protocol.init()
    }
    
    print("Protocol loaded, loading plugins");
}

try {
    pluginList = fs.readdirSync("plugins")
} 
catch (err) {
    pluginList = false;
    
    print("Could not load contents of plugin folder", "red");
    process.exit();
}

if (pluginList) {
    if (pluginList.length == 0) {
        print("No plugins found", "red")
    }
    else {
        var reservedCommands = {}

        for (var i = 0; i < pluginList.length; i++) {
            print("Loading " + pluginList[i] + "...")

            try {
                var plugin = require("./plugins/" + pluginList[i]).plugin
                
                if (!plugin) {
                    print("Warning: plugin " + pluginList[i] + " does not implement exports.plugin", "red")
                }
                else {
                    if (plugin.reservedCommands) {
                        for (var t = 0; t < plugin.reservedCommands.length; t++) {
                            if (reservedCommands[plugin.reservedCommands[t]]) {
                                print("Both " + pluginList[i] + " and " + reservedCommands[plugin.reservedCommands[t]] + " depend on the same command, please disable one of them.", "red")
                                process.exit();
                            }
                            else {
                                reservedCommands[plugin.reservedCommands[t]] = pluginList[i]
                            }
                        }
                    }
                }
            } catch (err) {
                print("Plugin " + pluginList[i] + " crashed with the following error:", "red")
                console.log(err.stack);
            }
        }
    }

    print("All plugins loaded")
}


global.encodeEmoji = function(msg) {
    if (!msg) {
        return
    }
    
    var parts = msg.split(":")
    var output = ""
    
    for (var i = 0; i < parts.length; i++) {
        if (emojis[parts[i]]) {
            output += emojis[parts[i]]
        }
        else {
            if (i != 0 && !emojis[parts[i - 1]]) {
                output += ":"
            }
            
            output += parts[i]
        }
    }
    
    return output
}
