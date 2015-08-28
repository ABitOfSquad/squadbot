bot.on("command", function(cmd, args) {
	if (cmd == "test") { 
        bot.sendAudio("http://www.audiocheck.net/download.php?filename=Audio/audiocheck.net_hdchirp_88k_-3dBFS_lin.wav")
    }
})
