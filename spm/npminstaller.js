var npm = require("npm");
var fs = require("fs");

/**
 * Converts the protocol json object to an array of string that can be read by npm
 * @param p protocol object
 * @returns {Array} array of string that can be read by npm
 */
function createNpmDependenciesArray (p) {
    var dependencies = [];
    for (var mod in p["npm"]) {
        dependencies.push(mod + "@" + p["npm"][mod]);
    }
    return dependencies;
}

exports.install = function(name, obj) {
    var arr = createNpmDependenciesArray(obj);
    print("Installing " + arr.length + " NPM libraries", "cyan");

    arr.forEach(function(dep){
        saveUsage(name, dep);
        download(dep)
    });

};

/**
 * Saves the usage of a certain dependency to the database
 * @param user
 * @param dependency
 */
function saveUsage(user, dependency){
    //try {
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

            download(dependency);
        } else {
            oldObject[name].push(user);
        }

        fs.writeFile('dependencyusers.json', JSON.stringify(oldObject));
        //done!
    /**} catch(err) {
        console.log(err.message);
    }**/

}

/**
 * Installs a new npm library
 * @param npmstring name@version
 */
function download(npmstring){
    try {
        npm.load({
            loaded: false
        }, function (err) {
            npm.commands.install([npmstring], function (er, data) {
                if(er){
                    print("Could not install npm dependency " + npmstring, "red");
                }
                print("Installed " + npmstring + "!", "cyan");
            });
        });
    } catch(err) {
        print("Could not install npm dependency " + npmstring, "red");
    }
}
