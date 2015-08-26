var whapi = require("whatsapi");
var fs = require("fs");
var events = require("events");

var settings;
var hadLinebreak = true;
var pluginList;

global.bot = new events.EventEmitter();
global.print = function print(text, linebreak, format) {
    linebreak = typeof linebreak !== "undefined"? linebreak : true;
    format = typeof format !== "undefined" ? format : true;

    if (format) {
        if (!hadLinebreak) {
            process.stdout.write("\n\r")
        }

        var d = new Date()
        var h = (d.getHours() < 10 ? "0" : "") + d.getHours()
        var m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes()
        var s = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds()
        process.stdout.write("[" + h + ":" + m + ":" + s + "] ")
    }

    process.stdout.write(text + (linebreak ? "\n\r" : " "))
    hadLinebreak = linebreak
}

/**
 * INITIALIZATION
 */
// LOAD SETTINGS
try {
    settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'))
} catch (err) {
    print("could not load settings file");
    process.exit();
}
print("Settings loaded");
// LOAD PLUGINS
try {
    pluginList = fs.readdirSync("plugins")
} catch (err) {
    pluginList = false;
    print("Could not load contents of plugin folder");
    process.exit();
}
if (pluginList) {
    if (pluginList.length == 0) {
        print("No plugins found")
    }
    else {
        for (var i = 0; i < pluginList.length; i++) {
            print("Loading " + pluginList[i] + "...")

            try {
                require("./plugins/" + pluginList[i])
            } catch (err) {
                print("Plugin " + pluginList[i] + " crashed with the following error:")
                console.log(err.stack);
            }
        }
    }

    print("All plugins loaded")
}
print("Plugins loaded");
//WHATSAPI INIT
var wa = whapi.createAdapter({
    msisdn: settings["telnumber"], // phone number with country code
    username: settings["displayname"], // your name on WhatsApp
    password: settings["whatsapp_pass"], // WhatsApp password
    ccode: '44' // country code
});



