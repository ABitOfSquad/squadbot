var fs = require("fs");

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
        pluginList = fs.readdirSync(folder).filter(function(file) {
            return fs.statSync(path.join(folder, file)).isFile();
        });

        pluginFolder = folder;
        loadPlugins()
    }
    catch (err) {
        pluginList = false;

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
            });
        }
    }
}

function loopThroughPluginsfolder(callback){
    reservedCommands = {};

    for (var i = 0; i < pluginList.length; i++) {
        try {
            var plugin = require("./" + pluginFolder + "/" + pluginList[i]).plugin;

            //does the plugin has a exports.plugins?
            if (!plugin) {
                print("Warning: plugin " + pluginList[i] + " does not implement exports.plugin", "red")
            } else {
                //do some fancy commands checking
                if (plugin.reservedCommands) {

                    for (var t = 0; t < plugin.reservedCommands.length; t++) {
                        if (reservedCommands[plugin.reservedCommands[t]]) {
                            print("Both " + pluginList[i] + " and " + reservedCommands[plugin.reservedCommands[t]] + " depend on the same command, please disable one of them.", "red");
                            process.exit();
                        }
                        else {
                            reservedCommands[plugin.reservedCommands[t]] = pluginList[i]
                        }
                    }

                }

                if (!plugin["name"]) {
                    print("Loaded " + pluginList[i] + "!")
                }
                else {
                    print("Loaded " + plugin["name"] + " v" + plugin["version"] + "!")
                }
            }
        } catch (err) {
            print("Plugin " + pluginList[i] + " crashed with the following error:", "red");
            console.log(err.stack);
        }
    }

    callback()
}
