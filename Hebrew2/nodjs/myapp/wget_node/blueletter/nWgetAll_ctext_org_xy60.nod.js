console.log("...");

//var fs = require('fs');  // file system
//var rstream = fs.createReadStream('../../HebrewWordsStats_rooter.htm');
var g_PATH="../../../../../../___bigdata/unzipped/rel/ham12/hgsbible/";

//int
var g_voiceUrl="https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H";

var cheerio = require('cheerio');
var fs = require('fs');
var wget = require('node-wget');
var path = require('path'); 
//var g_htmHdr=fs.readFileSync("../../noduti/tmpl/table_HtmHeaders.htm");

//https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H3068
var g_Url="https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H";
var g_Url="http://ctext.org/pre-qin-and-han/zh?searchu=%E7%94%B2%E5%AD%90";
var g_Url="http://ctext.org/pre-qin-and-han/zh?searchu=";

var xy60ary=[
"甲子",
"乙丑",
"丙寅",
"丁卯",
"戊辰",
"己巳",
"庚午",
"辛未",
"壬申",
"癸酉",
"甲戌",
"乙亥",
"丙子",
"丁丑",
"戊寅",
"己卯",
"庚辰",
"辛巳",
"壬午",
"癸未",
"甲申",
"乙酉",
"丙戌",
"丁亥",
"戊子",
"己丑",
"庚寅",
"辛卯",
"壬辰",
"癸巳",
"甲午",
"乙未",
"丙申",
"丁酉",
"戊戌",
"己亥",
"庚子",
"辛丑",
"壬寅",
"癸卯",
"甲辰",
"乙巳",
"丙午",
"丁未",
"戊申",
"己酉",
"庚戌",
"辛亥",
"壬子",
"癸丑",
"甲寅",
"乙卯",
"丙辰",
"丁巳",
"戊午",
"己未",
"庚申",
"辛酉",
"壬戌",
"癸亥",
""
];







// dry run 
function wget_single(idx){
    //for(var i=0;i<60;i++){
        var sid=""+idx;
        while(sid.length<2){
            sid="0"+sid;
        }
        console.log("search:",xy60ary[idx]);
        var enodeurl=encodeURIComponent(xy60ary[idx]);
        var surl=g_Url+enodeurl;
        console.log(surl); 
        var desfile='/tmp/ctext'+sid+'.htm';

        if(fs.existsSync(desfile)){
            const stats=fs.statSync(desfile, function(err,stat){

            });            
            if(stats.size>100000) {
                console.log("already exist:"+desfile); 
                return;
            }            
        }
        console.log("desfile:",desfile); 
        wget({
            url:  surl,
            dest: desfile,
            dry: false, //true
            timeout: 5000 //wait for 5 seconds.
            }, 
            function(err, data) {        // data: { headers:{...}, filepath:'...' } 
                console.log('--- err:', err);
                if(err){
  
                }
                if(data){
                    console.log("get data:"+data.length); // '/tmp/package.json' 
                }
                else {
                    console.log("get data is null.");
                }
                
            }
        );    
    //};//for
}
//




function CheerioLoadFile(sdir, sid){
        var desfile=sdir+'/ctext'+sid+'.htm';
        if(!fs.existsSync(desfile)){         
            console.log("file not exist:"+desfile);
            return;
        }
        const stats=fs.statSync(desfile);
        if(stats.size<1000) {
            console.error("file size err for ", desfile);
            //process.exit(1);
            return ;
        }

        console.log(desfile," size:", stats.size); 
        var data=fs.readFileSync(desfile, 'utf8');
        cheerio_read(data); 
}
function cheerio_read(shm){
    $=cheerio.load(shm); 
    $("table.searchsummary").find("tbody tr").each(function(idx){
        var tt=$(this).text();
        if(idx===2){
            console.log(idx, tt);
        }
        
    }); 
}
function read_all(){
    for(var i=0;i<60;i++){
        var sid=""+i;
        while(sid.length<2){
            sid="0"+sid;
        }        
        CheerioLoadFile("/tmp",sid);
    }
    
}


var sidx=process.argv[2];
console.log("input sidx:"+sidx);
var idx=parseInt(sidx, 10);
if(idx>0 && idx<60){
    console.log("idx:",idx);
    wget_single(idx);
}


console.log("---");




////////////////////////////
setTimeout(function() {
    read_all();
  console.log('hello world!');
}, 10000);
/////////////////////////






console.log("wait for download finished.");



