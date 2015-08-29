# whatsapi-Squadbot
A Bridge over the Node-whatsapi to run squadbot applications. The API we are using is our successor of the Node Whatsapi project, which got discontinued.

#### Settings.json
Squadbot requires a ```Settings.json``` file to work. This file needs to be created in the same direactory as ```Index.js```. The file needs to have the following variables. More information on how to extract passwords can be found [here](https://github.com/ABitOfSquad/WA-password/).
```json
{
  "telnumber" : "",
  "displayname" : "Squadbot",
  "whatsapp_pass" : "XXXXXXXXXXX=",
  "group_id" : "0"
}
```

#### Plugins
Squadbot is made to be as easy as possible to use.  A plugin that simply sends all messages back can be only a few lines:

**Heads Up! Significant changes are being made in this early stage of development, plugins are most likely to break sooner or later**
```javascript
exports.plugin = {
    "name" : "dictionary",
    "description" : "The (urban)Dictionary command!",
    "authors" : {
        "Nick Vernij" : "Creator"
    },
    "reservedCommands": ["define"],
    "collaborators" : {},
    "version" : "0.2",
    "protocol" : "1"
};

bot.on("message", function(msg, raw) {api.send("someone said: " + msg)})
```
Everything is pretty straightforward, a better documentation can soon be found in our wiki.

The only thing you need to do to load the plugin, is place it in the ```/plugins``` folder, Squadbot will do the rest.

#### Contributing
Feel free to contribute, however significant API changes have a chance of not being accepted, since we like to design the API with our full team. If you wrote a plugin for squadbot, Awesome! However plugins are not accepted in this repository, add it to your own repo, and feel free to share it with us! There are plans to create a npm-like SPM (spm -> Squadbot Package Manager), but this is something we want to do for when we will publish squadbot cross-protocol. But for now, we might create a list somewhere of available plugins.

#### Cross Protocol
We are planning on making Squadbot available for different platforms, the API will always be beta tested and updated first in the Whatsapi-Squadbot. We are planning on developing for the following platforms. In case you have plans for another platform, feel free to send us a message!
* Kik
* Skype
* IRC
* Telegram

#### Emojis
Emojis work the same way as on github, just add `:name_of_emoji:` to a string and Squadbot will replace it with an emoji. Go to [emoji-cheat-sheet.com](http://www.emoji-cheat-sheet.com/) to see all emojis and their names.

#### Legal
Using whatsapp sockets is forbidden by their EULA. Squadbot has been created with the aim to learn more about bots, Reverse engineering and AI, this means this repository can never be used for either commercial purposes, or educational purposes on a larger scale. For these purposes you should consider using other protocols such as Telegram and IRC. **WE DO NOT SUPPORT BULK MESSAGES, OR 24/7 USE OF THIS BOT, WHATSAPP ISN'T DESIGNED FOR THIS, AND YOU SHOULD CONSIDER A DIFFERENT PROTOCOL WHEN DOING SO**

As stated in our License, we do not give any warranty, the Software and its source code is provided "AS IS". Our license only includes our own code, the whatsapp code, logos and styles are copyrighted by Whatsapp inc.

**We are not in any way associated with Whatsapp Inc. This isn't an official API supported nor created by Whatsapp Inc!**
