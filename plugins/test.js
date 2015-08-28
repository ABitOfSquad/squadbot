bot.on("command", function(cmd, args) {
	if (cmd == "test") { 
        api.admin.check()
    }
})
