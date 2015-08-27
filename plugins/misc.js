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

bot.on("command",function(cmd,args){
	if(cmd === "pirate"){
		require("http");
		var output = "";
		url = "http://isithackday.com/arrpi.php?text="+args.join(" ");

		http.get(url,function(res){
			res.on("data",function(chunk){
				output += chuck;
			}).on("end",function(){
				api.send(output);
			});
		}).on("error",function(e){
			console.log("Pirate error: "+e.message);
		});
	}
});
