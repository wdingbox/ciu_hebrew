
//var Uti = require("../Uti.Module").Uti
const fs = require('fs');
var path = require('path');

var Uti = {
    proc_argv2obj: function () {
        var argv = process.argv.slice(2);
        var obj = {};
        argv.forEach(function (str) {
            var pos = str.indexOf(":");
            if (pos > 0) {
                var key = str.substr(0, pos);
                var val = str.substr(1 + pos);
                obj[key] = val;
            }
            else {
                console.log("err:" + str);
            }
        });
        return { obj: obj, argv: argv };
    }
}



var DirFilesUti = {
    getDirectories: function (srcpath) {
        return fs.readdirSync(srcpath).filter(function (file) {
            if ("." === file[0]) return false;
            return fs.statSync(path.join(srcpath, file)).isDirectory();
        });
    },
    getPathfiles: function (srcpath) {
        return fs.readdirSync(srcpath).filter(function (file) {
            if ("." === file[0]) return false;
            return fs.statSync(srcpath + '/' + file).isFile();
        });
    }
}
function make_htm(srcPath) {
    var fary = DirFilesUti.getPathfiles(srcPath);
    var str = ""
    for (var k = 0; k < fary.length; k++) {
        var sfl = fary[k];
        if(!path.extname(sfl).match(/\.png$/i)) continue
        str += `${k}<br><img alt="" src="${sfl}"/><br>\n`;
    }
    return str;
}

function main() {
    var outf = "main.htm";
    var htm = make_htm("./") 
    fs.writeFileSync(outf, htm, "utf8");
    console.log("Update: " + outf);
}

main();
console.log("open main.htm")

