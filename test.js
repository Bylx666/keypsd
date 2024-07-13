let psd = require("./index");
psd.parse(require("fs").readFileSync("./test.psd").buffer);