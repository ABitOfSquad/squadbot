var memwatch = require('memwatch-next');

memwatch.on('leak', function(info) {
    print("Leaks increased: " + info.reason, "red");

});

memwatch.on('stats', function(stats) {
    console.log(stats)
});