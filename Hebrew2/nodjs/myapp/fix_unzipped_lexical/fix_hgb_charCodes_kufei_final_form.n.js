console.log("...");

//var fs = require('fs');  // file system
//var rstream = fs.createReadStream('../../HebrewWordsStats_rooter.htm');
var g_PATH_hgsbible="../../../../../../../___bigdata/unzipped/rel/ham12/hgsbible/hgb/";
//var g_PATH_hgsbible="../../../../../../../___bigdata/unzipped/rel/ham12/hgsbible/test/";


var cheerio = require('cheerio');
var fs = require('fs');


var g_xCode={};
var g_charCodeFrq={};

function getHexAsciiFromBinary(file){
    var content=fs.readFileSync(file,null);
    var data=new Buffer(content)
    var conts="";
    for(var i=0;i<data.length;i++){
        var icod=data[i];

        //console.log(icod)
        if(icod>126 && icod<256){
            //console.log(icod)
            var hex=icod.toString(16)
            conts+="&#x"+hex+";";
        }
        else{
            conts+=String.fromCharCode(icod)
        }
    }

    //////////////////////////////////
    for(var i=0;i<data.length;i++){
        var ccod=""+data[i];//content.charCodeAt(i);
        if(!g_charCodeFrq[ccod]){
            g_charCodeFrq[ccod]=0;
        }
        g_charCodeFrq[ccod]++;
    }
    return conts;    
}
function check_xCode(file){
    console.log("check",file);

    //$=cheerio.load(content)
    //content=$.html();

    //console.log("content",content);
    var content=getHexAsciiFromBinary(file);
    if(!content){
        console.log("load empty",file);
    }

    var matchar=content.match(/(\&\#x[a-zA-Z0-9]{1,4}\;)/g);
    //console.log(matchar);
    if( matchar){
        matchar.forEach(function(item){
            if(!g_xCode[item]){
                g_xCode[item]=0;
            }
            g_xCode[item]+=1;
        });  

        modify_content(file,content);
    }
    return matchar;
}
function modify_content(file, content){
    /////////////////////////////////////////////
    ////replace: &#xE803; ==> &#x5da;&#x5b8; 
    var fix=content.replace(/(\&\#xE803\;)/g, "&#x05da;&#x05b8;");
    
    ////replace: &#xE803; ==> &#x5da;&#x05b0; 
    fix=fix.replace(/(\&\#xE802\;)/g, "&#x05da;&#x05b0;");

    fs.writeFileSync(file+"",fix,"utf8");

    /////
};

var walk = function(dir) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function(file) {
        pathfile = dir + '/' + file
        var stat = fs.statSync(pathfile)
        if (stat && stat.isDirectory()) results = results.concat(walk(pathfile))
        else {
            if( check_xCode(pathfile) != null ){
                results.push(pathfile)
                console.log(file)                
            };
        };
    });
    return results;
}

var filesAr=walk(g_PATH_hgsbible);
//check_xCode("04_Num_006.htm");


//fs.writeFileSync("xCodesFrq.js","var xCodesFrq=\n"+JSON.stringify(g_xCode,null,2),"utf8");

fs.writeFileSync("g_charCodeFrq.js","var g_charCodeFrq=\n"+JSON.stringify(g_charCodeFrq,null,2),"utf8");


console.log("end");
//http://localhost/~weiding/weidroot/weidroot_2017-01-06/___bigdata/unzipped/rel/ham12/hgsbible/hgb/01_Gen_006.htm




