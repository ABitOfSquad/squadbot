exports.plugin = {
	// "reservedCommands": ["hangman"]
};

try {
	bot.private().on("message", function(from, args, meta) {
		bot.private(from).on("online", function() {console.log("online");})
		bot.private(from).on("typing", function() {console.log("typing");})

		// console.log(arguments);
		// bot.private(from).send("You said something?")
		// bot.private(from).on("command", function(from, args, meta) {
		// 	console.log(from + "sd");
		// })
	})
} catch(err){
	print("Could not access private functions for this protocol (test.js)", "red")
}

