bot.on("message", function(body, raw){
    if(body.toLowerCase() == "squadbot"){
        api.send("Yes? I heard my name?")
    }

});

bot.on("command", function(cmd, args){
    if(cmd == "say"){
        api.send(args.join(" "))
    }
});


