bot.on("command", function(cmd, args, meta) {
	if (cmd == "dan") {
		bot.private.send(meta.author, "You said something?")
    }
})
