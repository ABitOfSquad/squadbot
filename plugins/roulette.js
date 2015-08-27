bot.on("command", function(cmd, args) {
    if (cmd == "roulette") {
        api.getMembers(function(members) {
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
            
            api.send("Picking a random squadmember...")
            
            setTimeout(function() {
                if (args) {
                    api.send("It's " + unluckyOne + "!")
                }
                else {
                    api.send("It's +" + unluckyOne + "!")
                }
            }, 3000)
        })
    }
});
