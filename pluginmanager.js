var fs = require("fs");

var pluginlist;

function init(folder){
    try {
        pluginList = fs.readdirSync(folder)
        loadPlugins();
    }
    catch (err) {
        pluginList = false;

        print("Could not load contents of plugin folder", "red");
        process.exit();
    }
}

function loadPlugins(){
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
}

module.exports = {
    "init" : function(folder) { init(folder) }
}
