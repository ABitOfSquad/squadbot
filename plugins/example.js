bot.on("message", function(body, raw){
    if(body.toLowerCase() == "squadbot"){
        bot.send("Yes? I heard my name?")
    }

});

bot.on("command", function(cmd, args){
    if(cmd == "say"){
        bot.send(args.join(" "))
    }
});
