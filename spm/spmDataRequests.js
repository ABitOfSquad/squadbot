/**
 * File to handle small data requests to SPM server
 *
 * - getProtocolsList (DONE)
 * - doesProtocolExist
 * - doesPluginExist
 */
var net = require("net");
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
 * gets the official protocols available on spm server
 * @return Array List of protocols available on server
 */
exports.getSpmProtocols = function(callback) {
    try {
        connect();
        client.write('{"type": "getProtocolList"}');
    } catch(err) {
        print("Something went wrong sending data, could not ask for ProtocolList", "red");
        return [];
    }

    var list;

    client.on("data", function(data) {

        try {
            var response = JSON.parse(data.toString("utf-8"));
            if(!response.type){
                print("Invalid response: No type specified", "red");
            } else if(response.type === "protocolList" && response.data !== undefined) {
                list = response.data;

                if(list.length == 0) {
                    print("Recieved empty array, perhaps the spm server you're connected to is rebooting.", "red");
                    print("Please restart squadbot and try again.", "red");
                    process.exit(1000);
                }

                callback(list);
            } else {
                print("Did not get expected response.", "red");
            }
        } catch(err) {
            print("Recieved a invalid response, something went wrong at spm global servers, please try again later", "red");
            process.exit(1000);
        }
    });

    client.on("error", function(data) {
        print("Something went wrong with the connection", "red");
        process.exit()
    });
};