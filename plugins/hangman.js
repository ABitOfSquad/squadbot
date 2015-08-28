var stagesOfHang = [
	"|\n" +
	"|\n" +
	"|\n" +
	"|\n" +
	"|\n" +
	"|\n",
	
	" __________\n" +
	"|\n" +
	"|\n" +
	"|\n" +
	"|\n" +
	"|\n" +
	"|\n",
	
	" __________\n" +
	"|/\n" +
	"|\n" +
	"|\n" +
	"|\n" +
	"|\n" +
	"|\n",
	
	" __________\n" +
	"|/               |\n" +
	"|              😖\n" +
	"|\n" +
	"|\n" +
	"|\n" +
	"|\n",
	
	" __________\n" +
	"|/               |\n" +
	"|              😨\n" +
	"|               \\|/\n" +
	"|                |\n" +
	"|\n" +
	"|\n",
	
	" __________  \n" +
	"|/               |\n" +
	"|              😵\n" +
	"|               \\|/\n" +
	"|                |\n" +
	"|               /\\ \n" +
	"|\n" 
]

// " - fixes a bug in my editor

var words = [
	"abruptly", "affix", "askew", "axiom", "azure", "bagpipes", "bandwagon", "banjo", "bayou", "bikini", "blitz", "bookworm", 
	"boxcar", "buckaroo", "boxful", "buffalo", "buffoon", "cobweb", "croquet", "daiquiri", "disavow", "duplex", "dwarves", "equip", "exodus", 
	"fishhook", "fixable", "foxglove", "galaxy", "galvanize", "gazebo", "gizmo", "glowworm", "guffaw", "haiku", "haphazard", "hyphen", 
	"icebox", "injury", "ivory", "ivy", "jaundice", "jawbreaker", "jaywalk", "jazzy", "jigsaw", "jiujitsu", "jockey", "jovial", "joyful", 
	"juicy", "jumbo", "kazoo", "keyhole", "khaki", "kilobyte", "kiosk", "kiwifruit", "knapsack", "larynx", "luxury", "marquis", "megahertz", 
	"microwave", "mystify", "nightclub", "nowadays", "numbskull", "ovary", "oxidize", "oxygen", "pajama", "peekaboo", "pixel", "pizazz", 
	"pneumonia", "polka", "quartz", "quiz", "quorum", "razzmatazz", "rhubarb", "rickshaw", "schizophrenia", "sphinx", "spritz", "squawk", 
	"subway", "swivel", "topaz", "unknown", "unworthy", "unzip", "uptown", "vaporize", "vixen", "vodka", "vortex", "walkway", "waltz", "wavy", 
	"waxy", "wheezy", "whiskey", "whomever", "wimpy", "wizard", "woozy", "xylophone", "yachtsman", "yippee", "youthful", "zephyr", "zigzag", 
	"zilch", "zodiac", "zombie"
]

var word = ""
var letters = []
var errors = 0

bot.on("command", function(cmd, args) {
	function sendStatus() {
		var status = ""
		
		for (var i = 0; i < word.length; i++) {
			if (i != 0) {
				status += " "
			}
			
			if (letters.indexOf(word[i]) == -1) {
				status += "_"
			}
			else {
				status += word[i]
			}
		}
		
		status += "\n\n"
		
		for (var i = 0; i < letters.length; i++) {
			if (word.indexOf(letters[i]) == -1) {
				status += letters[i] + " "
			}
		}
		
		bot.send(status)
	}
	
	function reset() {
		word = ""
		letters = []
		errors = 0
	}

	
	if (cmd == "hangman" && words == "") {
		word = words[Math.floor(Math.random() * words.length)].toUpperCase()
		
		bot.send("🎲 We're playing hangman! 🎮\n\nGuess a letter or whole word by using /guess.")
		
		setTimeout(function () {
			sendStatus()
		}, 100)
	}
	else if (cmd == "guess" && word && args[0]) {
		args[0] = args[0].toUpperCase()
		
		if (args[0].length == 1 && letters.indexOf(args[0]) == -1) {
			letters.push(args[0])
			
			if (word.indexOf(args[0]) == -1) {
				errors++
				bot.send(stagesOfHang[errors - 1])
				
				if (stagesOfHang.length == errors) {
					setTimeout(function() {
						bot.send('He\'s dead, thanks to you.\nThe word was "' + word.toLowerCase() + '"')
					}, 200)
					return reset()
				}
			}
			else {
				var complete = true
				
				for (var i = 0; i < word.length; i++) {
					if (letters.indexOf(word[i]) == -1) {
						complete = false
						break
					}
				}
				
				if (complete) {
					bot.send('Congratulations, you\'ve saved him in time!\nThe word was "' + word.toLowerCase() + '"')
					return reset()
				}
			}
			
			setTimeout(function () {
				sendStatus()
			}, 200)
		}
		else {
			if (args[0] == word) {
				bot.send('Congratulations, you\'ve saved him in time!\nThe word was "' + word.toLowerCase() + '"')
				return reset()
			}
			else {
				errors++
				bot.send(stagesOfHang[errors - 1])
				
				if (stagesOfHang.length == errors) {
					setTimeout(function() {
						bot.send('He\'s dead, thanks to you.\nThe word was "' + word.toLowerCase() + '"')
					}, 200)
					return reset()
				}
				
				setTimeout(function() {
					sendStatus()
				}, 200)
			}
		}
	}
})
