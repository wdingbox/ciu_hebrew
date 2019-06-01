console.log("...");

//var fs = require('fs');  // file system
//var rstream = fs.createReadStream('../../HebrewWordsStats_rooter.htm');
var g_PATH="../../../../../../___bigdata/unzipped/rel/ham12/hgsbible/";

//int
var g_voiceUrl="https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H";
//var g_SCHFrq="../../hebrew2/nodout/hebrew_reader/oStrongCodeFrq.json";
//var g_SCHFrq="../../hebrew2/nodjs/myapp/out/OT/oStrongCode_Frq.json";
var g_SCHFrq="./out/OT/oStrongCode_Frq.js";
var g_SCHUsg="./out/OT/oStrongCode_Usage.js";
var g_BlueSrc='/tmp/blue/';
var g_VocabChapsBuf_sFile='../../../HebrewQ/audjs/VocabChapsBuf.js';


var cheerio = require('cheerio');
var fs = require('fs');



function GetObjFrFile(jsfile){
    var strdata = fs.readFileSync(jsfile, 'utf-8');
    var ipose=strdata.indexOf("=");
    if(ipose>=0 && ipose<500){
        ipose+=1;
    }else{
        ipose=0;
    }
    strdata=strdata.substr(ipose);
    //console.log(g_SCHFrq);
    var jsonFrq=JSON.parse(strdata);    
    //console.log(jsonFrq);
    return jsonFrq;
}




function save2js(dir, name, Obj){
    var s="var "+name+"=\n";
    var outfile=dir+name+".js";
    fs.writeFileSync(outfile, s+JSON.stringify(Obj, null,2) , 'utf-8');
    console.log(outfile); 
}

function search_in_Frq(insheb){
    insheb=Remove_Pronunce_Hebrew(insheb);
    var sidArr=Object.keys(oStrongCode_Freq);
    var iMaxFrq=0;
    var ret=null;
    for(var i=0;i<sidArr.length;i++){
        var sid=sidArr[i];
        var arr=oStrongCode_Freq[sid];
        var heb=arr[1];
        heb=Remove_Pronunce_Hebrew(heb);
        if(heb===insheb){
            var ifrq=parseInt(arr[0]);
            if( ifrq>iMaxFrq){
                iMaxFrq=ifrq;
                ret={"sid":sid,"frq":ifrq, "in":"Frq"};
            }
        }
    }
    return ret;
}
function search_in_Usage(insheb){
    insheb=Remove_Pronunce_Hebrew(insheb);
    var sidArr=Object.keys(oStrongCode_Usage);
    var iMaxFrq=0;
    var ret=null;
    for(var i=0;i<sidArr.length;i++){
        var sid=sidArr[i];
        var obj=oStrongCode_Usage[sid];
        var hebArr=Object.keys(obj);
        for(var j=0;j<hebArr.length;j++){
            var xheb=hebArr[j];
            //console.log(xheb);
            xheb="<a>"+xheb+"</a>";
            $=cheerio.load(xheb);
            var heb=$(xheb).text();
            //console.log(heb);
            var heb=Remove_Pronunce_Hebrew(heb);
        
            if(heb===insheb){
                var ifrq=oStrongCode_Freq[sid][0];
                if( ifrq>iMaxFrq){
                    iMaxFrq=ifrq;
                    console.log(insheb);
                    ret={"sid":sid,"frq":ifrq, "in":"Usage"}
                };
            };
        };
    };
    return ret;
}
function searchIn_oStrongCode_Usage(heb){
        var ret=search_in_Frq(heb);
        if(null==ret){
            ret=search_in_Usage(heb);
        }
        return ret;
};


function Remove_Pronunce_Hebrew(phword){
        var sword='';
        for(var k=0;k<phword.length;k++){
            var code=phword.charCodeAt(k);
            if(code>=1488 && code<=1514){
                var ch=phword.charAt(k);
                sword+=ch;
            }                
        }  
        return sword;
}


function Remove_Pronunce_Hebrew(phword){
        var sword='';
        for(var k=0;k<phword.length;k++){
            var code=phword.charCodeAt(k);
            if(code>=1488 && code<=1514){
                var ch=phword.charAt(k);
                sword+=ch;
            }                
        }  
        return sword;
}


function main(){
    save2js("./","test0",VocabChaps);

    //$=cheerio.load(VocabChaps);
    var chapsArr=Object.keys(VocabChaps);
    for(var i=0;i<chapsArr.length;i++){
        var chap=chapsArr[i];
        
        console.log(chap);
        var obj=VocabChaps[chap];
        var hebArr=Object.keys(obj);
        for(j=0;j<hebArr.length;j++){
            var heb=hebArr[j];
            var arr=VocabChaps[chap][heb];
            while(arr.length<5){
                arr.push("");
            }  
            if(arr[2].length===0||arr[3].length==0){
                var ret=searchIn_oStrongCode_Usage(heb);
                if(ret){
                    console.log(ret,"***",heb,"***"); 
                    console.log(VocabChaps[chap][heb]);               
                    arr[2]=ret.sid;
                    arr[3]=""+ret.frq;
                    console.log(VocabChaps[chap][heb]);   

                    //i=9999;  
                    //break;
                }            
            }
            else{
                console.log(heb, obj[heb]);
            }
        }
    }
    //var s=JSON.stringify(VocabChaps,null,2);
    //$("#jsonout").val(s);
    save2js("./","test2",VocabChaps);
}



var oStrongCode_Freq=GetObjFrFile(g_SCHFrq);
var oStrongCode_Usage=GetObjFrFile(g_SCHUsg);
var VocabChaps=GetObjFrFile(g_VocabChapsBuf_sFile);

main();




var question1=Remove_Pronunce_Hebrew("שְׁאֵלָה");
//console.log(question1,"שְׁאֵלָה");
var question2=Remove_Pronunce_Hebrew("שְׁאֵלָה");
//console.log(question2,"שְׁאֵלָה");
if(Remove_Pronunce_Hebrew("שְׁאֵלָה")===Remove_Pronunce_Hebrew("שְׁאֵלָה")){
	console.log("==");
}

console.log("end");



