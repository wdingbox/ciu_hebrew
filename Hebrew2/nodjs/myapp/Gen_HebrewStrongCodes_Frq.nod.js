console.log("...");
console.log(process.argv);
if(process.argv.length!=4){
    console.log("\nNeed inclusive range params:  iStart iEnd ")
    console.log("iStart, iEnd: 1--40 OT book index\n")
    process.exit(1);
}

//var fs = require('fs');  // file system
//var rstream = fs.createReadStream('../../HebrewWordsStats_rooter.htm');
var g_PATH="../../../../../../___bigdata/unzipped/rel/ham12/hgsbible/";

//int
var g_voiceUrl="https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H";

var cheerio = require('cheerio');
var fs = require('fs');
var g_htmHdr=fs.readFileSync("../noduti/tmpl/table_HtmHeaders.htm");



function GetHebrewArryFromStrongCode(StrongCode){
    var iStrongCode=parseInt(StrongCode);
    if(iStrongCode>8674){
        return [];
    }
    var fname=g_PATH+"s/h"+StrongCode+".htm";
    var data=fs.readFileSync(fname, 'utf8');
    $ = cheerio.load('' + data + '');
    //$('p.c').each(process_verse);
    var shbr="";
    var arr=[];
    $('div.x > pre > a.u').each(function(i,el){
        shbr=$(el).text().trim();
        arr.push(shbr);
    });
    shbr=arr.join("&nbsp;");
    //console.log(shbr);
    return arr;
}
function GetHebrewDivFromStrongCode(StrongCode){
    //$('p.c').each(process_verse);
    var shbr="";
    var arr=GetHebrewArryFromStrongCode(StrongCode);
    if(arr.length===0)return "~-~";

    shbr=arr.join("&nbsp;");
    var aa="<div><a class='hebr' href='"+g_voiceUrl+StrongCode+"'>";
    for(var i=0;i<arr.length;i++){
        aa+=arr[i]+"</a>&nbsp;<a>";
    }
    aa+="</a><div>";
    //console.log(shbr);
    return aa;
}

var tst = GetHebrewArryFromStrongCode("1004").join(" ");
console.log(tst);

//exit();

var StrongStats={
 m_Stats:{},
 m_outdir:"",
 pick:function(shref,shebrew){
    shebrew=shebrew.trim();
    var StrongCode=shref.substr(6,4); 
    //console.log("pick:"+shref+":"+shebrew);
    if(!this.m_Stats[StrongCode]){
        this.m_Stats[StrongCode]={};
    }
    if(!this.m_Stats[StrongCode][shebrew]){
        this.m_Stats[StrongCode][shebrew]=0;
    }
    this.m_Stats[StrongCode][shebrew]++;
 },
 _getFrq: function (StronCode){
        var obj=this.m_Stats[StronCode];
        var keys2Arr=Object.keys(obj) ;
        var nTot=0;
        for(var i=0;i<keys2Arr.length;i++){
            nTot+=obj[keys2Arr[i]];
        }
        return nTot;
},
 save2Table:function(outfile){

    function _getCodeLink(StrongCode){
        var iStrongCode=parseInt(StrongCode);
        if(iStrongCode>8674){
            var url="http://lexiconcordance.com/hebrew/";//8650.html
            return "<a class='xsc' href='"+url+StrongCode+".html'>"+StrongCode+"</a>";
        }
        var ret="<a href='"+g_PATH+"s/h"+StrongCode+".htm'>"+StrongCode+"</a>";
        return ret;
    }
    function _htlist(StrongCode){
        var iStrongCode=parseInt(StrongCode);
        var obj=StrongStats.m_Stats[StrongCode];   

        var ret="<div>", sremain="";
        var keysArr=Object.keys(obj) ;
        var nMax=keysArr.length;
        if( iStrongCode>=9000){
            nMax=10;//return "(many)";
            sremain="(and so on)"
        }
        for(var i=0;i<nMax;i++){
            var word=keysArr[i];
            if(!word) break;
            var freq=obj[word];
            ret+=""+word +"&lrm;<span class='frq'>("+freq+")</span> ";
        }
        ret +=sremain+"</div>";
        return ret;
    }
    var stb="\n<table border='1'><thead><tr><th>#</th><th>Strong</th><th>Hebrew</th><th>frq</th><th>lst</th></tr><thead>\n";
    stb+="<tbody>\n";
    var keysArr=Object.keys(this.m_Stats) ;
    for(var i=0;i<keysArr.length;i++){
        var key=keysArr[i];
        //var obj=this.m_Stats[key];
        var str=_htlist(key);
        //for( key in obj ){
        //    var oob=obj[key];
        var strd=_getCodeLink(key);
        var shbr=GetHebrewDivFromStrongCode(key);
        var n=this._getFrq(key);
        stb+="<tr><td>"+i+"</td><td>"+strd+"</td><td>"+shbr+"</td><td>"+n+"</td><td>"+str+"</td></tr>\n\n";
        //}
    }
    stb+="</tbody></table>";
    //'./oStrongCodeTable.htm'
    fs.writeFileSync(outfile, g_htmHdr+stb, 'utf-8');

    console.log(outfile);
 },

 save2UncoveredCodesList:function(outfile){
    var ss=g_htmHdr;
    ss+="<table border='1'>";
    var k=0;
    var unlistedCode=[];
    for(var i=1;i<=8674;i++){
        var scode=""+i;
        while(scode.length<4){
            scode="0"+scode;
        }
        if(!this.m_Stats[scode]){
            var aa="<a href='"+g_PATH+"s/h"+scode+".htm'>"+scode+"</a>";
            ss+="<tr><td>"+(k++)+"</td><td>"+aa+"</td></tr>\n";
            unlistedCode.push(scode);
        }
    }
    ss+="</table>";
    //'./oStrongCodeTable_Uncovered.htm'
    this.save2Json(outfile, unlistedCode);
    //fs.writeFileSync(outfile, JSON.stringify(unlistedCode, null,2) , 'utf-8');
    //console.log(outfile);
 },
save2Json:function(outfile, jsobj){
    var s="var "+outfile+"=\n";
    outfile=this.m_outdir+outfile+".js";
    fs.writeFileSync(outfile, s+JSON.stringify(jsobj, null,2) , 'utf-8');
    console.log(outfile);
 },
save2SortedStrongCodeUsage:function(outfile){
    this.save2Json(outfile, this.m_Stats);
 },
save2SortedStrongCodeFrq:function(outfile){
    var keysArr=Object.keys(this.m_Stats).sort();
    var CodFrq={};
    for(var i=0;i<keysArr.length;i++){
        var StrongCode=keysArr[i];
        var hebrw=GetHebrewArryFromStrongCode(StrongCode).join(" ");
        var frq=this._getFrq(StrongCode);
        CodFrq[StrongCode]=[frq,hebrw];
    }
    this.save2Json(outfile, CodFrq);
 }
};////////StrongStats





//var fs2 = require('fs');  // file system
//var wstream = fs2.createWriteStream('fileToWrite.txt');
//wstream.write("aaa");


function read_in_dir(path){
    var items=fs.readdirSync(path);
    for (var i=0; i<items.length; i++) {
        
        var fname=items[i];
        var sidx=fname.substr(0,2);
        var idxf=parseInt(sidx); //file index
        var iStart=process.argv[2];
        var iEnd=process.argv[3];
        if(idxf < iStart || idxf > iEnd){//40
            console.log(fname);
            continue;
        }
        var fname=path+fname;
        console.log(fname);
        read_one_htmfile(fname);
    }   
}
function read_one_htmfile(fname){
    //var fread=g_PATH+"hgb/01_Gen_001.htm";
    //fs.readFile(fread, 'utf8', dataLoaded);//async method. 
    var data=fs.readFileSync(fname, 'utf8');
    $ = cheerio.load('' + data + '');
    $('p.c').each(function(i,elem){
        process_verse_p_c(i,elem);
    });

    $('p.b').each(process_verse_p_b);
    //var len=$('p.c').length;
    //for(var i=0;i<len;i++){
    //    process_verse(i, $('p.c')[i]);
    //}
}
var clsnameArr={};
function process_verse_p_b(i, elem) {

        $(elem).find("a.s[href*='../s/h']").each(function(){
            var shref=$(this).attr("href");
            var text=$(this).html();
            if(shref.indexOf("h0000.htm")<0){
                StrongStats.pick(shref,text);
                //console.log(shref+","+text);               
            } 
            else{
                console.log(shref+","+text);   
            }

        });// $.html(elem);//for outerHTML

        //});           
};
function process_verse_p_c__no_prefix_(i, elem) {
        var filename = "../../nodout/html/"+ i + '.html';
        var content="<a>"+filename+"</a><hr>\n\n\n<table border='1'>";

        var innerHtm = $(elem).find("a").each(function(){
            var sHbrWord=$(this).text().trim();
            var shref=$(this).attr("href");
            if(shref && shref.length>1 && sHbrWord.length>0){
                StrongStats.pick(shref,""+sHbrWord+"");
            }
            
        });// $.html(elem);//for outerHTML
};
function process_verse_p_c(i, elem) {
        var filename = "../../nodout/html/"+ i + '.html';
        var content="<a>"+filename+"</a><hr>\n\n\n<table border='1'>";

        var innerHtm = $(elem).html();// $.html(elem);//for outerHTML
        //&#x5BE; marqet hypen
        //innerHtm=innerHtm.replace(/\&\#x5BE\;/g, "\r");
        var sHbrArr=innerHtm.split(/([\n\r])/g); //\־  
        //console.log("arr.len="+arr.length);

        var ii=0;
        for(var m=0;m<sHbrArr.length;m++){
            var sHbrWord=sHbrArr[m].trim();
            var ipos=sHbrWord.indexOf("<");
            if(ipos>0){
                //console.log("*******",sHbrWord);
                sHbrWord=sHbrWord.substr(ipos);
                //console.log("=======",sHbrWord);
            }
            if( sHbrWord.length==0) continue;
            ipos=sHbrWord.lastIndexOf(">"); 
            var lastcha=sHbrWord[ipos];
            //console.log(lastcha);
            if(sHbrWord[ipos]!=">"){
                console.log("*******",sHbrWord+"[**********]");
                sHbrWord=sHbrWord.substring(0,ipos);
                console.log("*******",sHbrWord+"[==========]");
            }

            if( sHbrWord.length==0) continue;
            
            var a$ = cheerio.load('' + sHbrWord + '');

            a$("a[href*='../s/h']").each(function(){
                var shref=a$(this).attr("href");
                if(shref){
                    sHbrWord=sHbrWord.replace(/title\=\"[^\"]*\"/g,"");
                    //content += "<tr><td>"+(ii++)+"</td><td>"+sHbrWord+"</td><td>";
                    //content += shref+"</td></tr>\n";
                    
                    //var txt=a$(sHbrWord).text();
                    StrongStats.pick(shref,sHbrWord);
                    //console.log("shref="+shref+","+a$(sHbrWord).text()+","+m);
                }
                else{
                    var slname=a$(this).attr("class");
                    //content+="<br/>\n";
                    if(slname){
                        //console.log("shref="+m+",class="+slname);
                    }
                    else{
                        //console.log("err shref="+m+",sHbrWord="+sHbrWord);
                        slname="notdefined";
                    }
                    if(!clsnameArr[slname]){
                        clsnameArr[slname]=0;
                    }
                    clsnameArr[slname] +=1;
                }

            });

        };

        content += "</table>\n";
        content += "<hr/>\n";
        $(elem).find("a").each(function(k,aelm){
            aelm=$(aelm).attr("title",null);
            content += $.html(aelm);

        });
        content += "</p>\n";
        content += "\n\n<hr/>\n\n"+$.html(elem);
        //fs.writeFileSync(filename, htmHdr+content, function(err) {
            //console.log('Written html to ' + filename);
        //});  
         
};





console.log("start running");


var fread=g_PATH+"hgb/01_Gen_001.htm";

var path=g_PATH+"hgb/";//s/
var outdir="./out/tmp/"

//read_one_htmfile(fread);
read_in_dir(path);
//StrongStats.save2Table(outdir+'oStrongCodeTable.htm');
StrongStats.m_outdir=outdir;
StrongStats.save2SortedStrongCodeUsage('oStrongCode_Usage');
StrongStats.save2UncoveredCodesList('oStrongCode_unlisted');
StrongStats.save2SortedStrongCodeFrq('oStrongCode_Frq');

console.log(JSON.stringify(clsnameArr)); 

console.log("end");



