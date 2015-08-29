var whapi = require("whatsapi")
var events = require("events");

var globalPrivate = new events.EventEmitter()
var settings
var typingTimeout
var wa

exports.init = function(loadedSettings) {
    settings = loadedSettings
    
    wa = whapi.createAdapter({
        msisdn: settings["whatsapp"]["telnumber"], // phone number with country code
        username: settings["whatsapp"]["displayname"], // your name on WhatsApp
        password: settings["whatsapp"]["whatsapp_pass"], // WhatsApp password
        ccode: settings["whatsapp"]["telnumber"].substring(0, 1) // country code
    });

    wa.setMaxListeners(250)

    wa.connect(function connected(err) {
        if (err) {
            return console.log(err)
        }
        
        print("Connected");
        wa.login(logged);
    });
}

function logged(err) {
    if (err) { console.log(err); return; }
    print('Logged in to WA server');
    wa.sendIsOnline();
    print("Getting groups");

    wa.requestGroupsList(function(err, groups) {
        groups.forEach(function(g) {
            print('Name: ' + g.subject + ', Participants: ' + g.participants.length);

            //recognize main beta group
            if(g.groupId == settings["whatsapp"]["group_id"]){
                homegroup = g;
                print("Found squadbot's home group");
            }
        });

        if(!homegroup) {
            print("Could not find group")
            process.exit();
        }

        wa.on("receivedMessage", function(message) {
            if (message.from.split("@")[0] == settings["group_id"]) {
                
                if (message.body.substring(0, 1) == "!" || message.body.substring(0, 1) == "/") {
                    var parts = message.body.substring(1).split(" ");
                    
                    bot.emit("command", parts[0].toLowerCase(), parts.slice(1), message)
                } else {
                    bot.emit("message", message.body, message);
                }
            }
            else if (!message.isGroup) {
                if (message.body.substring(0, 1) == "!" || message.body.substring(0, 1) == "/") {
                    var parts = message.body.substring(1).split(" ");
                    
                    bot.private(message.from).emit("command", message.from, parts[0].toLowerCase(), parts.slice(1), message)
                } else {
                    bot.private(message.from).emit("message", message.from, message.body, message);
                }
            }
            
            wa.sendMessageReceipt(message);
        })

        wa.on("receivedLocation", function(loc) {
            if (loc.from.split("@")[0] == settings["group_id"]) {
                bot.emit("location", loc)
            }
            else if (loc.from.split("@")[1] != "g.us") {
                globalPrivate.emit("location:" + from, loc)
            }
        })
        
        function getMedia(url, callback) {
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var file = "./tmp/tmp-" + Math.round(Math.random() * 10000000)
                            
                    fs.writeFileSync(file, body)
                    console.log(file);
                }
            })
            // http.request(url, function(response) {
            //     var data = new stream()
            //     
            //     response.on("data", function(chunk) {
            //         data.push(chunk)
            //     })
            //     
            //     response.on("error", function(err) {
            //         throw "Error while downloading incoming media"
            //     });
            //     
            //     response.on("end", function() {
            //         var file = "./tmp/tmp-" + Math.round(Math.random() * 10000000) + "." + suffix
            //         
            //         fs.writeFileSync(file, data.read())
            //         callback(file)
            //     });
            // }).end()
        }
        
        wa.on("receivedImage", function(image) {
            console.log(image);
            if (image.from.split("@")[0] == settings["group_id"] || image.from.split("@")[1] != "g.us") {
                getMedia(image.url, function(file) {
                    console.log(file);
                })
            }
        })

        wa.on("presence", function(pres) {
            var event = pres.type == "available" ? "online" : "offline"
            
            globalPrivate.emit(event + ":" + pres.from)
        })

        wa.on("typing", function(type, from, author) {
            var event = type == "composing" ? "typing" : "stopedTyping"
            
            if (from.split("@")[0] == settings["group_id"]) {
                bot.emit(event, author)
            }
            else if (from.split("@")[1] != "g.us") {
                globalPrivate.emit(event + ":" + from)
            }
        })
    });

}

function handleReceivedEvents(id, emitter, err) {
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
    
    setTimeout(function () {
        wa.removeListener("clientReceived", recv);
    }, 900000); // Remove after 15 min to free memory
}

bot.send = bot.sendMessage = function(msg, to) {
    emitter = new events.EventEmitter();
    
    var to = to ? to : settings["group_id"]
    
    try {
        wa.sendMessage(to, encodeEmoji(msg), function(err, id) {handleReceivedEvents(id, emitter, err)});
    } catch (err) {
        emitter.emit("error", err)
    } 
    
    return emitter
}

bot.sendImage = function(image, caption) {return sendMedia(image, ["image/jpeg", "image/png"], "png", "sendImage", caption)}
bot.sendVideo = function(video, caption) {return sendMedia(video, ["video/mp4"], "mp4", "sendVideo", caption)}
bot.sendAudio = function(audio) {return sendMedia(audio, ["audio/mpeg", "audio/x-wav"], "mp3", "sendAudio")}

function sendMedia(location, mimes, suffix, type, caption, to) {
    emitter = new events.EventEmitter();
    
    if (type == "sendAudio") {
        var to = caption ? caption : settings["group_id"]
    }
    else {
        var to = to ? to : settings["group_id"]
    }
    
    try {
        if (location.substring(0, 7) == "http://") {
            http.request(location, function(response) {
                if (mimes) {
                    if (response.headers["content-type"]) {
                        if (mimes.indexOf(response.headers["content-type"]) == -1) {
                            emitter.emit("err", "Server sends an unsupported file type")
                        }
                    }
                }
                var data = new stream()
                
                response.on("data", function(chunk) {
                    data.push(chunk)
                })
                
                response.on("error", function(err) {
                    emitter.emit("error", err.message)
                });
                
                response.on("end", function() {
                    var file = "./tmp/tmp-" + Math.round(Math.random() * 10000000) + "." + suffix
                    
                    fs.writeFileSync(file, data.read())
                    
                    if (type == "sendAudio") {
                        wa[type](to, file, function(err, id) {handleReceivedEvents(id, emitter, err)})
                    }
                    else {
                        wa[type](to, file, encodeEmoji(caption), function(err, id) {handleReceivedEvents(id, emitter, err)})
                    }
                });
            }).end()
        }
        else {
            if (type == "sendAudio") {
                wa[type](to, location, function(err, id) {handleReceivedEvents(id, emitter, err)})
            }
            else {
                wa[type](to, location, encodeEmoji(caption), function(err, id) {handleReceivedEvents(id, emitter, err)})
            }
        }
        
        
    } catch (err) {
        console.log(err.stack);
        emitter.emit("err", err.message)
    } 
    
    return emitter
}


bot.sendContact = function(fields, to) {
    emitter = new events.EventEmitter();
    var to = to ? to : settings["group_id"]
    
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
       wa.sendVcard(to, "./tmp/vcard.vcf", fields.name, function(err, id) {handleReceivedEvents(id, emitter, err, "./tmp/vcard.vcf")})
    } catch (err) {
        emitter.emit("err", err)
    } 
    
    return emitter
};

bot.type = bot.sendTyping = function(duration, to) {
    var to = to ? to : settings["group_id"]
    wa.sendComposingState(to)
        
    typingTimeout = setTimeout(function() {
        wa.sendPausedState(sto)
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

bot.private = function(id) {
    var ob = {}
    ob.sub = false
    
    ob.on = function(event, callback) {
        if (event == "online" || event == "online") {
            if (!id) {
                return
            }
            
            if (!ob.sub) {
                wa.sendPresenceSubscription(id)
                ob.sub = true
            }
            
            globalPrivate.on(event + ":" + id, function() {callback.apply(callback, arguments)})
        }
        else {
            if (!id) {
                globalPrivate.on(event, function() {callback.apply(callback, arguments)})
            }
            else {
                globalPrivate.on(event + ":" + id, function() {callback.apply(callback, arguments)})
            }
        }
        
    }
    
    ob.emit = function() {
        if (!id) {
            throw "Tried to emit to a private without an ID."
        }
        else {
            globalPrivate.emit.apply(globalPrivate, arguments)
            
            arguments["0"] = arguments["0"] + ":" + id
            globalPrivate.emit.apply(globalPrivate, arguments)
            
        }
    }
    
    if (id) {
        ob.send = function(msg) {bot.sendMessage(msg, id)}
        ob.sendMessage = function(msg) {bot.sendMessage(msg, id)}
        ob.sendImage = function(image, caption) {return sendMedia(image, ["image/jpeg", "image/png"], "png", "sendImage", caption, id)}
        ob.sendVideo = function(video, caption) {return sendMedia(video, ["video/mp4"], "mp4", "sendVideo", caption, id)}
        ob.sendAudio = function(audio) {return sendMedia(audio, ["audio/mpeg", "audio/x-wav"], "mp3", "sendAudio", id)}
        ob.sendContact = function(fields) {bot.sendContact(fields, id)}
        ob.type = function(duration) {bot.sendTyping(duration, id)}
        ob.sendTyping = function(duration) {bot.sendTyping(duration, id)}
        
        
    }
    
    return ob
}

bot.admin = {}
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
