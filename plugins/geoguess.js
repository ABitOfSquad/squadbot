var plugin = {
	"name" : "geoguess",
	"description" : "Guess where this picture is taken!",
	"authors" : {
		"Lem Severein" : "Creator"
	},
	"collaborators" : {},
	"version" : "0.1.1",
	"protocol" : "1"
};

var locations = [
	[46.742567, 23.431441],
	[17.414358, 102.78485],
	[22.997283, 120.202443],
	[13.746654, 100.492596],
	[-26.799331, 133.328037],
	[-33.575857, 150.338716],
	[-38.689792, 176.069365],
	[-43.021065, 171.59752],
	[-77.874595, 160.556832]
]

var guesses = []
var playing = false
var location = []

function getDistance(latS, lonS, latE, lonE) {
	function toRad(deg) {
		return deg * Math.PI / 180
	}
	
	var R = 6371; // km
	var dLat = toRad(latE-latS);
	var dLon = toRad(lonE-lonS);
	var lat1 = toRad(latS);
	var lat2 = toRad(latE);

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	
	return Math.round(d)
}

bot.on("command", function(cmd, args) {
	if (cmd == "geoguess") {
		if (playing) {
			return
		}
		
		location = locations[Math.floor(Math.random() * locations.length)]
		playing = true
		guesses = []
		
		url = "http://maps.googleapis.com/maps/api/streetview?size=640x640&location=" + location[0] + "," + location[1] + "&fov=100"
		api.sendImage(url, "🏰 Time to play Geoguesser! 🏯\n\nShare the location of where you think this streetview was made. (you only have 60 seconds, so be quick)")
		
		setTimeout(function () {
			function getSortedKeys(obj) {
			    var keys = []; for(var key in obj) keys.push(key);
			    return keys.sort(function(a,b){return obj[a]-obj[b]});
			}
			
			var best
			var worst

			for (var i = 0; i < guesses.length; i++) {
				var kmOff = getDistance(guesses[i].lat, guesses[i].lon, location[0], location[1])
				
				if (!best || best.kmOff > kmOff) {
					best = guesses[i]
					best.kmOff = kmOff
				}
				
				if (!worst || worst.kmOff < kmOff) {
					worst = guesses[i]
					worst.kmOff = kmOff
				}
			}
			
			var endText = "🎉 " + best.user.toUpperCase() + " HAS WON!!1 🎉"
			endText += "\n" + best.user + " was only " + best.kmOff + " km off"
			api.send(endText)
			
			if (best.user != worst.user) {
				setTimeout(function () {
					var endText = worst.user + " is a different story though..."
					endText += "\nHe/she was like " + worst.kmOff + " km off 😭"
					api.send(endText)
				}, 50)
			}
			
			playing = false
		}, 60000);
	}
})

bot.on("location", function(loc) {
	if (playing) {
		for (var i = 0; i < guesses.length; i++) {
			if (guesses[i].user == loc.notify) {
				return
			}
		}
		
		guesses.push({
			user: loc.notify,
			lat: loc.latitude,
			lon: loc.longitude
		})
	}
})
