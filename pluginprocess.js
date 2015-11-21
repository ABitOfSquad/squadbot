var events = require("events");

process.title = "squadbot-plugin"
process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stderr.setEncoding("utf8");
process.stdout.setEncoding("utf8");

global.bot = new events.EventEmitter();

var puginName;
var securityHash;

function send(header, object) {
	if (header === null) {
		header = "SQUADBOT IPC " + securityHash
	}

	var msg = header;

	if (typeof object != "undefined") {
		msg += "\n" + JSON.stringify(object);
	}
	process.stdout.write(msg);
}

send("GET SQUADBOT INIT");

process.stdin.on("data", function(data) {
	if (data.indexOf("SQUADBOT INIT") > -1) {
		data = JSON.parse(data.split("SQUADBOT INIT\n")[1]);

		securityHash = data.hash
		puginName = data.pluginName

		require("./" + data.pluginLocation)

		send(null, {
			"function": "ready"
		});
	}
});

console.log = function(text) {
	send(null, {
		"function": "print",
		"text": text
	});
}
