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
		http.request({
			host:"http://isithackday.com",
			path:"/arrpi.php?text="+args.join(" ")
		},function(response){
			response.on("data",function(data){
				output += data;
			});
			response.on("end",function(){
				api.send(output);
			});
		}).end();
	}
});
