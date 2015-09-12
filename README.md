# Squadbot
**Heads up! THIS PROJECT IS WORKING AND BREAKING PRETTY MUCH EVERY DAY AT THIS POINT, SO DON'T EXPECT A STABLE VERSION FOR A WHILE.**


[![Join the chat at https://gitter.im/ABitOfSquad/whatsapi-Squadbot](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ABitOfSquad/whatsapi-Squadbot?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
A bridge over the Node-whatsapi to run 'Squadbot' applications. The API we are using is our successor of the Node Whatsapi project, which got discontinued.

#### What is Squadbot?

@Nickforall pls...

#### Settings.json
Squadbot requires a ```settings.json``` file in its root directory (the same as ```index.js```) in order to work. The object within the file must have the following properties:
```json
{
  "telnumber" : "",
  "displayname" : "Squadbot",
  "whatsapp_pass" : "XXXXXXXXXXX",
  "group_id" : "0"
}
```
More information on how to extract passwords can be found [here](https://github.com/ABitOfSquad/WA-password/).

#### Plugins
Squadbot plugins are very easy to write. Below is an example which uses the event-driven plugins API provided:

```javascript
exports.plugin = {
    "name": "Count",
    "description": "Responds to 'squadbot' and 'batman' and implements a count command which counts from x to y.",
    "authors": {
        "Daniel Mizrachi": "Creator"
    },
    "reservedCommands": ["count"],
    "collaborators": {
        "Nick Vernij": "Made the older versions (except not really)"
    },
    "version": "0.3",
    "protocol": "1"
};

bot.on("message", function(msg, sender) {
    msg = msg.toLowerCase();
    if(msg === "squadbot") {
        bot.send("You called?");
    }else if(msg === "batman") {
        bot.send("You called for Batman but I'm the next best thing!");
    }
});

bot.on("command", function(cmd, args, sender) {
    if(cmd === "count" && args.length === 2){
        if(args[0] < args[1]){
            for(var i = parseInt(args[0])-1; i < parseInt(args[1]); i++){
                bot.send(i+1);
            }
        }else{
            for(var i = parseInt(args[0])+1; i > parseInt(args[1]); i--){
                bot.send(i-1);
            }
        }
    }
});
```
**Heads Up! Significant changes are being made in this early stage of development, plugins are most likely to break sooner or later.**

A better documentation for this API is to be written. For now, if you want some more complex examples, feel free to take a look in the ```/plugins``` directory in this repo. Every ```.js``` file placed in here which defines a valid ```exports.plugin``` object is automatically loaded by Squadbot upon initialisation.

#### Contributing
Feel free to contribute, however significant API changes have a chance of not being accepted, since we like to design the API with our full team. If you've written a plugin for Squadbot, awesome! However public contributions are not accepted in this repository, but please do add it to your own repo and let us know about it! We're interested to see what people might come up with, even at such an early stage in development.
An npm-like *SPM*\* is currently being developed, but this will take a while to get into production. For now, we're focused on other things and at some point will compile a list somewhere of available plugins and their associative protocols. Speaking of which...

#### Cross Protocol
Yes, you heard it, Squadbot will be **Cross Protocol Compatible**, and guess what, you'll be able to use a simple Protocols API to develop your own! That's what sets this project apart from others.
We are planning on releasing protocols for the following platforms ourselves:
* Kik
* Skype
* IRC
* Telegram
We look forward to seeing which other platforms protocols are written for. If you have any ideas right now, please do send us a message, as this API won't be working for a while.

#### Emojis
Emojis work the same way as on GitHub, just add `:name_of_emoji:` to a string and Squadbot will replace it with an emoji. Go to [emoji-cheat-sheet.com](http://www.emoji-cheat-sheet.com/) to see all the available emojis and their names.

#### Legal
Using whatsapp sockets is forbidden by their EULA. Squadbot has been created with the aim to learn more about bots, Reverse engineering and AI, this means this repository can never be used for either commercial purposes, or educational purposes on a larger scale. For these purposes you should consider using other protocols such as Telegram and IRC. **WE DO NOT SUPPORT BULK MESSAGES, OR 24/7 USE OF THIS BOT, WHATSAPP ISN'T DESIGNED FOR THIS, AND YOU SHOULD CONSIDER A DIFFERENT PROTOCOL WHEN DOING SO**

As stated in our License, we do not give any warranty, the Software and its source code is provided "AS IS". Our license only includes our own code, the whatsapp code, logos and styles are copyrighted by Whatsapp inc.

**We are not in any way associated with Whatsapp Inc. This isn't an official API supported nor created by Whatsapp Inc!**

\* 'Squadbot Package Manager' (akin to the familiar 'Node Package Manager'). How exciting!
