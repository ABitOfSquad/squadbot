var fs = require("fs");
var events = require("events");
var net = require("net");

exports.spm = new events.EventEmitter();
exports.loadProtocol = function(name) { loadProtocol(name)};

function loadProtocol(name) {
    print("Loading protocol " + name);
    //require("./protocolwrapper.js")(name);
}

if (process.argv[2] && settings.spm.enabled) {
    switch (process.argv[2]) {
        case "install":
            if (process.argv[3] == "protocol" && process.argv[4]) {
                if (fs.readdirSync("protocols").indexOf(process.argv[4]) != -1) {
                    print("That protocol is already installed", "red")
                    process.exit()
                }
                
                var client = new net.Socket();
                
                print("Connecting to server")

                client.connect(settings.spm.port, settings.spm.host, function() {
                	print("Asking for a protocol called " + process.argv[4])
                	client.write('{"type": "getProtocol", "name": "' + process.argv[4] + '"}');
                });

                client.on("data", function(data) {
                    try {
                        var resp = JSON.parse(data.toString("utf-8"))
                    } 
                    catch (err) {
                        print("Server send an invalid responce", "red")
                    }
                    
                    if (resp.type == "error") {
                        print("Server: " + resp.data, "red")
                    }
                    else if (resp.type == "saveProtocol") {
                        print("Download complete, unpacking")
                        
                        try {
                            fs.mkdirSync("protocols/" + process.argv[4])
                            
                            for (var i = 0; i < resp.data.length; i++) {
                                fs.writeFileSync("protocols/" + process.argv[4] + "/" + resp.data[i].name, resp.data[i].data)
                            }
                        } 
                        catch(err) {
                            print("Could not save received files", "red")
                            process.exit()
                        }
                        
                        print("Protocol successfully installed")
                    }
                });

                client.on("error", function(data) {
                	print("Something went wrong with the connection", "red")
                    process.exit()
                });
            }
            break
        case "remove":
            if (process.argv[3] == "protocol") {
                if (!process.argv[4]) {
                    print("Please provide a protocol to remove", "red")
                }
                
                if (fs.readdirSync("protocols").indexOf(process.argv[4]) == -1) {
                    print("That protocol is not installed, can't remove nonexistent things", "red")
                    process.exit()
                }
                
                print("Uninstalling " + process.argv[4] + " protocol")
                
                try {
                    var files = fs.readdirSync("protocols/" + process.argv[4])
                    
                    for (var i = 0; i < files.length; i++) {
                        fs.unlinkSync("protocols/" + process.argv[4] + "/" + files[i])
                    }
                    
                    fs.rmdirSync("protocols/" + process.argv[4])
                } 
                catch(err) {
                    console.log(err.stack);
                    print("Something went wrong while deleting", "red")
                    process.exit()
                }
                
                print("Uninstallation successful")
            }
            break
        default:
            useLocal()
    }
}
else {
    useLocal()
}

/**
 * Loads locally installed protocols
 */
function useLocal() {
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

    if (settings["protocol"]) {
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

}
