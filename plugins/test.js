bot.private.on("message", function(msg, who) {
	bot.private.sendImage(who, "https://www.google.nl/images/srpr/logo11w.png")
})

bot.on("command", function(cmd, args) {
	if (cmd == "test") { 
        bot.sendImage("https://www.google.nl/images/srpr/logo11w.png")
    }
})
