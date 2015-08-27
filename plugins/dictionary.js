var http = require('http');

bot.on("command", function(cmd, args){
    if(cmd.toLowerCase() == "define" || args.length > 1) {
        if (args[0].toLowerCase() == "urban") {
            urbandefine(args[1]);
        }
    }
});

function urbandefine (input){
    var term = input;
    var body = '';

    http.get("http://api.urbandictionary.com/v0/define?term=" + input, function(res){
        if(res.statusCode == 200){
            res.on('data', function (chunk) {
                body += chunk
            });

            res.on('end', function(){
                var _data = JSON.parse(body);
                var data = _data.list[0];
                api.send(input + ": " + data.definition);
                api.send('Example: ' + data.example);
            })
        }
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });

}