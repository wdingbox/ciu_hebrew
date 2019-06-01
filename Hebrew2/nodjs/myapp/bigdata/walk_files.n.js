console.log("...");

//var fs = require('fs');  // file system
//var rstream = fs.createReadStream('../../HebrewWordsStats_rooter.htm');


var cheerio = require('cheerio');
var fs = require('fs');
//var g_htmHdr=fs.readFileSync("../noduti/tmpl/table_HtmHeaders.htm");


function walk_baseAry(dir){
    var len=dir.length;
    function _walk(dir, len) {
        var results = [];
        var list = fs.readdirSync(dir)
        for(var i=0;i<list.length;i++){//forEach(function(file) {
            var file=list[i];
            if(file=="." || file=="..") continue;
            if(file.charAt(0)==".")continue;
            pathfile = dir + '/' + file
            var stat = fs.statSync(pathfile)
            if (stat && stat.isDirectory()) results = results.concat(_walk(pathfile,len))
            else {
                var base=pathfile.substr(len);//base ary
                results.push(base.trim()); //+"(@)"+stat.size]);
                //console.log(base)              
            };
        };
        return results;
    } 
    var ret= _walk(dir, len);
    return ret;  
}

function compare_2arry(path1, ary1, path2,ary2, samefilesamesizeArr,samefileDifsizeArr){
    var comm=[], difersize=[], ret1=ary1.slice();//clone
    console.log("befor: ary1",ary1.length, "ary2",ary2.length, "samefilesamesizeArr",samefilesamesizeArr.length,"samefileDifsizeArr",samefileDifsizeArr.length );
    for(var i=0;i<ret1.length;i++){
        var item1=ret1[i];
        //console.log(item1);
        var idx1=ary1.indexOf(item1);
        var idx2=ary2.indexOf(item1);

        var bComm=false;
        if( idx1>=0 && idx2>=0 ){
            var item2=ary2[idx2];
            var pathfile1=path1+item1;
            var pathfile2=path2+item2;
            var stat1 = fs.statSync(pathfile1);
            var stat2 = fs.statSync(pathfile2);

            if(stat1.size=stat2.size){
                samefilesamesizeArr.push(item1);
                //console.log(item1);
                ary1.splice(idx1,1);//remove 
                ary2.splice(idx2,1);//remove  
                bComm=true;              
            }
            else{
                samefileDifsizeArr.push(item1);
                ary1.splice(idx1,1);//remove 
                ary2.splice(idx2,1);//remove              
            }
        }
        
        if(bComm){
            //comm.push(item1)
        }
    }
    console.log("after: ary1",ary1.length, "ary2",ary2.length, "samefilesamesizeArr",samefilesamesizeArr.length,"samefileDifsizeArr",samefileDifsizeArr.length );
    return comm;
}
function writeout(fname,jsonObj){
    console.log(fname,jsonObj.length)
    fs.writeFileSync(fname+".js", JSON.stringify(jsonObj,null,2), "utf8");    
}
function make_cp_sh(fname, path1, path2, ary1){
    var cmdary="#!/bin/sh\n";
    for(var i=0;i<ary1.length;i++){
        var item1=ary1[i];
        var pathfile1=path1+item1;
        var pathfile2=path2+item1;
        var onlyPath = require('path').dirname(pathfile2);
        cmdary+="mkdir -p '"+onlyPath +"'\n";
        cmdary+=("cp -v \'"+pathfile1+"\' \'"+pathfile2+"\'\n")
    }
    fs.writeFileSync(fname, cmdary, "utf8");   
    return cmdary;
}
function make_rm_sh(fname, path2, ary2){
    var cmdary="#!/bin/sh\n";
    for(var i=0;i<ary2.length;i++){
        var item1=ary2[i];
        var pathfile2=path2+item1;
        cmdary+=("rm -v \'"+pathfile2+"\'\n")
    }
    fs.writeFileSync(fname, cmdary, "utf8");   
    return cmdary;
}






//////////////////////////////////////////////
var DuplicateFileFinder=function(path, baseArr){
    this.m_samesizefileArr=[];
    this.m_duplicatedFilesGrp=[],
    this.m_path=path;
    this.m_baseArr=baseArr;
};
DuplicateFileFinder.prototype.find_dupfiled_in_samesized_files=function(samesize, samesizefileArr){
    //samesizefileArr=this.m_samesizefileArr;

        if(samesizefileArr.length<=1) return;
        if(samesizefileArr[0].length<3) return;
        
        var myarr=samesizefileArr.slice();//clone;
        //console.log("myarr[0]",myarr[0],myarr);
        var dat=fs.readFileSync(myarr[0],null);
        var buf=new Buffer(dat);
        var arrDiff=[], arrDup=[];
        arrDup.push(myarr[0]);
        arrDiff.push(myarr[0]);
        for(var i=1;i<myarr.length;i++){
            var file=myarr[i];
            var dat=fs.readFileSync(file,null);
            var buf2=new Buffer(dat);
            var bDiff=false;
            for(var k=0;k<buf2.length;k++){
                if( buf[k]!=buf2[k]){
                    bDiff=true;
                    break;
                }
            }
            if(bDiff){
                arrDiff.push(file);
                //console.log("find duplicated:",file);
            }
            else{
                arrDup.push(file);
            }
        }
        if(arrDup.length>1){
            var obj={};
            obj[samesize]=arrDup;
            this.m_duplicatedFilesGrp.push(obj);
            //console.log("find duplicated:",arrDup);
        }
        if(arrDiff.length>1 && arrDiff.length < samesizefileArr.length){
            this.find_dupfiled_in_samesized_files(samesize, arrDiff);
        }
};
DuplicateFileFinder.prototype.show=function(){
    for(var i=0;i<this.m_duplicatedFilesGrp.length;i++){
        var arr=this.m_duplicatedFilesGrp[i];
        console.log("dup grp",i);
        console.log(arr);
    }

    var fname="duplicated";
    fs.writeFileSync(fname+".js", "var "+fname+"=\n"+JSON.stringify(this.m_duplicatedFilesGrp,null,2),"utf8");
};

DuplicateFileFinder.prototype.start=function(){
    ////////
    var path=this.m_path, baseArr=this.m_baseArr;
    var sizeFiles={};
    for(var i=0;i<baseArr.length;i++){
        var pathfile=path+baseArr[i];
        var stat = fs.statSync(pathfile);
        var size=stat.size;
        if(!sizeFiles[size]){
            sizeFiles[size]=[];
        }
        sizeFiles[size].push(pathfile);
        //console.log(i, pathfile)
    };
    var count=0;
    var sizeAr=Object.keys(sizeFiles);
    for(var i=0;i<sizeAr.length;i++){
        var size=sizeAr[i];
        var arr=sizeFiles[size];
        if(arr.length>1){
            count++;
            //console.log("dup",count,size,arr);
            this.find_dupfiled_in_samesized_files(size, arr);
        }
    }

    this.show();
}

////}//////////////////////////////////////


console.log("start running");





var project_arr=["___incrementalRO","___biblestudy","___solid","zips",""];

var folder="___incrementalRO/";
folder="___biblestudy/";
folder="___solid";
folder="zips";

for(var i=0;i<project_arr.length;i++){
    console.log(i, project_arr[i]);
}

if(process.argv.length!=3){
    console.log("\nPlease select a folder to work on (0--4)");
    console.log(process.argv);
   
    process.exit(1);
}
var iselect=parseInt(process.argv[2]);
folder=project_arr[iselect]+"/";
console.log("\n-----------\nYou working on:", folder);


var g_src_dir="../../../../../../../___bigdata/___compact/"+folder;
var g_DES_DIR="/Volumes/NO_NAME/github/weidroot_2017-01-06/___bigdata/___compact/"+folder;


//read_one_htmfile(fread);
var ret1=walk_baseAry(g_src_dir);

//find_dupfile(g_src_dir,ret1);
var fndup=new DuplicateFileFinder(g_src_dir, ret1);
fndup.start();



var ret2=walk_baseAry(g_DES_DIR);
var samefilesamesize=[], samefilediffsize=[];
var ret=compare_2arry(g_src_dir,ret1,g_DES_DIR,ret2, samefilesamesize, samefilediffsize);
writeout("samefilesamesize",samefilesamesize)
writeout("samefilediffsize",samefilediffsize)
writeout("ret1",ret1)
writeout("ret2",ret2)

console.log("ret",ret.length,"ret1",ret1.length,"ret2",ret2.length);
make_cp_sh("cp_new.sh", g_src_dir, g_DES_DIR, ret1);
make_cp_sh("cp_upd.sh", g_src_dir, g_DES_DIR, samefilediffsize);
 

make_rm_sh("rm_dest_extra.sh", g_DES_DIR, ret2)




console.log("end");



