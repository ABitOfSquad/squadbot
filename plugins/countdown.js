var exports.plugin = {
	"name" : "countdown",
	"description" : "Choose a combination of nine random vowels or consonants and make your longest possible word out of them.",
	"authors" : {
		"Daniel Mizrachi" : "Creator"
	},
	"collaborators" : {},
	"version" : "0.1.0",
	"protocol" : "1"
}

var playing = false, submitting = false, submitted = {};

bot.on("command",function(cmd,args){
	function s(n){
		return (n === 1 ? "" : "s");
	}
	Array.prototype.random = function(){
		return this[Math.floor(Math.random()*this.length)];
	}

	if(cmd === "countdown"){
		if(playing){
			bot.send("Oops, looks like somebody has already started a game of countdown!");
		}else{
			if(args.length > 8){
				playing = true;
				https = require("https");
				var letters = {
					"v":["a","e","i","o","u"],
					"c":["b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","y","z"]
				}
				var selected = [];

				if(args.every(function(val){
					return val.toLowerCase() === "v" || val.toLowerCase() === "c";
				})){
					args.forEach(function(val,key){
						val = val.toLowerCase();
						selected.push(letters[val].random());
					}
				}

				selectedStr = selected.join(" ").toUpperCase();
				bot.send(":watch: Welcome to countdown! :watch:\n\nThe letters are:\n"+selectedStr+"\n\nMake the longest possible (English) word you can think of out of these letters.\n\nStarting in 3...");
				setTimeout(function(){
					bot.send("2...");
					setTimeout(function(){
						bot.send("1...");
						setTimeout(function(){
							bot.send("Go!");
							setTimeout(function(){
								bot.send(selectedStr+"\n10 seconds left...");
								setTimeout(function(){
									bot.send("3...");
									setTimeout(function(){
										bot.send("2...");
										setTimeout(function(){
											bot.send("1...");
											setTimeout(function(){
												bot.send("Stop! Now you have 5 seconds to send me your longest word in private chat. Go!");
												submitting = true;
												setTimeout(function(){
													bot.send("Stop! Checking your words...");
													submitting = false, ok = {}, index = 0;
													for(var i in submitted){
														var output = "";
														options = {
															hostname:"dictionary.cambridge.org",
															path:"/api/v1/dictionaries/british/entries/"+word,
															port:443,
															headers:{
																"accessKey":"wtPhJrZsNZMuopBtMlWTyrutB37E0qi2BPJx58VZbtlMhWEQPxebNBOH4VPp7FOo"
															}
														}
														https.get(options,function(res){
															res.on("data",function(chunk){
																output += chunk;
															}).on("end",function(){
																data = JSON.parse(output);
																if(res.entryId){
																	ok[index] = i;
																}else{
																	bot.send("Oops, "+i+"'s word was not a word and won't be included!");
																}
															});
														}).on("error",function(e){
															console.log("Countdown get request error: "+e.message);
														});
														index++;
													}

													longest = [0,""], index = 0;
													for(var name in ok){
														word = ok[name];
														if(word.length > longest[0]){
															longest = [word.length,name];
														}
														index++;
													}
													bot.send("The results are in. And the winner is...");
													setTimeout(function(){
														bot.send(longest[1]+", with "+longest[0].toLowerCase()+" at "+longest[0].length+" letters long! Well done!");
													},1000);
												},5000);
											},1000);
										},1000);
									},1000);
								},2000);
							},20000);
						},1000);
					},1000);
				},1000);
			}else{
				bot.send("Type /countdown <v or c> <v or c> <v or c>... for 9 letters to begin play!");
			}
		}
	}
});

bot.private().on("message",function(body,meta){
	if(playing){
		if(submitting){
			if(submitted[meta.from])
				bot.private(meta.from).send("Oops, you've already submitted a word!");
			}else{
				if(body.length > 1 && body.length < 10){
					body = body.toUpperCase();
					if(/^[A-Z]+$/.test(body)){
						submitted[meta.notify] = body;
						bot.private(meta.from).send("Thanks. Now return to the group chat to see the results!");
					}else{
						bot.private(meta.from).send("Oops, your word contains more than just letters. Quick, try again!");
					}
				}else{
					bot.private(meta.from).send("Oops, your letter must be minimum 2 and maximum 9 letters long!");
				}
			}
		}
	}
});
