var plugin = {
    "name" : "roulette",
    "description" : "A roulette plugin, that chooses a random unlucky one",
    "authors" : {
        "Lem Severein" : "Creator"
    },
    "collaborators" : {},
    "version" : "1.1",
    "protocol" : "1"
};

bot.on("command", function(cmd, args) {
    if (cmd == "roulette") {
        bot.getMembers(function(members) {
            if (args) {
                var unluckyOne = args[Math.floor(Math.random() * args.length)]
            }
            else {
                var unluckyOne = settings.telnumber
                
                while (unluckyOne == settings.telnumber) {
                    unluckyOne = members[Math.floor(Math.random() * members.length)].jid
                }
            }
            
            console.log(args);
            console.log(members);
            
            bot.send("Picking a random squadmember...")
            
            setTimeout(function() {
                if (args) {
                    bot.send("It's " + unluckyOne + "!")
                }
                else {
                    bot.send("It's +" + unluckyOne + "!")
                }
            }, 3000)
        })
    }
});
