process.title = "squadbot-plugin"
process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stderr.setEncoding("utf8");
process.stdout.setEncoding("utf8");

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
	}

	//process.stdout.write("SQUADBOT IPC " + "sd" + securityHash)

});


process.stdin.on('end', function(chunk) {
    console.log(">" + "<");
});

(function wait () {
   if (!false) setTimeout(wait, 1000);
})();
