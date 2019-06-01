console.log("...");

//var fs = require('fs');  // file system
//var rstream = fs.createReadStream('../../HebrewWordsStats_rooter.htm');
var g_PATH="../../../../../../___bigdata/unzipped/rel/ham12/hgsbible/";

//int
var g_voiceUrl="https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H";

var cheerio = require('cheerio');
var fs = require('fs');

//var g_htmHdr=fs.readFileSync("../../noduti/tmpl/table_HtmHeaders.htm");

//https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H3068
var g_Url="https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H";
var wget = require('node-wget');


// dry run 
function wgetall(){
    for(var i=1;i<=8674;i++){
        var sid=""+i;
        while(sid.length<4){
            sid="0"+sid;
        }

        var surl=g_Url+sid;
        var desfile='/tmp/blue/h'+sid+'.htm';
        const stats=fs.statSync(desfile);
        if(stats.size>100000) continue;
        console.log(desfile); 
        wget({
            url:  surl,
            dest: desfile,
            dry: false,
            timeout: 5000 //wait for 5 seconds.
            }, 
            function(err, data) {        // data: { headers:{...}, filepath:'...' } 
                console.log('---  run err:', err);
                if(err){
                    i=9999;
                }
                if(data){
                    console.log(data.length); // '/tmp/package.json' 
                }
                else {
                    console.log("data is null.");
                    i=9999;
                }
                
            }
        );    
    };//for
}
wgetall();

setTimeout(function() {
  console.log('hello world!');
}, 10000);
console.log("wait for download finished.");



