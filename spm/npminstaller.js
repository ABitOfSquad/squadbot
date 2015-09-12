var npm = require("npm");
var fs = require("fs");

//DEBUGGING PURPOSES, DELETE WHEN SCRIPT IS FULLY IMPLEMENTED
saveUsage("whatsapp", "colors@latest");

/**
 * Converts the protocol json object to an array of string that can be read by npm
 * @param p protocol object
 * @returns {Array} array of string that can be read by npm
 */
function createNpmDependenciesArray (p) {
    if (!p["npm_dependencies"]) return [];

    var dependencies = [];
    for (var mod in p["npm_dependencies"]) {
        dependencies.push(mod + "@" + p["npm_dependencies"][mod]);
    }

    return dependencies;
}

/**
 * Saves the usage of a certain dependency to the database
 * @param user
 * @param dependency
 */
function saveUsage(user, dependency){
    try {
        var depregex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,16})$/i;
        if(!depregex.test(dependency)){
            print("Invalid dependency string" + dependency, "red");
            return;
        }

        var name = dependency.split("@")[0];
        var users = [];

        try {
            if(fs.existsSync('dependencyusers.json')){
                var oldObject = JSON.parse(fs.readFileSync('dependencyusers.json').toString());
            } else {
                var oldObject = {};
            }
        } catch(err) {
            print("Could not load dependencyfile, moving on...", "red");
            return;
        }

        if(!Array.isArray(oldObject[name])) {
            users.push(user);
            oldObject[name] = users;

            install(dependency);
        } else {
            oldObject[name].push(user);
        }

        fs.writeFile('dependencyusers.json', JSON.stringify(oldObject));
        //done!
    } catch(err) {
        console.log(err.message);
    }

}

/**
 * Installs a new npm library
 * @param npmstring name@version
 */
function install(npmstring){
    try {
        npm.load({
            loaded: false
        }, function (err) {
            npm.commands.install([npmstring], function (er, data) {
                if(er){
                    print("Could not install npm dependency " + npmstring, "red");
                }
            });
        });
    } catch(err) {
        print("Could not install npm dependency " + npmstring, "red");
    }
}

//DEBUGGING PURPOSES, DELETE WHEN SCRIPT IS FULLY IMPLEMENTED
global.print = function print(text, color) {
    var output = ""

    if (color) {
        output += '\033[31m'
    }

    var d = new Date()
    var h = (d.getHours() < 10 ? "0" : "") + d.getHours()
    var m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes()
    var s = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds()

    output += "[" + h + ":" + m + ":" + s + "] " + text

    if (color) {
        output += '\033[0m'
    }

    console.log(output);
};

