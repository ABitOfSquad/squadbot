bot.private().on("message", function(from, args, meta) {
	
	console.log(arguments);
	bot.private(from).send("You said something?")
	bot.private(from).on("command", function(from, args, meta) {
		console.log(from + "sd");
	})
})
