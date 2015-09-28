var events = require("events")
var http = require("http")
var stream = require("stream").Transform
var fs = require("fs")

var implementations = {};
var privateEmitters = {};
var globalPrivate = new events.EventEmitter();

var protocolFile;
var protocolSettings;

global.protocol = new events.EventEmitter();

/**
 * Creates a new wrapper for a protocol
 * @param name name of the protocol
 */
module.exports = function(name) {

    //Load the implementations of this protocol
    try {
        implementations = JSON.parse(fs.readFileSync("protocols/" + name + "/implements.json", "utf8"));
    } catch (err) {
        print("Protocol does not have required file implements.json", "red")
        process.exit()
    }

    //does the implements.json file have the required variables
    if (!JSON.parse(fs.readFileSync("protocols/" + name + "/implements.json", "utf8")).functions || !JSON.parse(fs.readFileSync("protocols/" + name + "/implements.json", "utf8")).events) {
        print("Protocol does not have a valid implements.json file", "red");
        process.exit()
    }

    //load the file!
    protocolFile = require("./protocols/" + name + "/protocol.js");

    //load the protocolSettings into var
    try {
        protocolSettings = JSON.parse(fs.readFileSync("protocols/" + name + "/settings.json", "utf8"))
    } catch (err) {
        print("Could not load protocol settings", "red");
        print(err.stack, "red");
        process.exit()
    }

    //load the emoji policy and the homegroup
    global.emojiPolicy = (protSettings.emojiPolicy !== undefined ? protSettings.emojiPolicy : false);
    protocol.homeGroup = (protSettings.homeGroup !== undefined ? protSettings.homeGroup : false);

    //fire the required init function exported in the protocol file
    _protocol.init(protSettings)
}

/**
 * calls the function in the protocol that's being used
 *
 * @param name name of the protocol
 * @param args args of the function
 * @returns {*}
 */
function passCall(name, args) {
    if (implementations.functions[name]) {
        return protocolFile[name].apply(this, args)
    } else {
        throw new Error("Plugin tried to call the unimplemented protocol function " + name)
    }
}

/**
 * API functions
 * @type {Function}
 */

bot.send =function(msg) {
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

/**
 * Passes events to the API emitter
 * @param event
 * @param id
 * @param args
 */
function passEvent(event, id, args) {
    if (!args) {
        args = []
    }

    if (protocol.homeGroup === id) {
        args.unshift(event)
        bot.emit.apply(this, args)
    } else {
        if (privateEmitters[id]) {
            args.unshift(event)
            privateEmitters[from].emit.apply(this, args)
        }

        globalPrivate.emit.apply(this, args)
    }
}

/**
 * Creates an object from a new message
 */
protocol.on("message", function(from, body, meta) {
    if (body.substring(0, 1) == "!" || body.substring(0, 1) == "/") {
        var parts = body.substring(1).split(" ");
        var event = "command";
        var arg1 = parts[0].toLowerCase();
        var arg2 = parts.slice(1);
        var arg3 = meta
    }
    else {
        var event = "message";
        var arg1 = body;
        var arg2 = meta;
        var arg3 = undefined
    }

    if (protocol.homeGroup == from) {
        bot.emit(event, arg1, arg2, arg3)
    }
    else if (privateEmitters[from]) {
        privateEmitters[from].emit(event, arg1, arg2, arg3)
    }
})

/**
 * Emits all the events
 */
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

protocol.on("finished", function(){
    bot.emit("loadingProtocolDone")
});

/**
 * Handling events and calls using private messaging
 * @param id
 */
function privateEmitter(id) {
    var emitter = new events.EventEmitter()

    if (implementations.functions.private.sendMessage) {
        emitter.send = emitter.sendMessage = function(msg) {
            emitter.in.sendMessage(msg)
        }
    } else {
        emitter.send = emitter.sendMessage = function() {
            throw new Error("Plugin tried use the private().sendMessage api, which is not implemented in this protocol")
        }
    }

    if (implementations.functions.private.sendImage) {
        emitter.sendImage = function(image, caption) {
            emitter.in.sendImage(image, caption)
        }
    } else {
        emitter.sendImage = function() {
            throw new Error("Plugin tried use the private().sendImage api, which is not implemented in this protocol")
        }
    }

    if (implementations.functions.private.sendVideo) {
        emitter.sendVideo = function(video, caption) {
            emitter.in.sendVideo(image, caption)
        }
    } else {
        emitter.sendVideo = function() {
            throw new Error("Plugin tried use the private().sendVideo api, which is not implemented in this protocol")
        }
    }

    if (implementations.functions.private.sendAudio) {
        emitter.sendAudio = function(audio) {
            emitter.in.sendAudio(audio)
        }
    } else {
        emitter.sendAudio = function() {
            throw new Error("Plugin tried use the private().sendAudio api, which is not implemented in this protocol")
        }
    }

    if (implementations.functions.private.sendContact) {
        emitter.sendAudio = function(fields) {
            emitter.in.sendContact(fields)
        }
    } else {
        emitter.sendContact = function() {
            throw new Error("Plugin tried use the private().sendContact api, which is not implemented in this protocol")
        }
    }

    if (implementations.functions.private.sendTyping) {
        emitter.type = emitter.sendTyping = function(duration) {
            emitter.in.sendTyping(duration)
        }
    } else {
        emitter.type = emitter.sendTyping = function() {
            throw new Error("Plugin tried use the private().sendTyping api, which is not implemented in this protocol")
        }
    }

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

    if (!implementations.events.private.video) {
        emitter.on("video", function(video) {
            passEvent("video", [video])
        })
    }

    if (!implementations.events.private.video) {
        emitter.on("location", function(loc) {
            passEvent("location", [loc])
        })
    }
}

protocol.private = function(id) {
    return getPrivateEmitter(id)
}

bot.private = function(id) {
    if (!implementations.functions.private) {
        throw new Error("Plugin tried use the private() api, which is not available for this protocol.")
    }

    return getPrivateEmitter(id);
}

/**
 * Gets the used private emitter
 */
function getPrivateEmitter(id) {
  if (id) {
      if (!privateEmitters[id]) {
          privateEmitters[id] = new privateEmitter(id)
      }

      return privateEmitters[id]
  } else {
      return globalPrivate
  }
}
