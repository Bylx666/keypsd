const path = require("path");

module.exports = {
    mode: "production", 
    output: {
        path: path.resolve(__dirname, "./broswer/"), 
        library: {
            name: "psd", 
            type: "assign"
        }
    }
};