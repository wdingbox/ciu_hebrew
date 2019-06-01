console.log("test");

var fs = require('fs');  // file system
var rstream = fs.createReadStream('../HebrewWordsStats_rooter.htm');


var fs2 = require('fs');  // file system
var wstream = fs2.createWriteStream('fileToWrite.txt');
wstream.write("aaa");



var cheerio = require('cheerio'),
    fs = require('fs');

fs.readFile('../HebrewWordsStats_rooter.htm', 'utf8', dataLoaded);

function dataLoaded(err, data) {
    $ = cheerio.load('' + data + '');
    $('div').each(function(i, elem) {
        var id = $(elem).attr('id'),
            filename = id + '.html',
            content = $.html(elem);
        fs.writeFile(filename, content, function(err) {
            console.log('Written html to ' + filename);
        });
    });
}

