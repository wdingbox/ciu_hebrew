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


function Get7kChineseChars(){
    var filanem="../../../../../../../pb/git_svr_proj1/files/latx/ChineseCharacters/Pinyin_7kSimplified.js";
    filanem="Pinyin_7kSimplified.json";
    var content=fs.readFileSync(filanem,"utf8");
    
    //console.log(content);
    var jsonObj=JSON.parse(content);
    //console.log(jsonObj);

    var keys=Object.keys(jsonObj);
    var charsStatObj={};
    for(var i=0;i<keys.length;i++){
        var str=jsonObj[keys[i]];
        var arr=str.split("");
        for(var k=0;k<arr.length;k++){
            var char=arr[k].trim();
            if(char.length===0)continue;
            //console.log(char);
            if(!charsStatObj[char]){
                charsStatObj[char]=0;
            }
            charsStatObj[char]++;
        }
    };
    var charArr=Object.keys(charsStatObj);
    console.log("total distinct chars",charArr.length);
    return charArr;
}
function get_destination_file(char){
    return "./htm/"+char+".htm";
}
function dest_is_exist(char){
    var desfile=get_destination_file(char);
    if(fs.existsSync(desfile)){
        const stats=fs.statSync(desfile);
        //console.log("already exist:",desfile, "size",stats.size);
        if(stats.size>1000) {
            //console.log("already exist:",desfile, "size",stats.size);
            return true;        
        }
    }
    return false;
}

function Get_None_Donwloaded_Chars(charArr){
    var arr=[];
    for(var i=0;i<charArr.length;i++){
        var char=charArr[i];
        if(dest_is_exist(char)==true)continue;
        arr.push(char);
    }   
    console.log("total none_exist files for chars",arr.length);
    return arr; 
}
function walk_wget(chary, icountMax){
    if(icountMax>=chary.length) icountMax=chary.length;
    for(var i=0;i<icountMax;i++){
        var char=chary[i];
        wget_dest_htm(char);
    }
}

// dry run 
function wget_dest_htm(char){
    /////////http://www.chineseetymology.org/CharacterEtymology.aspx?submitButton1=Etymology&characterInput=%E5%BC%97 
    var urf="http://www.chineseetymology.org/CharacterEtymology.aspx?submitButton1=Etymology&characterInput=";
    //var charCode=char.charCodeAt(0);
    //var hex=charCode.toString(16);
    urf+=encodeURI(char);
    console.log("urf", urf); 


    var desfile=get_destination_file(char);
    console.log("desfile", desfile); 

    wget_url_dest(urf,desfile);
}
function wget_url_dest(urf,desfile){
    wget({
        url:  urf,
        dest: desfile,
        dry: false,
        timeout: 5000 //wait for 5 seconds.
        }, 
        function(err, data) {        // data: { headers:{...}, filepath:'...' } 
            //console.log('---  run err:', err);
            if(err){
                console.log('---------------  run err:', err);
            }
            if(data){
                console.log("data:", data); // '/tmp/package.json' 
            }
            else {
                console.log("************ data is null.");
            }
            
        }
    );    
}


var g_count=0, g_countMas=3000;
function wget_sync_htm(charsArr){
    setTimeout(function() {
      console.log('\n#', g_count);
      if(g_count>g_countMas || !charsArr[g_count])return;
      wget_dest_htm(charsArr[g_count]);
      g_count++;
      wget_sync_htm(charsArr);
    }, 3000);
}



var charsTotArr=Get7kChineseChars();
var charsArr=Get_None_Donwloaded_Chars(charsTotArr);

wget_sync_htm(charsArr);




console.log("wait for download finished.");



