const path = require("path");

module.exports = {
    mode: "production", 
    output: {
        path: path.resolve(__dirname, "./broswer"), 
        filename: "keypsd.js", 
        library: {
            name: "keypsd", 
            type: "assign"
        }
    }
};