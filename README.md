# whatsapi-Squadbot
A Bridge over the Node-whatsapi to run squadbot applications. API can be found in main squadbot repo

#### Plugins
Squadbot is made to be as easy as possible to use.  A plugin that simply sends all messages back can be only one line:

```bot.on("message", function(msg) {api.send(msg)})```

The only thing you need to do to load the plugin is place it in the /plugins folder, Squadbot will do the rest.
