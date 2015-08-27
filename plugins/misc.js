var http = require("http");

var plugin = {
	"name" : "misc",
	"description" : "Lots of inside jokes, lots of crap",
	"authors" : {
		"Daniel Mizrachi" : "XD"
	},
	"collaborators" : {},
	"version" : "1",
	"protocol" : "1"
};

// xD detection
bot.on("message",function(body,raw){
	if(body.toLowerCase().indexOf("xd") !== -1){
		api.send("xDxDxDxDxD!!!1!1!!1!");
	}
});

// Pirate and Yoda speech
bot.on("command",function(cmd,args){
	if(["pirate","yoda"].indexOf(cmd) !== -1){
		var output = "";
		urls = {
			"pirate":["postlikeapirate.com","/AJAXtranslate.php?typing="],
			"yoda":["yoda.p.mashape.com","/yoda?sentence="]
		}
		options = {
			hostname:urls[cmd][0],
			path:urls[cmd][1]+encodeURI(args.join(" ")),
			headers:(cmd === "yoda" ? {"X-Mashape-Key":"LGVW4htPZXmshztTZRf2fnihw7rNp1nQB6PjsnVGHPOT5HhHVD"} : {})
		}

		http.get(options,function(res){
			res.on("data",function(chunk){
				output += chunk;
			}).on("end",function(){
				api.send(output);
			});
		}).on("error",function(e){
			console.log(cmd+" get request error: "+e.message);
		});
	}
});
