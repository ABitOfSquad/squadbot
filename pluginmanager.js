var fs = require("fs");
var path = require("path");

var pluginList;
var pluginFolder;
var reservedCommands;

/**
 * Initializes the plugins folder, folder as given in the settings
 *
 * @param folder path of the folder that contains plugins
 */
exports.init = function(folder){
    try {
        // Get list of folders in plugins folder
        pluginList = fs.readdirSync(folder).filter(function(file) {
            return fs.statSync(path.join(__dirname + "/" + folder + "/", file)).isDirectory();
        })

        pluginFolder = folder;
        loadPlugins()
    }
    catch (err) {
        pluginList = false;
        console.log(err.stack);

        print("Could not load contents of plugin folder", "red");
        process.exit()
    }
};

/**
 * Loads the plugins from the plugin list generated on initialization
 */
function loadPlugins(){
    if (pluginList) {
        if (pluginList.length == 0) {
            print("No plugins found", "red")
        } else {

            //creates a listener for the bot emitter to check for illegal listeners
            bot.on("newListener", function(event, listener) {
                var illegalListeners = ["newListener", "removeListener"];
                if (illegalListeners.indexOf(event) != -1) {
                    setTimeout(function () {
                        bot.removeListener(event, listener)
                    }, 10);

                    print('Something tried to listen to the protected bot event "' + event + '"', "red")
                }
            });

            loopThroughPluginsfolder(function (){
                print("All plugins loaded");
                bot.emit("finishedLoading");
            });
        }
    }
}

function loopThroughPluginsfolder(callback){
    reservedCommands = {};

    for (var i = 0; i < pluginList.length; i++) {
        var styledErrorName = "plugin \033[35m" + pluginList[i] + "\033[31m"
        var styledWarningName = "plugin \033[33m" + pluginList[i] + "\033[38;5;202m"
        console.log(pluginList[i]);

        try {
            try {
                var meta = fs.readFileSync(pluginFolder + "/" + pluginList[i] + "/plugin.json", "utf8");
            } catch (err) {
                print("Missing plugin.json for " + styledErrorName + ", skipping", "red");
                continue;
            }

            try {
                meta = JSON.parse(meta)
            } catch (err) {
                print("The plugin.json for " + styledErrorName + " has syntax errors, skipping", "red");
                continue;
            }

            var required = ["name", "version", "description", "enabled"]
            var found = false;

            for (var t = 0; t < required.length; t++) {
                if (typeof meta[required[t]] == "undefined") {
                    print("The plugin.json for " + styledErrorName + " is missing the required value \"" + required[t] + "\", skipping", "red");
                    found = true
                    break;
                }
            }

            if (found) {
                continue
            }

            if (!meta.enabled) {
                print("The " + styledErrorName + " has been disabled in its plugin.json, skipping", "red");
                continue;
            }

            if (meta.reservedCommands) {
                for (var t = 0; t < meta.reservedCommands.length; t++) {
                    if (reservedCommands[meta.reservedCommands[t]]) {
                        print("Both " + styledErrorName + " and \033[35m" + reservedCommands[meta.reservedCommands[t]] + "\033[31m depend on the same command, please disable one of them.", "red");
                        process.exit();
                    }
                    else {
                        reservedCommands[meta.reservedCommands[t]] = pluginList[i]
                    }
                }
            }

            if (!meta.script) {
                meta.script = "index.js"
                print("Warning: The " + styledWarningName + " does not have a script path in its plugin.json, using default \"index.js\"", "orange");
            }

            try {
                fs.readFileSync(pluginFolder + "/" + pluginList[i] + "/" + meta.script, "utf8");
            } catch (err) {
                print("Can't read the script \"" + meta.script + "\" for " + styledErrorName + ", skipping", "red");
            }

        } catch (err) {
            print("Could not load " + styledErrorName + ", the following error was thrown:", "red");
            console.log(err.stack);
        }





        // try {
        //     var plugin = require("./" + pluginFolder + "/" + pluginList[i]).plugin;
        //
        //     //does the plugin has a exports.plugins?
        //     if (!plugin) {
        //         print("Warning: plugin " + pluginList[i] + " does not implement exports.plugin", "red")
        //     } else {
        //         //do some fancy commands checking
        //         if (plugin.reservedCommands) {
        //
        //             for (var t = 0; t < plugin.reservedCommands.length; t++) {
        //                 if (reservedCommands[plugin.reservedCommands[t]]) {
        //                     print("Both " + pluginList[i] + " and " + reservedCommands[plugin.reservedCommands[t]] + " depend on the same command, please disable one of them.", "red");
        //                     process.exit();
        //                 }
        //                 else {
        //                     reservedCommands[plugin.reservedCommands[t]] = pluginList[i]
        //                 }
        //             }
        //
        //         }
        //
        //         if (!plugin["name"]) {
        //             print("Loaded " + pluginList[i] + "!")
        //         }
        //         else {
        //             print("Loaded " + plugin["name"] + " v" + plugin["version"] + "!")
        //         }
        //     }
        // } catch (err) {
        //     print("Plugin " + pluginList[i] + " crashed with the following error:", "red");
        //     console.log(err.stack);
        // }
    }

    // callback()
}
