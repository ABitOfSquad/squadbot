var fs = require("fs");

exports.askProtocol = function(empty) { askProtocol(empty) };
exports.listen = function() { listen() };

/**
 * Enables listening for terminal input
 */
function listen(){
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (text) {
        text = text.trim();
        var parts = text.split(" ");
        var name = parts[0];
        var args = parts.slice(1);

        terminal.emit("command", name, args);
    });
}

/**
 * Requests either plugins from local folder or spm official protocols database
 *
 * @param empty True when there are no local protocols installed
 */
function askProtocol(empty){
    if(empty){
        spmProtocolRequest()
    } else {
        var protocolList;

        try {
            protocolList = fs.readdirSync("protocols");
            print("Found " + protocolList.length + " locally stored protocols");
            logProtocols(protocolList, true)
        } catch (err) {
            //could not load plugin folder
            spmProtocolRequest();
        }
    }
}

/**
 * Connects to spm and requests official protocols
 */
function spmProtocolRequest(){
    var officialProtocols = [];
}

/**
 * Logs the protocol initialization to the console
 *
 * @param arr Array of plugin names
 * @param local Boolean, are there local protocols available?
 */
function logProtocols(arr, local){
    if(arr) {
        if(arr.length == 0) {
            print("Could not select and/or download the given protocol", "red");
            process.exit(1);
        }
    }

    try {
        arr.forEach(function(element, index, array) {
            print("[" + (index + 1) + "] " + element);
        });

        if(local){
            print("Protocol can be selected using the command \"spm select -p name\"")
        } else {
            print("Protocol can be selected using the command \"spm install -p name\"")
        }

    } catch(err) {
        print("Could not select and/or download the given protocol", "red");
        process.exit(1);
    }
}

