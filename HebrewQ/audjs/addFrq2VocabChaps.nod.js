console.log("...");

//var fs = require('fs');  // file system
//var rstream = fs.createReadStream('../../HebrewWordsStats_rooter.htm');
var g_PATH="../../../../../../___bigdata/unzipped/rel/ham12/hgsbible/";

//int
var g_voiceUrl="https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H";
//var g_SCHFrq="../../hebrew2/nodout/hebrew_reader/oStrongCodeFrq.json";
var g_SCHFrq="../../hebrew2/nodjs/myapp/wget_node/blueletter/oStrongFrqPosRoot.json";
var g_BlueSrc='/tmp/blue/';
var g_Vocabs='VocabChaps.js';


//var cheerio = require('cheerio');
var fs = require('fs');

var g_StronCode={};
var g_Stats_Part_of_Speech={};
var g_Stats_Root={};



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
var question=Remove_Pronunce_Hebrew("שְׁאֵלָה");
console.log(question);
var question=Remove_Pronunce_Hebrew("שְׁאֵלָה");
console.log(question);

function GetObjFrFile(jsfile){
    var strdata = fs.readFileSync(jsfile, 'utf-8');
    var ipose=strdata.indexOf("=");
    if(ipose>=0 && ipose<500){
        ipose+=1;
    }else{
        ipose=0;
    }
    strdata=strdata.substr(ipose);
    console.log(g_SCHFrq);
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


function minedata(){
    var jsonFrq=GetObjFrFile(g_SCHFrq);

    var VocabsObj=GetObjFrFile(g_Vocabs);


    //var $=cheerio.load(jsonFrq);

    for(var i=1;i<=8674;i++){
        var sid=""+i;
        while(sid.length<4){
            sid="0"+sid;
        }
        var arr=jsonFrq[sid];
        if(arr){
        	var heb=arr[0];
        	var frq=""+arr[2];
        	//console.log(heb);
        	var chaps=Object.keys(VocabsObj);
        	for(var k=0;k<chaps.length;k++){
        		var chp=chaps[k];
        		var ObjChap=VocabsObj[chp];
        		var HebrArr=Object.keys(ObjChap);
        		for(var jj=0;jj<HebrArr.length;jj++){
        			var Hebr=HebrArr[jj];
        			var Hebr2=Remove_Pronunce_Hebrew(Hebr);
        			var heb2 =Remove_Pronunce_Hebrew(heb);
        			
        			
        			if(sid==="7595xxxxxx"){
        				console.log("\nk:",k, "jj",jj);
	        			console.log(sid, heb, frq);
	        			console.log(chp, Hebr, Hebr2, heb,heb2);
	        		}
        			if(Hebr2==heb2){
	        			//console.log(Hebr, Hebr2, heb,heb2);
	        			while(ObjChap[Hebr].length<5){
	        				ObjChap[Hebr].push("");
	        			}
	        			if( ObjChap[Hebr][2].length==0){
	        				ObjChap[Hebr][2]=(sid);
	        			}
	        			if( ObjChap[Hebr][3].length==0){
	        				ObjChap[Hebr][3]=(frq);
	        			}        				
        			}
        		}
        	}
	        
        }

    }


    var outfile=g_Vocabs+".json";
    fs.writeFileSync(outfile, JSON.stringify(VocabsObj, null,2) , 'utf-8');
    console.log(outfile); 
}

minedata();




var question1=Remove_Pronunce_Hebrew("שְׁאֵלָה");
//console.log(question1,"שְׁאֵלָה");
var question2=Remove_Pronunce_Hebrew("שְׁאֵלָה");
//console.log(question2,"שְׁאֵלָה");
if(Remove_Pronunce_Hebrew("שְׁאֵלָה")===Remove_Pronunce_Hebrew("שְׁאֵלָה")){
	console.log("==");
}

console.log("end");



