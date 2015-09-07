var events = require("events")
var http = require("http")
var stream = require("stream").Transform
var fs = require("fs")

var implements = {}
var privateEmitters = {}
var globalPrivate = new events.EventEmitter()

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
    console.log(from);
    console.log(body + "<_");
    if (body.substring(0, 1) == "!" || body.substring(0, 1) == "/") {
        var parts = body.substring(1).split(" ");
        var event = "command"
        var arg1 = parts[0].toLowerCase()
        var arg2 = parts.slice(1)
        var arg3 = meta
    }
    else {
        var event = "message"
        var arg1 = body
        var arg2 = meta
        var arg3 = undefined
    }
    
    if (protocol.homeGroup == from) {
        bot.emit(event, arg1, arg2, arg3)
    }
    else if (privateEmitters[from]) {
        privateEmitters[from].emit(event, arg1, arg2, arg3)
    }
})

function passEvent(event, id, args) {
    if (!args) {
        args = []
    }
    
    if (protocol.homeGroup == id) {
        args.unshift(event)
        bot.emit.apply(this, args)
    }
    else {
        if (privateEmitters[id]) {
            args.unshift(event)
            privateEmitters[from].emit.apply(this, args)
        }
        
        globalPrivate.emit.apply(this, args)
    }
}

protocol.on("typing", function(id, author) {
    passEvent("typing", id, [author])
})

protocol.on("stopedTyping", function(id, author) {
    passEvent("stopedTyping", id, [author])
})

protocol.on("image", function(id, image) {
    passEvent("image", id, [image])
})

protocol.on("audio", function(id, audio) {
    passEvent("audio", id, [audio])
})

protocol.on("video", function(id, video) {
    passEvent("video", id, [video])
})

protocol.on("location", function(id, loc) {
    passEvent("location", id, [loc])
})

function privateEmitter(id) {
    function passEvent(event, args) {
        if (!args) {
            args = []
        }
        
        emitter.apply(this, args)
    }
    
    var emitter = new events.EventEmitter()
    
    emitter.on("typing", function(author) {
        passEvent("typing", [author])
    })

    emitter.on("stopedTyping", function(author) {
        passEvent("stopedTyping", [author])
    })

    emitter.on("image", function(image) {
        passEvent("image", [image])
    })

    emitter.on("audio", function(audio) {
        passEvent("audio", [audio])
    })
    
    if (!implements.events.private.video) {
        emitter.on("video", function(video) {
            passEvent("video", [video])
        })
    }
    
    if (!implements.events.private.video) {
        emitter.on("location", function(loc) {
            passEvent("location", [loc])
        })
    }
}

protocol.private = function(id) {
    if (id) {
        if (!privateEmitters[id]) {
            privateEmitters[id] = 
        }
        
        var emitter = privateEmitters[id]
    }
    else {
        var emitter = globalPrivate
    }
    
    

    
    
    return emitter
}

bot.private = function(id) {
    if (!implements.functions.private) {
        throw new Error("Plugin tried use the private() api, which is not available for this protocol.")
    }

    if (id) {
        if (!privateEmitters[id]) {
            privateEmitters[id] = new events.EventEmitter()
        }
        
        var emitter = privateEmitters[id]
    }
    else {
        var emitter = globalPrivate
    }
    
    /// OLD ///////////////////////// OLD ////////////////////////// OLD ////////////////////////////////// OLD ///////////////////////////////
    
    function passCall(name, args) {
        if (implements.functions[name]) {
            return protocol[name].apply(this, args)
        }
        else {
            throw new Error("Plugin tried to call the unimplemented protocol function " + name)
        }
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
