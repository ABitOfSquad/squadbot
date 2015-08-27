// xD detection
bot.on("message",function(body,raw){
	if(body.toLowerCase().indexOf("xd") !== -1){
		api.send("xDxDxD");
	}
});
