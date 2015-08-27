bot.on("command", function(cmd, args) {
	if (cmd == "test") { 
        api.sendContact({"name": "You", "phone": "112"})
    }
})
