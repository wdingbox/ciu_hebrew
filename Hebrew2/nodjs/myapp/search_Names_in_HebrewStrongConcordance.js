console.log("...");

//var fs = require('fs');  // file system
//var rstream = fs.createReadStream('../../HebrewWordsStats_rooter.htm');
var g_PATH="../../../../../../___bigdata/unzipped/rel/ham12/hgsbible/";
////https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H85&t=KJV
var cheerio = require('cheerio');
var fs = require('fs');

var g_htmHdr=fs.readFileSync("../../noduti/tmpl/table_HtmHeaders.htm");










//exit();
 
var StrongStats={
 m_StrongCodes:{},
 m_Stats:{},
 pick:function(shref,shebrew){
    shebrew=shebrew.trim();
    var StrongCode=shref.trim(); 
    //console.log("pick:"+shref+":"+shebrew);
    if(!this.m_Stats[StrongCode]){
        this.m_Stats[StrongCode]={};
    }
    if(!this.m_Stats[StrongCode][shebrew]){
        this.m_Stats[StrongCode][shebrew]=0;
    }
    this.m_Stats[StrongCode][shebrew]++;

    if( !this.m_StrongCodes[shebrew]){
        this.m_StrongCodes[shebrew]=0;
    }
    this.m_StrongCodes[shebrew]+=1;
 },
 save2Table:function(fname){
    function _getFrq(obj){
        var keys2Arr=Object.keys(obj) ;
        var nTot=0;
        for(var i=0;i<keys2Arr.length;i++){
            nTot+=obj[keys2Arr[i]];
        }
        return nTot;
    }
    function _getCodeLink(StrongCode){
        var iStrongCode=parseInt(StrongCode);
        if(iStrongCode>8674){
            var url="http://lexiconcordance.com/hebrew/";//8650.html
            return "<a class='xsc' href='"+url+StrongCode+".html'>"+StrongCode+"</a>";
        }
        var ret="<a href='"+g_PATH+"s/h"+StrongCode+".htm'>"+StrongCode+"</a>";
        return ret;
    }
    function _htlist(obj){
        var ret="<div>";
        var keysArr=Object.keys(obj) ;
        for(var i=0;i<keysArr.length;i++){
            var word=keysArr[i];
            var freq=obj[word];
            var aa="<a href='"+g_PATH+"s/h"+word+".htm'>"+word+"</a>";
            ret+=""+aa +"<span class='frq'>("+freq+")</span> ";
        }
        ret +="</div>";
        return ret;
    }
    var stb="\n<table border='1'><thead><tr><th>#</th><th>Strong</th><th>Hebrew</th><th>frq</th><th>lst</th></tr><thead>\n";
    stb+="<tbody>\n";
    var keysArr=Object.keys(this.m_Stats) ;
    for(var i=0;i<keysArr.length;i++){
        var key=keysArr[i];
        var obj=this.m_Stats[key];
        var str=_htlist(obj);
        //for( key in obj ){
        //    var oob=obj[key];
        var strd=key.trim();
        var shbr=(key);
        var n=_getFrq(obj);
        stb+="<tr><td>"+i+"</td><td>"+strd+"</td><td>"+shbr+"</td><td>"+n+"</td><td>"+str+"</td></tr>\n\n";
        //}
    }
    stb+="</tbody></table>";
    
    var htmHdr=g_htmHdr;
    fs.writeFileSync(fname, htmHdr+stb, 'utf-8');
    console.log(fname);


 },
 saveSpecialNamesOfStrongCodes:function(outname){
    var codesArr=Object.keys(this.m_StrongCodes);
    codesArr.sort();
    console.log("tot strong codes:"+codesArr.length);
    var strjs="var HebrewSpecialNamesStrongCodesArr=";
    strjs+=JSON.stringify(codesArr);
    strjs+=";\n";

    //var outname="../../nodout/json/HebrewSpecialNamesStrongCodesArr";
    fs.writeFileSync(outname+".js", strjs, 'utf-8');

    var ss=g_htmHdr;
    ss+="<table border='1'><tbody>";
    for(var i=0;i<codesArr.length;i++){
        var sStrongCode=codesArr[i];
        var aa="<a href='"+g_PATH+"s/h"+sStrongCode+".htm'>"+sStrongCode+"</a>";
        var tt=Get_Names_Desc(sStrongCode);
        ss+="<tr><td>"+i+"</td><td>"+aa+"</td><td/><td class='tt'>"+tt+"</td></tr>\n";
    }
    ss+="</tbody></table>";
    fs.writeFileSync(outname, ss, 'utf-8');
    console.log(outname);
 },
 save2Json:function(){
    fs.writeFileSync('./data.json', JSON.stringify(this.m_Stats) , 'utf-8');
 }
};////////StrongStats



function GetDom(StrongCode){
    var iStrongCode=parseInt(StrongCode);
    if(iStrongCode>8674){
        return "---"
    }
    var StrongCode=""+iStrongCode;
    while( StrongCode.length<4 ) {
        StrongCode="0"+StrongCode;
    }
    //console.log(StrongCode);

    var fname=g_PATH+"s/h"+StrongCode+".htm";
    var data=fs.readFileSync(fname, 'utf8');
    $ = cheerio.load('' + data + '');
    return $;
}


function search_Names(StrongCode){
    $=GetDom(StrongCode);
    //$('p.c').each(process_verse);
    var shbr="";
    var arr=[];
    var txt=$('div.x > pre ').text();
    //console.log(txt);
    var wordArr=txt.split(" ");
    //console.log(wordArr);
    //console.log("===");
    for(var i=0;i<wordArr.length;i++){
        var word=wordArr[i];
        var match=word.match(/[A-Z]([a-z\']{1,})/g);
        if(match){
            //console.log(match);
            for(var k=0;k<match.length;k++){
                var swd=match[k];
                //StrongStats.pick(swd,StrongCode);
            }
        }
    }

    word=$('div.zzz > ul').find('li').eq(2).find("b").text();
    var match=word.match(/[A-Z][a-z\-]*/g);
        if(match){
            //console.log(match);
            for(var k=0;k<match.length;k++){
                var sCapword=match[k];
                StrongStats.pick(sCapword,StrongCode);
            }
        }

    return;
}


function Get_Names_Desc(StrongCode){
    $=GetDom(StrongCode);
    var ret=$('div.zzz').html();
    return ret;
}





console.log("start running");


var fread=g_PATH+"hgb/01_Gen_001.htm";

var path=g_PATH+"hgb/";//s/

var outdir="../../nodout/hebrew_reader/";

//read_one_htmfile(fread);
//read_in_dir(path);
//StrongStats.save2Table();
//StrongStats.save2Json();

for(var i=1;i<=8674;i++){
    var sStrong=""+i;
    while(sStrong.length<4){
        sStrong="0"+sStrong;
    }
    var tst = search_Names(sStrong);    
}

StrongStats.save2Table(outdir+"HebrewSpecialNamesStrongCodesTable2.htm");
StrongStats.saveSpecialNamesOfStrongCodes(outdir+"HebrewSpecialNamesStrongCodesArr.htm");
//console.log(JSON.stringify(clsnameArr)); 

console.log("end");



