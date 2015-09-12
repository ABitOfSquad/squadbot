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
