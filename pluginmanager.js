var fs = require("fs");
var path = require("path");
var childProcess = require("child_process");

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
        // We don't know the real name yet, so call the plugin by the name of its folder
        var styledErrorName = style("purple") + pluginList[i] + style("red") ;
        var styledWarningName = style("yellow") + pluginList[i] + style("orange");

        try {
            try {
                var meta = fs.readFileSync(pluginFolder + "/" + pluginList[i] + "/plugin.json", "utf8");
            } catch (err) {
                print("Missing plugin.json for plugin " + styledErrorName + ", skipping", "red");
                continue;
            }

            try {
                meta = JSON.parse(meta)
            } catch (err) {
                print("The plugin.json for plugin " + styledErrorName + " has syntax errors, skipping", "red");
                continue;
            }

            var required = ["name", "version", "description", "enabled"]
            var found = false;

            for (var t = 0; t < required.length; t++) {
                if (typeof meta[required[t]] == "undefined") {
                    print("The plugin.json for plugin " + styledErrorName + " is missing the required value \"" + required[t] + "\", skipping", "red");
                    found = true
                    break;
                }
            }

            if (found) {
                continue
            }

            // We know the real name of the plugin from here on
            styledErrorName = style("purple") + meta.name + style("red") ;
            styledWarningName = style("yellow") + meta.name + style("orange");

            if (!meta.enabled) {
                print("Plugin " + styledErrorName + " has been disabled in its plugin.json, skipping", "red");
                continue;
            }

            if (meta.reservedCommands) {
                for (var t = 0; t < meta.reservedCommands.length; t++) {
                    if (reservedCommands[meta.reservedCommands[t]]) {
                        print("Both the plugins " + styledErrorName + " and " + style("purple") + reservedCommands[meta.reservedCommands[t]] + style("red") +
                            " depend on the same command, please disable one of them.", "red");
                        process.exit();
                    }
                    else {
                        reservedCommands[meta.reservedCommands[t]] = pluginList[i]
                    }
                }
            }

            if (!meta.script) {
                meta.script = "index.js"
                print("Warning: The plugin " + styledWarningName + " does not have a script path in its plugin.json, using default \"index.js\"", "orange");
            }

            try {
                fs.readFileSync(pluginFolder + "/" + pluginList[i] + "/" + meta.script, "utf8");
            } catch (err) {
                print("Can't read the script \"" + meta.script + "\" for plugin " + styledErrorName + ", skipping", "red");
                continue;
            }

            startChild(pluginFolder + "/" + pluginList[i] + "/" + meta.script, meta.name)

        } catch (err) {
            print("Could not load plugin " + styledErrorName + ", the following error was thrown:", "red");
            console.log(err.stack);
        }
    }

    // callback()
}

function startChild(file, name) {
    var child = childProcess.spawn("node", ["./pluginprocess"]);
    child.stdin.setEncoding("utf-8");
    child.stderr.setEncoding("utf-8");
    child.stdout.setEncoding("utf-8");

    var styledErrorName = style("purple") + name + style("red")
    var hadInit = false
    var hash = "";
    var hashChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i = 0; i < 12; i++) {
        hash += hashChars.charAt(Math.floor(Math.random() * hashChars.length));
    }

    child.stdout.on("data", function(data) {
        if (data.indexOf("GET SQUADBOT INIT") > -1) {
            child.stdin.write("SQUADBOT INIT" + "\n"
                + '{"pluginName": "' + name + '", "hash": "' + hash + '"}');

            hadInit = true;
        }
        else if (data.indexOf("SQUADBOT IPC") > -1) {
            if (data.indexOf("SQUADBOT IPC " + hash) > -1) {

            }
            else {
                print("Security: The plugin " + styledErrorName + " tried to fake IPC communications and is being terminated", "red");
                child.kill("SIGINT");
            }
        }
        console.log(data);

    });

    child.stderr.on("data", function(data) {
        print("The plugin " + styledErrorName + " encountered the following error: \n\n" + style("reset") + data, "red");
    });

    child.on("close", function(code) {
        if (code == 0) {
            print("The plugin " + styledErrorName + " has decided to stop", "red");
        }
        else {
            print("The plugin " + styledErrorName + " has crashed", "red");
        }
    });

}
