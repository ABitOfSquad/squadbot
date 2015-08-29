var http = require("http");
var https = require("https");

exports.plugin = {
	"name" : "misc",
	"description" : "Lots of inside jokes, lots of crap",
	"authors" : {
		"Daniel Mizrachi" : "XD"
	},
	"reservedCommands": ["pirate", "yoda"],
	"collaborators" : {},
	"version" : "1",
	"protocol" : "1"
};

// xD detection
bot.on("message",function(body,raw){
	if(body.toLowerCase().indexOf("xd") !== -1){
		bot.send("xDxDxDxDxD!!!1!1!!1!");
	}
});

// Pirate and Yoda speech
bot.on("command",function(cmd,args){
	if(cmd === "pirate"){
		var output = "";
		url = "http://postlikeapirate.com/AJAXtranslate.php?typing="+args.join(" ");
		http.get(url,function(res){
			res.on("data",function(chunk){
				output += chunk;
			}).on("end",function(){
				bot.send(output);
			});
		}).on("error",function(e){
			console.log("Pirate get request error: "+e.message);
		});
	}else if(cmd === "yoda"){
		var output = "";
		options = {
			hostname:"yoda.p.mashape.com",
			path:"/yoda?sentence="+encodeURI(args.join(" ")),
			port:443,
			headers:{
				"X-Mashape-Key":"LGVW4htPZXmshztTZRf2fnihw7rNp1nQB6PjsnVGHPOT5HhHVD"
			}
		}
		https.get(options,function(res){
			res.on("data",function(chunk){
				output += chunk;
			}).on("end",function(){
				bot.send(output);
			});
		}).on("error",function(e){
			console.log("Yoda get request error: "+e.message);
		});
	}
});
