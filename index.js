var whapi = require("whatsapi");
var fs = require("fs");
var http = require("http")
var stream = require("stream").Transform
var events = require("events");

var pluginList;
var typingTimeout
var homegroup;

global.settings;
global.print = function print(text) {
    var d = new Date()
    var h = (d.getHours() < 10 ? "0" : "") + d.getHours()
    var m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes()
    var s = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds()

    console.log("[" + h + ":" + m + ":" + s + "] " + text)
}

global.bot = new events.EventEmitter()
bot.setMaxListeners(250)

var emojis = JSON.parse(fs.readFileSync("emoji.json", "utf8"))

// console.log(process.argv[process.argv.length - 1]);

/**
 * INITIALIZATION
 */
// LOAD SETTINGS
try {
    settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'))
} catch (err) {
    print("could not load settings file");
    process.exit();
}
print("Settings loaded");
// LOAD PLUGINS
try {
    pluginList = fs.readdirSync("plugins")
} catch (err) {
    pluginList = false;
    print("Could not load contents of plugin folder");
    process.exit();
}
if (pluginList) {
    if (pluginList.length == 0) {
        print("No plugins found")
    }
    else {
        for (var i = 0; i < pluginList.length; i++) {
            print("Loading " + pluginList[i] + "...")

            try {
                var plugin = require("./plugins/" + pluginList[i])
            } catch (err) {
                print("Plugin " + pluginList[i] + " crashed with the following error:")
                console.log(err.stack);
            }
        }
    }

    print("All plugins loaded")
}
print("Plugins loaded");
//WHATSAPI INIT
var wa = whapi.createAdapter({
    msisdn: settings["telnumber"], // phone number with country code
    username: settings["displayname"], // your name on WhatsApp
    password: settings["whatsapp_pass"], // WhatsApp password
    ccode: '44' // country code
});
wa.setMaxListeners(250)

wa.connect(function connected(err) {
    if (err) { console.log(err); return; }
    print('Connected');
    // Now login
    wa.login(logged);
});

function logged(err) {
    if (err) { console.log(err); return; }
    print('Logged in to WA server');
    wa.sendIsOnline();
    print("Getting groups");

    wa.requestGroupsList(function(err, groups) {
        groups.forEach(function(g) {
            print('Name: ' + g.subject + ', Participants: ' + g.participants.length);

            //recognize main beta group
            if(g.groupId == settings["group_id"]){
                homegroup = g;
                //console.log(g);
                //console.log(homegroup);
                print("Found squadbot's home group");
            }
        });

        if(!homegroup) {
            print("could not find group...")
            process.exit();
        }

        wa.on('receivedMessage', function(message) {
            parseMessage(message);
            wa.sendMessageReceipt(message);
        });

        wa.on("receivedLocation", function(loc) {
            bot.emit("location", loc)
        });
    });

}

function encodeEmoji(msg) {
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

function parseMessage(msg) {
    if (msg.body.substring(0, 1) == "!" || msg.body.substring(0, 1) == "/") {
        var parts = msg.body.substring(1).split(" ");
        bot.emit("command", parts[0].toLowerCase(), parts.slice(1))
    } else {
        bot.emit("message", msg.body, msg);
    }
}

function handleReceivedEvents(id, emitter, err, deleteTmp) {
    function recv(args) {
        if (args.id == id) {
            emitter.emit(args.type, args.from, args.time)
        }
    }
    
    if (err) {
        console.log(err.message);
        return; 
    }
    
    emitter.emit("send")
    
    wa.on("clientReceived", recv)
    
    if (deleteTmp) {
        fs.unlink(deleteTmp, function() {})
    }
    
    setTimeout(function () {
        wa.removeListener("clientReceived", recv);
    }, 100);
}

bot.send = bot.sendMessage = function(msg) {
    emitter = new events.EventEmitter();
    
    try {
        wa.sendMessage(settings["group_id"], encodeEmoji(msg), function(err, id) {handleReceivedEvents(id, emitter, err)});
    } catch (err) {
        emitter.emit("error", err)
    } 
    
    return emitter
};

bot.sendImage = function(image, caption) {
    emitter = new events.EventEmitter();
    
    try {
        if (image.substring(0, 7) == "http://") {
            http.request(image, function(response) {
    			var data = new stream()
    			
    			response.on("data", function(chunk) {
    				data.push(chunk)
    			})
    			
    			response.on("end", function() { 
    				fs.writeFileSync("./tmp/image.jpg", data.read())
                    
                    wa.sendImage(settings["group_id"], "./tmp/image.jpg", typeof caption === "string" ? encodeEmoji(caption) : undefined, function(err, id) {
                        handleReceivedEvents(id, emitter, err, "./tmp/image.jpg")
                    });
    			});
    		}).end()
        }
        else {
            wa.sendImage(settings["group_id"], image, typeof caption === "string" ? encodeEmoji(caption) : undefined, function(err, id) {
                handleReceivedEvents(id, emitter, err)
            });
        }
        
        
    } catch (err) {
        emitter.emit("error", err)
    } 
    
    return emitter
};

bot.sendContact = function(fields) {
    emitter = new events.EventEmitter();
    
    try {
        var vcard = "BEGIN:VCARD"
        vcard += "\nVERSION:3.0"
        
        if (!fields.name) {
            throw "Missing contact name"
        }
        
        for (var key in fields) {
           if (fields.hasOwnProperty(key)) {
               switch (key) {
                   case "name":
                        vcard += "\nN:" + encodeEmoji(fields[key])
                        vcard += "\nFN:" + encodeEmoji(fields[key])
                        break;
                   case "phone":
                        vcard += "\nTEL;TYPE=voice,home,pref:" + fields[key]
                        break;
                   case "email":
                        vcard += "\nEMAIL:" + fields[key]
                        break;
                   default:
                        throw "Unknown field " + key
               }
           }
       }
       
       vcard += "\nEND:VCARD"
       
       fs.writeFileSync("./tmp/vcard.vcf", vcard)
       wa.sendVcard(settings["group_id"], "./tmp/vcard.vcf", fields.name, function(err, id) {handleReceivedEvents(id, emitter, err, "./tmp/vcard.vcf")})
    } catch (err) {
        emitter.emit("error", err)
    } 
    
    return emitter
};

bot.type = bot.sendTyping = function(duration) {
    wa.sendComposingState(settings["group_id"])
        
    typingTimeout = setTimeout(function() {
        wa.sendPausedState(settings["group_id"])
    }, duration)
}

bot.getMembers = function (callback) {
    wa.requestGroupInfo(settings["group_id"], function(err, group) {
        if (!err) {
            try {
                callback(group.participants)
            } catch (err) {
                console.log(err.stack);
            }
        }
    });
};

bot.admin = {
    "check": function checkIfAdmin(callback) {
        wa.requestGroupInfo(settings["group_id"], function(err, data) {
            if (err) {
                try {
                    callback(err, null)
                } catch (err) {
                    console.log(err.stack);
                }
                return
            }
            
            for (var i = 0; i < data.participants.length; i++) {
                if (data.participants[i].jid.split("@")[0] == settings["telnumber"]) {
                    try {
                        callback(false, data.participants[i].admin)
                    } catch (err) {
                        console.log(err.stack);
                    }
                    
                    console.log(data.participants[i]);
                }
            }
        })
    }
}
