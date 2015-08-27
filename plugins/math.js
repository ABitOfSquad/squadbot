var plugin = {
	"name" : "math",
	"description" : "A compilation of several math functions",
	"authors" : {
		"Daniel Mizrachi" : "Creator"
	},
	"collaborators" : {
		"Nick Vernij" : "minor bug fixes"
	},
	"version" : "0.1.1",
	"protocol" : "1"
};

// Evaluate equation in the form number[+|-|*|/|^|%]number
bot.on("message",function(body,raw){
	if(/^[0-9]+(\+|-|\*|\/|\^|%)[0-9]+$/.test(body)){
		ops = /(\+|-|\*|\/|\^|%)/;
		nums = body.split(ops);
		ans = 0;
		switch(ops.exec(body)[0]){
			case "+":
				ans = nums[0]+nums[1];
				break;
			case "-":
				ans = nums[0]-nums[1];
				break;
			case "*":
				ans = nums[0]*nums[1];
				break;
			case "/":
				ans = nums[0]/nums[1];
				break;
			case "^":
				ans = Math.pow(nums[0],nums[1]);
				break;
			case "%":
				ans = nums[0]%nums[1];
		}
		api.send(ans.toString());
	}
});

// Various math commands
bot.on("command",function(cmd,args){
	if(args.length === 0 || args.every(function(val){
		return !isNaN(val);
	})){
		if(cmd === "rand"){
			rand = Math.random();
			min = (args.length === 0 ? 1 : parseInt(args[0]));
			max = (args.length === 0 ? 10 : parseInt(args[1]));
			api.send((Math.floor((rand*max)+min).toString()));
		}else if(args.length > 0){
			if(cmd === "sqrt" || cmd === "squareroot"){
				n = Math.sqrt(args[0]);
				fixed = n.toFixed(3);
				if(n>0){
					x = (fixed[fixed.length-1] === 0 ? n.toString() : fixed+" (3dp)");
					api.send(x);
				}
			}else if(cmd === "sin"){
				api.send(Math.sin(args[0]).toString());
			}else if(cmd === "cos"){
				api.send(Math.cos(args[0]).toString());
			}else if(cmd === "tan") {
				api.send(Math.tan(args[0]).toString());
			}
		}
	}

	if(cmd === "pi"){
		api.send(Math.PI.toString());
	}else if(cmd === "e"){
		api.send(Math.E.toString());
	}
});
