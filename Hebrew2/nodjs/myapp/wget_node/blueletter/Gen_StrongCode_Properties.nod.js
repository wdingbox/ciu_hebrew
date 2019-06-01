console.log("...");

//var fs = require('fs');  // file system
//var rstream = fs.createReadStream('../../HebrewWordsStats_rooter.htm');
//var g_PATH="../../../../../../___bigdata/unzipped/rel/ham12/hgsbible/";
//int
//var g_voiceUrl="https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H";
//var g_SCHFrq="../../out/OT/oStrongCode_Frq.js";
var g_BlueSrc='/tmp/blue/';   //downloaded raw data from wgetall.
var g_BlueDes="/tmp/blue2/"; //div_lexicon only.

var g_outdir="./out/props/";
//var g_outdir2="./out/props/";
var g_outname5p="oStrongCode_5props";
var g_outnameCollected="oCollected_Props";

var cheerio = require('cheerio');
var fs = require('fs');

var g_oStronCodeProp={};
var g_nameEnglishWordsStats="oCollected_EnglishWords";

function GetObjFrFile(jsfile){
    var strdata = fs.readFileSync(jsfile, 'utf-8');
    var ipose=strdata.indexOf("=");
    if(ipose>=0 && ipose<500){
        ipose+=1;
    }else{
        ipose=0;
    }
    strdata=strdata.substr(ipose);
    console.log(jsfile);
    var jsonFrq=JSON.parse(strdata);    
    console.log(jsonFrq);
    return jsonFrq;
}

function save2js(dir, name, Obj){
    var s="var "+name+"=\n";
    var outfile=dir+name+".js";
    fs.writeFileSync(outfile, s+JSON.stringify(Obj, null,2) , 'utf-8');
    console.log(outfile); 
}
function save2htm_lexicon(sdir, sid, div_lexicon){
    if(sdir.length==0){
        return;
    }
    var desfile=sdir+'/h'+sid+'.htm';
    div_lexicon=div_lexicon.trim();
    fs.writeFileSync(desfile, div_lexicon , 'utf-8');
    console.log(desfile); 
}
function CheerioLoadFile(sdir, sid){
        var desfile=sdir+'/h'+sid+'.htm';
        const stats=fs.statSync(desfile);
        if(stats.size<1000) {
            console.error("file size err for ", desfile);
            process.exit(1);
            return null;
        }

        console.log(desfile, stats.size); 
        var data=fs.readFileSync(desfile, 'utf8');
        $ = cheerio.load('' + data + '');  
        return $;  
}
function HID2sid(HID){
    var sid=HID.trim().substr(1);
    while(sid.length<4){
        sid="0"+sid;
    }
    return sid;
}
function getStrongDef(shm){
    $=cheerio.load(shm); 
    $("strong").each(function(){
        $(this).empty();
    });
    var tmp=$("p").text();
    //console.log(tmp,"---\n");
    return tmp.trim();    
}
function minedata(){
    
    for(var i=1;i<=8674;i++){
        var sid=""+i;
        while(sid.length<4){
            sid="0"+sid;
        }
        $=CheerioLoadFile(g_BlueSrc, sid);
        var lexicon=$.html("#lexicon");//$.html('xx')=outerhtml; $('xx').html()=innerhtml
        save2htm_lexicon(g_BlueDes, sid, lexicon);
        //console.log("\n\n\n\n====lexicon:outerhtml===============\n");
        //console.log(lexicon);
        $ = cheerio.load('' + lexicon + '');  

        var sHbr=$(".lexTitleHb").text().trim();
        if( sHbr.length==0){
            console.log("sHbr empty");
            process.exit(1);
        }
        console.log(sHbr);

        //// Part of Speech
        var PoS=$("div.lexicon-label:contains('Part of Speech')").next().text().trim();
        if( PoS.length==0){
            console.log("PoS empty");
            PoS="-";
            process.exit(1);
        }
        console.log(PoS);

        //// Root Word (Etymology)
        var sRoot=$("div.lexicon-label:contains('Root Word (Etymology)')").next().text().trim();
        if( sRoot.length==0){
            sRoot="-"
            console.log("sRoot empty");
            //process.exit(1);
        }
        console.log(sRoot);




        //hid verification
        var HID=$("#lexImage").attr("alt");
        if(!HID){
            console.log("err",sid);
            process.exit(1);
        }
        console.log(HID);
        var hid=HID2sid(HID);
        if(hid!=sid){
            console.log(sid, hid);
            process.exit(1);
        }

        var keword="KJV Translation Count — Total:";
        var Count="" ,strongdef="";
        $("div.lexicon-label:contains('"+keword+"')").each(function(){
            Count=$(this).text().trim();
            Count=Count.replace(/\,/,""); //eg. 2,000. 
            //////
            var tmp=$(this).next().html();
            strongdef=getStrongDef(tmp);
            return false;
        });
        if( Count.length==0){
            console.log(sid, "Count err");
            process.exit(1);
        }
        //console.log("Count:",Count);
        var nCount=parseInt(Count.substr(keword.length));
        console.log("nCount:",nCount);
        console.log("strongdef:",strongdef);

        console.log();




        g_oStronCodeProp[sid]=[sHbr, nCount, PoS, sRoot, strongdef];
    };//for  

    //save2js(g_outdir, g_outname, oStronCodeProp);
}

function collect_Props_from_json(){
    function _addin(Obj, val, sid){
        if(!Obj[val]){
            Obj[val]=[];
        }
        Obj[val].push(sid);
    };

    var PoS={},Root={};
    var Obj=GetObjFrFile(g_outdir+g_outname5p+".js");
    var sidArr=Object.keys(Obj);

    for(var i=0;i<sidArr.length;i++){
        var sid=sidArr[i];
        var arr=Obj[sid];
        var spos=arr[2];//pos
        var roots=arr[3];//root
        _addin(PoS, spos, sid);
        _addin(Root, roots,sid);
        console.log(arr);
    }

    var oProp={"PoS":PoS,"Root":Root};
    save2js(g_outdir, g_outnameCollected, oProp);
    console.log("gen_PropsList end");
}

function english_word_Stats(){
    var oStats={};
    var Ignor=["x","H","a","s","up","out","of","down","away","in","to","off","for","the","by","on","and","it","me","from","an","with"];
    function __Stat(str,sid){
        var arr=str.split(/[\"\'\<\>\s\,\.\(\)0-9]/);
        for(var i=0;i<arr.length;i++){
            var wrd=arr[i].trim();
            if(wrd.length==0||Ignor.indexOf(wrd)>=0)continue;
            if(!oStats[wrd]){
                oStats[wrd]={};

            }
            if(!oStats[wrd][sid]){
                oStats[wrd][sid]=0;
            }            
            oStats[wrd][sid]++;
        }
    };


    var Obj=GetObjFrFile(g_outdir+g_outname5p+".js");
    var sidArr=Object.keys(Obj);
    for(var i=0;i<sidArr.length;i++){
        var sid=sidArr[i];
        var arr=Obj[sid];
        var trans=arr[4];//eng
        var heb=arr[0];
        __Stat(trans,sid+"("+heb+")");
        console.log(arr);
    }    

    save2js(g_outdir, g_nameEnglishWordsStats, oStats);
}

/////////////////////////////
console.log(process.argv);
if( process.argv.length != 3){
    console.log("Param:");
    console.log("1 : extract div_lexicon from '"+g_BlueSrc+"' to '"+g_BlueDes+"' (4 min)");
    console.log("2 : generate '"+g_outname5p+"' from '"+g_BlueDes+"' (3 min)");
    console.log("3 : generate '"+g_outnameCollected+"' from '"+g_outname5p+"'");
    console.log("4 : generate '"+g_nameEnglishWordsStats+"' from '"+g_outname5p+"'\n\n");
    process.exit(0);
}
if(process.argv[2]==='1'){
    g_BlueSrc="/tmp/blue/";

    g_BlueDes="/tmp/blue2/"
    minedata();
}
if(process.argv[2]==='2'){
    g_BlueSrc=g_BlueDes;
    g_BlueDes="";//no saving
    minedata();
    save2js(g_outdir, g_outname5p, g_oStronCodeProp);
}
if(process.argv[2]==='3'){
    collect_Props_from_json();
}
if(process.argv[2]==='4'){
    english_word_Stats();
}



console.log("end");



