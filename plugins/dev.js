exports.plugin = {
    "name" : "development",
    "description" : "Monitoring information",
    "authors" : {
        "Nick" : "Creator"
    },
    "reservedCommands": ["nerd"],
    "collaborators" : {},
    "version" : "0.1.0",
    "protocol" : "1"
};

bot.on("command", function(cmd, args){
    if(cmd == "nerd"){
        if(args.length > 0){
            if(args[0] == "ram"){
                bot.send("Current RAM usage: " + getMemoryString())
            } else if(args[0] == "uptime") {
                bot.send("Current bot uptime: " + getUptimeString())
            } else if(args[0] == "system"){
                bot.send("Squadbot is currently running on a")
            }
        }
    }
});

function getMemoryString(){
    var mem = process.memoryUsage().rss;
    console.log(mem);
    return formatSizeUnits(mem);
}

function getUptimeString(){
    var uptime = Math.floor(process.uptime());
    var hours = parseInt( uptime / 3600 ) % 24;
    var minutes = parseInt( uptime / 60 ) % 60;
    var seconds = uptime % 60;

    return (hours < 10 ? "0" + hours : hours) + " Hours, " + (minutes < 10 ? "0" + minutes : minutes) + " Minutes, " + (seconds  < 10 ? "0" + seconds : seconds) + " Seconds"
}

function formatSizeUnits(bytes){
    if      (bytes>=1000000000) {bytes=(bytes/1000000000).toFixed(2)+ ' GB';}
    else if (bytes>=1000000)    {bytes=(bytes/1000000).toFixed(2)+' MB';}
    else if (bytes>=1000)       {bytes=(bytes/1000).toFixed(2)+' KB';}
    else if (bytes>1)           {bytes=bytes+' bytes';}
    else if (bytes==1)          {bytes=bytes+' byte';}
    else                        {bytes='0 byte';}
    return bytes;
}

