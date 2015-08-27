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
		api.send("xDxDxD");
	}
});
