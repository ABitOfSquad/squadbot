var stagesOfHang = [
    "`  -------  \n" +
    "`  |     |  \n" +
    "`  |     O  \n" +
    "`  |    \\|/ \n" +
    "`  |     |  \n" +
    "`  |     /\\ \n" +
    "`  |      \n"

]

bot.on("command", function(cmd, args) {
	if (cmd == "hangman") {
        bot.send(stagesOfHang[0])
	}
})
