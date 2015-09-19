var fs = require("fs");
var events = require("events");
var terminalhandle = require("./terminalhandler");
var npmInstaller = require("./spm/npminstaller");

var protocolIsLoaded;
var isCommandListening;
var isInitializing;

exports.spm = new events.EventEmitter();
exports.initProtocols = function() { initProtocolLoading()};
exports.loadProtocol = function(name) { loadProtocol(name)};

/**
 *
 * @param name
 */
function loadProtocol(name) {
    if(!protocolIsLoaded){
        print("Loading protocol " + name);
        require("./protocolwrapper.js")(name);
        protocolIsLoaded = true;
    }
}

/**
 * Initializes the loading of the protocol
 */
function initProtocolLoading(){
    initTerminalCommands();
    print("SPM commands in console enabled", "cyan");

    try {
        if(settings["protocol"] !== undefined || settings["protocol"] == ""){
            if(!fs.existsSync("./protocols/" + settings["protocol"] + "/")) {
                print("Given protocol not installed", "red");

                isInitializing = true;
                print("Protocol defined in settings is not downloaded", "red");
                if(fs.readdirSync("protocols").length == 0){
                    terminalhandle.askProtocol(true);
                } else {
                    terminalhandle.askProtocol(false);
                }
            } else {
                loadProtocol(settings["protocol"])
            }
        } 
        else if (process.argv[2]) {
            if(!fs.existsSync("./protocols/" + process.argv[2] + "/")) {
                print("Given protocol not installed", "red");
                
                if(fs.readdirSync("protocols").length == 0){
                     terminalhandle.askProtocol(true);
                 } else {
                     terminalhandle.askProtocol(false);
                 }
            } else {
                loadProtocol(process.argv[2])
            }
        }
        else {
            print("Protocol not defined in settings, assuming a new installation is being used");
            isInitializing = true;
            terminalhandle.askProtocol(true);
        }
    } catch(err) {

    }
}

/**
 * (re)sets the protocol that is being used, in the settings file.
 *
 * @param name Name of the new protocol.
 */
function setProtocol(name) {
    try {
        var _settings = JSON.parse(fs.readFileSync("settings.json", "utf8"));
        _settings["protocol"] = name;

        try {
            fs.writeFileSync('./settings.json', JSON.stringify(_settings, null, 4));
        } catch(err) {
            print("Could not save new settings, please change the protocol variable manually.")
        }

        if (!protocolIsLoaded) {
            settings["protocol"] = name;
            loadProtocol(name);
        }
    } catch(err) {
        print("could not change protocol in settings.json, please change the protocol variable manually.")
    }
}

/**
 * Starts listening for spm commands
 */
function initTerminalCommands(){
    terminal.on("command", function(name, args){
        if(name === "spm") {
            switch(args[0]){
                case "select":
                    if(args[1] == "-proto"){
                        if(args[2] !== undefined){
                            setProtocol(args[2])
                        } else {
                            print("[SPM] Missing command arguments", "red");
                        }
                    } else {
                        print("[SPM] Can only select protocol, please indicate that the string is a protocol by using '-proto ' in front of the protocol name", "red");
                    }

                    break;
                case "install":
                    if(args[1] == "-proto"){
                        if(args[2] !== undefined){
                            downloadProtocol(args[2])
                        } else {
                            print("[SPM] Missing command arguments", "red");
                        }
                    } else if(args[1] !== undefined && args.length < 2) {
                        installPlugin(args[1]);
                    } else {
                        print("[SPM] Missing command arguments", "red");
                    }

                    break;
                default:
                    print("[SPM] Missing command arguments", "red");
            }

        }

    });

    isCommandListening = true;
}

var net = require("net");
var path = require("path");
var client;

/**
 * Connects to the specified SPM server
 */
function connect(){
    print("Connecting to SPM server!", "cyan");
    try {
        client = new net.Socket();

        client.connect(settings.spm.port, settings.spm.host);
    } catch(err) {
        print("Could not connect to client", "red")
    }

}
/**
 * Downloads a protocol to the protocols folder
 * @param name
 */
function downloadProtocol(name){
    try {
        connect();
        client.write('{"type": "getProtocol", "name": "' + name + '"}');
    } catch(err) {
        print("Something went wrong requesting protocol, error is client-side", "red");
    }

    var endChunk = "";

    client.on("data", function(data) {
        endChunk += data.toString();
    });

    client.on("end", function(){
        try {
            var response = JSON.parse(endChunk);
            if(response.type === "saveProtocol") {
                print("Downloaded protocol " + name);
                installProtocol(response.data);
            } else if(response.type === "error") {
                print("Server sent an error: " + response.data, "red");
            } else {
                print("Server sent an unexpected packet", "red");
            }

        } catch(err) {
            console.log(err);
        }
    });

    client.on("error", function(data) {
        print("Something went wrong with the connection", "red");
        process.exit()
    });
}

function installProtocol(_response) {
    var response = JSON.parse(_response);
    var files = response.fileList;
    var name = response.name;

    npmInstaller.install(name, response);

    try {
        fs.mkdirSync(path.resolve(__dirname, "protocols/" + name));
    } catch(err){

    }

    files.forEach(function(name, n, arr){
        fs.writeFileSync(path.resolve(__dirname, 'protocols/' + response.name + "/" + name), files[name]);
        print("Installing protocol: " + Math.floor((n + 1) / arr.length * 100) + "%", "cyan");
    });

    npmInstaller.npmInstall.on("finish", function(){
        setProtocol(name);
    });

    // Let's start with installing npm packages
}

/**
 * Downloads a plugin to the plugins folder
 * @param name
 */
function installPlugin(name){

}
