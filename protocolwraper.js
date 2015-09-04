var events = require("events")
var http = require("http")
var stream = require("stream").Transform
var fs = require("fs")

var implements = {}
var privateEmitters = {}

global.protocol = new events.EventEmitter()

module.exports = function(name) {
    try {
        implements = JSON.parse(fs.readFileSync("protocols/" + name + "/implements.json", "utf8"))
    } 
    catch (err) {
        print("Protocol does not have required file implements.json", "red")
        process.exit()
    }
    
    if (!implements.functions || !implements.events) {
        print("Protocol does not have a valid mplements.json file", "red")
        process.exit()
    }
    
    



    var protocol = require("./protocols/" + name + "/protocol.js")

    try {
        var protSettings = JSON.parse(fs.readFileSync("protocols/" + name + "/settings.json", "utf8"))
    }
    catch (err) {
        print("Could not load protocol settings", "red")
        console.log(err.stack);
        process.exit()
    }
    

    if (protSettings.emojiPolicy) {
        global.emojiPolicy = protSettings.emojiPolicy
    }
    
    if (protSettings.homeGroup) {
        protocol.homeGroup = protSettings.homeGroup
    }

    protocol.init(protSettings)
}

function passCall(name, args) {
    if (implements.functions[name]) {
        return protocol[name].apply(this, args)
    }
    else {
        throw new Error("Plugin tried to call the unimplemented protocol function " + name)
    }
}

bot.send = bot.sendMessage = function(msg) {
    return passCall("sendMessage", [msg])
}

bot.sendImage = function(image, caption) {
    return passCall("sendImage", [image, caption])
}

bot.sendVideo = function(video, caption) {
    return passCall("sendVideo", [video, caption])
}

bot.sendAudio = function(audio) {
    return passCall("sendAudio", [audio])
}

bot.sendContact = function(fields) {
    return passCall("sendContact", [fields])
}

bot.type = bot.sendTyping = function(duration) {
    return passCall("sendTyping", [duration])
}

bot.getMembers = function(callback) {
    return passCall("getMembers", [callback])
}

protocol.on("message", function(from, body, meta) {
    console.log("sn");
    if (body.substring(0, 1) == "!" || body.substring(0, 1) == "/") {
        var parts = body.substring(1).split(" ");
        var payload = ["command", parts[0].toLowerCase(), parts.slice(1), meta]
    }
    else {
        var payload = ["message", body, meta]
    }
    
    if (protocol.homeGroup == from) {
        bot.emit.apply(this, payload)
    }
    else if (privateEmitters[from]) {
        privateEmitters[from].emit.apply(this, args.unshift(event))
    }
})

function passEvent(event, id, args) {
    if (!args) {
        args = []
    }
    
    if (protocol.homeGroup == id) {
        bot.emit.apply(this, args.unshift(event))
    }
    else if (privateEmitters[id]) {
        privateEmitters[from].emit.apply(this, args.unshift(event))
    }
}


protocol.on("online", function(id) {
    passEvent("online", id)
})

protocol.on("offline", function(id) {
    passEvent("offline", id)
})

protocol.on("typing", function(id, author) {
    passEvent("typing", id, author)
})

protocol.on("stopedTyping", function(id, author) {
    passEvent("stopedTyping", id, author)
})

protocol.on("location", function(id, loc) {
    passEvent("location", id, args)
})



// do ti
bot.private = function(id) {
    if (id) {
        if (!privateEmitters[id]) {
            privateEmitters[id] = new events.EventEmitter()
        }
        
        var emitter = privateEmitters[id]
    }
    else {
        var emitter = new events.EventEmitter()
    }
    
    console.log(emitter);
    
    emitter.on("hai")
    
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
    
    return emitter
}
