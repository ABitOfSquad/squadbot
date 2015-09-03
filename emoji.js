var fs = require("fs");

var emojis = JSON.parse(fs.readFileSync("./assets/emoji.json", "utf8"));

exports.parse = function(msg) {
    if (!msg) {
        return
    }

    var parts = msg.split(":")
    var output = ""

    for (var i = 0; i < parts.length; i++) {
        if (emojis[parts[i]]) {
            output += emojis[parts[i]]
        }
        else {
            if (i != 0 && !emojis[parts[i - 1]]) {
                output += ":"
            }

            output += parts[i]
        }
    }

    return output
}
