console.log("...");


var cheerio = require('cheerio');
var fs = require('fs');

//var g_htmHdr=fs.readFileSync("../../noduti/tmpl/table_HtmHeaders.htm");

//https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H3068

var wget = require('node-wget');


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


///#self.dnld_img("/CharacterImages/Oracle/J00000/j02800/j02842.gif", "test2.gif")
var ImgDwnload={
    ChineseEtymologyMeta:{},
    findFileInHtmDir:function(){
        var charsArr=[];
        var dir="htm";
        console.log(dir);
        var files=fs.readdirSync("./htm/");
        for(var i=0;i<files.length;i++){
            var file=files[i];
            if(file.length<3)continue;
            var cha=file.charAt(0);
            console.log(cha);
            charsArr.push(cha);
        }
        console.log("total:", charsArr.length);
        return charsArr;
    },
    load_single_char_htm:function(char){
        var filname=get_destination_file(char);
        console.log("\n",filname);
        if(dest_is_exist(char)==false) return;
        var content=fs.readFileSync(filname);
        $=cheerio.load(""+content);
        $("img").each(function(){
            var src=$(this).attr("src");
            if(src.indexOf("CharacterImages")<0){
                return;
            }

            if( fs.existsSync(src.substr(1)) || fs.existsSync(src.substr(0)) ){
                console.log("***already exist:",src);
                return;
            }
        
            var nodeArr=ImgDwnload.get_path_nodes(src);
            src=ImgDwnload.get_path_str(nodeArr);
            var destDir=nodeArr[0]+"_"+nodeArr[1];
            var destFil=nodeArr[2]+"_"+nodeArr[3]+"_"+nodeArr[4];
            var destFullName="img/"+destDir+"/"+destFil;
            if(fs.existsSync(destFullName)){
                console.log("***   already exist:",src);
                return;
            }
            //console.log("destFullName=",destFullName);
            var ulr="http://www.chineseetymology.org/"+src;
            console.log("ulr=",ulr);
            console.log("destFullName=",destFullName);
            if(!ImgDwnload.ChineseEtymologyMeta[char]){
                ImgDwnload.ChineseEtymologyMeta[char]={};
            }
            if(!ImgDwnload.ChineseEtymologyMeta[char][destDir]){
                ImgDwnload.ChineseEtymologyMeta[char][destDir]=[];
            }
            ImgDwnload.ChineseEtymologyMeta[char][destDir].push(destFil);
        });

        var s="var ChineseEtymologyStats=\n"+JSON.stringify(ImgDwnload.ChineseEtymologyMeta,null,2);
        fs.writeFileSync("jsn/ChineseEtymologyStats.js",s,"utf8");
    },
    get_path_nodes:function(src){
        function __cleanArr(arr){
            var arr2=[];
            for(var i=0;i<arr.length;i++){
                var s=arr[i].trim();
                if(s.length==0)continue;
                arr2.push(s);
            }   
            return arr2;         
        }
        var indx=src.indexOf("img");
        if( indx>=0){
            src=src.substr(indx+3);
            console.log("Old htm file",src);
            src=src.replace(/\//g,"_");
            var arr=src.split("_");
            return __cleanArr(arr);
        }
        return __cleanArr(src.split("/"));
    },
    get_path_str:function(nodeArr){
        return nodeArr.join("/");
    },
    load_charsArr:function(charsArr){
        for(var i=0;i<charsArr.length;i++){
            var cha=charsArr[i];
            this.load_single_char_htm(cha);
        }
    },

    main:function(){
        var charsArr=ImgDwnload.findFileInHtmDir();
        ImgDwnload.load_charsArr(charsArr);
    }
}

//
//ImgDwnload.load_charsArr(charsTotArr);
ImgDwnload.main();

console.log("wait for download finished.");



