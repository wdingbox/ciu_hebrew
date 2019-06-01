console.log("...");


var g_Vocabs='VocabChapsBuf.js';



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
    //console.log(jsfile);
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

function auto_convert_audio_fr_eng(eng){
    var audiofilename="";
            var engstr=eng.replace("(fem.)","f");
            var idx=engstr.indexOf("[");
            if(idx>0){
                engstr=engstr.substr(0,idx);
                engstr=engstr.trim();              
            }
            engstr=engstr.replace(/[\(\)\!\'\"\,\/]/g," ");
            console.log("t1",engstr);
            engstr=engstr.trim();
            var engar=engstr.split(/[,\s]/);
            audiofilename=engar.join("_")+".mp3";
            audiofilename=audiofilename.replace(/([\_]{2,2})/g,"\_");
            audiofilename=audiofilename.replace(/([\_]{2,2})/g,"\_"); 
    return audiofilename;   
}
function get_AudioStreamFileName(ar){
        var audiofilename=ar[1];
        if(".mp3"==ar[1]){
            auto_convert_audio_fr_eng(ar[0]);
        }   

        return audiofilename;
};
function mkdir_path(spathdir){
    if(fs.existsSync(spathdir)){
       //console.log("=exist:",spathdir);
    }
    else{
        console.log("*** mkdir:",spathdir);
        fs.mkdirSync(spathdir);
    }
}
function mkdir_path_file(spathdir){
    if(fs.existsSync(spathdir)){
       //console.log("===++file exist:",spathdir);
    }
    else{
        console.log("-*-*-*- mkfile:",spathdir);
        fs.writeFileSync(spathdir,"-",'utf8');
    }
}
function run_path_file(chap, VocabsObj, language){
        var pathdirEng="../audio/english/"+chap;
        var pathdirHeb="../audio/"+language+"/"+chap;
        mkdir_path(pathdirEng);
        mkdir_path(pathdirHeb);

        var obj=VocabsObj[chap];
        var keyarr=Object.keys(obj);
        for(var i=0;i<keyarr.length;i++){
            var heb=keyarr[i];
            var arr=obj[heb];
            var eng=arr[0];
            var strmname=get_AudioStreamFileName(arr);
            console.log(language,":\n",eng, "\n",strmname);

            var pathfilename=pathdirHeb+"/"+strmname;
            mkdir_path_file(pathfilename);

        }
}
function minedata(){
    var VocabsObj=GetObjFrFile(g_Vocabs);
    var chapsArr=Object.keys(VocabsObj);
    for(var i=0;i<chapsArr.length ;i++){
        var chap=chapsArr[i];
        run_path_file(chap, VocabsObj, "hebrew");
        run_path_file(chap, VocabsObj, "english");
    };
};

minedata();



console.log("end");



