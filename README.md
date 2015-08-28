# whatsapi-Squadbot
A Bridge over the Node-whatsapi to run squadbot applications. API can be found in main squadbot repo

#### Plugins
Squadbot is made to be as easy as possible to use.  A plugin that simply sends all messages back can be only one line:

**Heads Up! Significant changes are being made in this early stage of development, plugins are most likely to break sooner or later**
```javascript
bot.on("message", function(msg, raw) {api.send("someone said: " + msg)})
```

The only thing you need to do to load the plugin, is place it in the ```/plugins``` folder, Squadbot will do the rest.

#### Contributing
Feel free to contribute, however significant API changes have a chance of not being accepted, since we like to design the API with our full team. If you wrote a plugin for squadbot, Awesome! However plugins are not accepted in this repository, add it to your own repo, and feel free to share it with us! There are plans to create a node-like SPM (spm -> Squadbot Package Manager), but this is something for when we go cross-protocol

#### Cross Protocol
We are planning on making Squadbot available for different platforms, the API will always be beta tested and updated first in the Whatsapi-Squadbot. We are planning on developing for the following platforms. In case you have plans for another platform, feel free to send us a message!
* Kik
* Skype
* IRC
* Telegram
