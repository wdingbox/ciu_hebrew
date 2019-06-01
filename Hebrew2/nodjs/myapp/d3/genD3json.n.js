
console.log("...");


var cheerio = require('cheerio');
var fs = require('fs');


function GetObjFrFile(jsfile){
    var strdata = fs.readFileSync(jsfile, 'utf8');
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
    var idot=name.indexOf(".");
    if(idot>0){
        s="";
        outfile=name;
    }
    fs.writeFileSync(outfile, s+JSON.stringify(Obj, null,2) , 'utf8');
    console.log(outfile); 
}

function Remove_RLM(phword){
    //return Remove_Hebrew_buff(phword);
    //phword=phword.trim();
    //phword=phword.replace(/\u200f/g,'');
    //phword=phword.replace(/\u200f/g,'');
    var arr=phword.split();
    console.log();
    console.log(phword);
    console.log(arr);
        var sword='';
        for(var k=0;k<phword.length;k++){
            var code=phword.charCodeAt(k);
            var ch=phword.charAt(k);
            console.log(k,"charCodeAt",code,"charAt",ch);
            if(code>32 && code<127){//asci printable.   &rlm; &#8207;
                sword+=ch;
            }                
        }  
    console.log("sword",sword);
    var start=sword.indexOf("(H");
    var end=sword.indexOf(")",start);
    var sid=sword.substring(2+start,end)
    console.log("start",start,"end",end,"sid",sid);

    console.log("phword",phword);
    var start=phword.indexOf("(H");
    var end=phword.indexOf(")",start);
    var sid=phword.substring(2+start,end)
    console.log("start",start,"end",end,"sid",sid);
    return sword;
}

function Remove_Hebrew(phword){
    return phword;
    //return Remove_Hebrew_buff(phword);
    phword=phword.trim();
    phword=phword.replace(/\u200f/g,'');
    phword=phword.replace(/\u200f/g,'');
        var sword='';
        for(var k=0;k<phword.length;k++){
            var code=phword.charCodeAt(k);
            var ch=phword.charAt(k);
            console.log(k,"charCodeAt",code,"charAt",ch);
            if(code>32 && code<127){//asci printable.   &rlm; &#8207;
                sword+=ch;
            }                
        }  
        return sword;
}
function get_sid_From_root_txt(sroot){
	var idx=sroot.indexOf("(H");
	var end=sroot.indexOf(")", idx);
	if(idx <0 || end <= idx ){
		//console.log("key not found parent:", sroot);
		return null;
	}
	var sid=sroot.substring(2+idx,end);
	
	sid=sid.trim();
	while(sid.length<4) sid="0"+sid;

	//console.log("parent:",str);
	return sid;
}
function get_node_by_sid(d3Obj, sid){
	if(!d3Obj){
		return null;
	}
	var name=d3Obj["name"];
	if(name===sid){
		console.log("found it: ~~~  ~~~~  ~~~  ~~~~~");
		return d3Obj;
	}
	else{
		//console.log(name,"- != ---",sid, "d3Obj");
	}
	var children=d3Obj["children"];
	if(!children){
		return null;
	}
	var retObj=null;
	for(var i=0;i<children.length;i++){
		var child=children[i];
		if(child["name"]===sid){
			return child;
		}
		retObj=get_node_by_sid(child, sid);
		if(retObj)break;
	}
	return retObj;
}

function Parent_has_child(ParentObj,Child){
    var arr=ParentObj.children;
    for(var i=0;i<arr.length;i++){
        if(arr[i].name===Child.name){
            return true;
        }
    }
    return false;
};
function clone_obj(obj){
    var sjo=JSON.stringify(obj,null,2);
    return JSON.parse(sjo);
};

var D3DatStat={
    iLevel:0,
    iMaxDepth:0,
    SidOfParents:{},
    walkthrou:function(d3Obj){
        if(!d3Obj){
            return;
        }
        var name=d3Obj["name"];
        var parentName=d3Obj.parentName;
        if(!this.SidOfParents[name]){
            this.SidOfParents[name]=[];
        }
        this.SidOfParents[name].push(parentName);
        
        var children=d3Obj["children"];
        if(!children){
            return;
        }
        
        for(var i=0;i<children.length;i++){
            var child=children[i];
            this.iLevel++;
            if(this.iLevel>this.iMaxDepth)this.iMaxDepth=this.iLevel; 
            this.walkthrou(child);
            this.iLevel--;
        }
        return;
    },
    show:function(){
        var keys=Object.keys(this.SidOfParents);
        var totalDuplicatedKeys=0;
        for(var i=0;i<keys.length;i++){
            if(this.SidOfParents[keys[i]].length!=1){
                console.log("duplicated strongCode:"+keys[i]);
                totalDuplicatedKeys++;
            }
        }
        console.log("totalDuplicatedKeys:"+totalDuplicatedKeys);
        console.log("this.iMaxDepth",this.iMaxDepth);
        console.log("g_d3Obj.children.length:", g_d3Obj.children.length);
        for(var i=0;i<g_d3Obj.children.length;i++){
                    var s="g_d3Obj.children["+i+"].children.length:";
            console.log(s, g_d3Obj.children[i].children.length);
        }
        console.log("g_d3Obj total sid:", keys.length);
        save2js("./","SidOfParents",this.SidOfParents);        
    },
    SidRootTotFrq:{},
    calcTotFrqOfChildren:function(d3Root, outFrq){
        outFrq.TotFrq+=d3Root.frq;
        if(!d3Root.children) return;
        for(var i=0;i<d3Root.children.length;i++){
            this.calcTotFrqOfChildren(d3Root.children[i],outFrq);
        };
    },
    calcRootsTotFrq:function(g_d3Obj){
        for(var i=0;i<g_d3Obj.children.length;i++){
            var d3rootArr=g_d3Obj.children[i].children;
            for(var k=0;k<d3rootArr.length;k++){
                var d3root=d3rootArr[k];
                var sid=d3root.name;
                this.SidRootTotFrq[sid]={"parentName": d3root.parentName, "selfrq":d3root.frq,"TotFrq":0};
                this.calcTotFrqOfChildren(d3root,this.SidRootTotFrq[sid]);
            }
        }
        save2js("./","SidRootTotFrq",this.SidRootTotFrq); 
    }
};


//   "1000": [
//     "בֵּיצָה",
//     6,
//     "feminine noun",
//     "From the same as בּוּץ (H948)",
//     "egg (6x)."
//   ],


function main_root(iCase, iCreateNewRoot, Root_Key){
    //$=cheerio.load(VocabChaps);
    function _getNewObj(scode, arr){
    	var obj={};
    	obj["name"]=scode;
    	obj["hebrew"]=arr[0];
        obj["frq"]=arr[1];
        obj["PoS"]=arr[2];    	
    	obj["root"]=arr[3];
        obj["english"]=arr[4];
        obj["notes"]="";
        obj["parentName"]="";
    	obj["children"]=[];
    	return obj;
    };
    function _getNewObj_By_SID(sid){
    	var isid=parseInt(sid);
    	if( isid>=9000){
    		console.log("out of range(8674) sid:",sid)
    		return null;
    	}
    	var ary=g_5prop_Obj[sid];
    	if(!ary){
    		console.log("err g_5prop_Obj[sid]:["+sid+"]");
    		return null;
    	}
    	var obj=_getNewObj(sid, ary);
    	return obj;
    };
    function _get_idx_of_arr_by_sid(arr,sid){
        for(var i=0;i<arr.length;i++){
            var obj=arr[i];
            if(obj.name===sid){
                return i;
            }
        }
        return -1;
    }

    var iIncr=0;
    var keyArr=Object.keys(g_5prop_Obj);
    for(var i=0;i<keyArr.length;i++){
        var scode=keyArr[i];
        if(!scode) continue;
        var arr=g_5prop_Obj[scode];
        if(!arr){
        	//console.log("fatal err:",scode);
            //process.exit(1);
            continue;
        }

        var Rot=(arr[3]);
        var pObj=g_d3Obj.children[iCase];
        //////////// insert a new parent.
        //var nod=get_node_by_sid(g_d3Obj,scode);
        var idx=_get_idx_of_arr_by_sid(pObj.children,scode);
        if( idx>=0) {
            var nod=pObj.children[idx];
            console.log("idx:",idx,"nod:",nod);
            var parentSid=get_sid_From_root_txt(Rot);
            if(!parentSid)continue;
            var parobj=_getNewObj_By_SID(parentSid);
            if( parobj){//parent will be inserted into child position. 
                parobj.parentName=nod.parentName;
                var nod2=clone_obj(nod);
                nod2.parentName=parobj.name;
                parobj.children.push(nod2);
                g_5prop_Obj[scode]=null;

                pObj.children[idx]=parobj;
                continue;
            }
        }
        /////////////Remove_Hebrew
        
        var obj=_getNewObj(scode, arr);
        
        obj.parentName=pObj.name;
        switch(iCase){
        	case 0://var Root_Key="A primitive root";
            if(Parent_has_child(pObj,obj)){
                continue;
            }
            if(iCreateNewRoot<=0){
                if(Rot===Root_Key){
                    obj.parentName=pObj.name;
                    pObj.children.push(obj);
                    g_5prop_Obj[scode]=null;
                    iIncr++;
                }                
            }
            else{
                if(Rot.indexOf(Root_Key)>=0){
                    ////if(Rot.indexOf("(H")>0) continue;
                    obj.parentName=pObj.name;
                    pObj.children.push(obj);
                    g_5prop_Obj[scode]=null;
                    iIncr++;
                    continue;
                };
            }
    	    break;

    	    case 1://var Root_Key="From";
    	    if(Rot.indexOf(Root_Key)>=0){
    	    	//console.log(Rot);
    	    	var parentSid=get_sid_From_root_txt(Rot);
    	    	if(!parentSid)continue;
    	    	var parobj=get_node_by_sid(g_d3Obj,parentSid);
    	    	if(!parobj){
                    if(iCreateNewRoot<=0){
                        continue;
                    }
    	    		//console.log("to create new parent:sid=["+parentSid+"]"+Rot);
    	    		parobj=_getNewObj_By_SID(parentSid);
    	    		if(null==parobj){
                        console.log("***** Failed to add new parent["+parentSid+"]");
                        console.log("***** "+Rot);
                        Remove_RLM(Rot);
                        continue;
                    }
                    parobj.parentName=pObj.name;//=grp1
    	    		pObj.children.push(parobj);
                    //g_5prop_Obj[scode]=null;//not to delete. Since it has parent.
    	    		//console.log("ok add new to parent:",parentSid);
                    continue;
    	    	}
                else{
                    if(Parent_has_child(parobj,obj)){
                        continue;
                    }
                }

                obj.parentName=parobj.name;
                parobj.children.push(obj);
                g_5prop_Obj[scode]=null;
                iIncr++;
    	    }
    	    break;

            case 2:
            var parentSid=get_sid_From_root_txt(Rot);
            if( parentSid )continue;
            obj.parentName=pObj.name;
            pObj.children.push(obj);
            g_5prop_Obj[scode]=null;
            iIncr++;
            break;

    	    default:
    	    break;
    	}//switch
    };//
    return iIncr;
}










///////////////////////////////////////////////////////
////
var g_5prop_file="../wget_node/blueletter/out/props/oStrongCode_5props.js";
var g_5prop_Obj=GetObjFrFile(g_5prop_file);
var g_d3Obj={
    "name":"root",
    "children":[
    {"name":"grp0","children":[]},
    {"name":"grp1","children":[]},
    {"name":"grp2","children":[]},
    {"name":"grp3","children":[]},
    {"name":"grp4","children":[]},
    {"name":"grp5","children":[]},
    {"name":"grp6","children":[]}
    ]
};

var iCount=0;


while(main_root(0, 0, "A primitive root")>0){iCount++;};
//process.exit(0);
while(main_root(0, 1, "A primitive root")>0){iCount++;};

while(main_root(2, 0, " ")>0){iCount++;}


//////////////////////////////////////////
while(main_root(1, 0, "From")>0){iCount++;};
while(main_root(1, 0, "same as")>0){iCount++;}
while(main_root(1, 0, "From")>0){iCount++;};
while(main_root(1, 0, "same as")>0){iCount++;}
//////////////////////////////////////////
while(main_root(0, 1, "A primitive root")>0){iCount++;};
//////////////////////////////////////////
while(main_root(1, 0, "from")>0){iCount++;};
while(main_root(1, 0, "similar")>0){iCount++;};
while(main_root(1, 0, "From")>0){iCount++;};
while(main_root(1, 0, "same as")>0){iCount++;}
///////////////////0//////////////////////
while(main_root(1, 0, "Corresponding to")>0){iCount++;}
while(main_root(1, 0, "from")>0){iCount++;};
while(main_root(1, 0, "similar")>0){iCount++;};
while(main_root(1, 0, "From")>0){iCount++;};
while(main_root(1, 0, "same as")>0){iCount++;}
while(main_root(1, 0, "Corresponding to")>0){iCount++;}
///////////////////0//////////////////////
///////////////////0//////////////////////
while(main_root(1, 0, "For")>0){iCount++;}
while(main_root(1, 0, "Corresponding to")>0){iCount++;}
while(main_root(1, 0, "from")>0){iCount++;};
while(main_root(1, 0, "similar")>0){iCount++;};
while(main_root(1, 0, "From")>0){iCount++;};
while(main_root(1, 0, "same as")>0){iCount++;}
while(main_root(1, 0, "Corresponding to")>0){iCount++;}
while(main_root(1, 0, "For")>0){iCount++;}
//////////////////////////////////////////
//////////////////////////////////////////
while(main_root(1, 0, " ")>0){iCount++;}
while(main_root(1, 0, "For")>0){iCount++;}
while(main_root(1, 0, "Corresponding to")>0){iCount++;}
while(main_root(1, 0, "from")>0){iCount++;};
while(main_root(1, 0, "similar")>0){iCount++;};
while(main_root(1, 0, "From")>0){iCount++;};
while(main_root(1, 0, "same as")>0){iCount++;}
while(main_root(1, 0, "Corresponding to")>0){iCount++;}
while(main_root(1, 0, "For")>0){iCount++;}
while(main_root(1, 0, " ")>0){iCount++;}


while(main_root(2, 0, " ")>0){iCount++;}


while(main_root(1, 1, " ")>0){iCount++;}
while(main_root(1, 0, " ")>0){iCount++;}
while(main_root(1, 0, "For")>0){iCount++;}
while(main_root(1, 0, "Corresponding to")>0){iCount++;}
while(main_root(1, 0, "from")>0){iCount++;};
while(main_root(1, 0, "similar")>0){iCount++;};
while(main_root(1, 0, "From")>0){iCount++;};
while(main_root(1, 0, "same as")>0){iCount++;}
while(main_root(1, 0, "Corresponding to")>0){iCount++;}
while(main_root(1, 0, "For")>0){iCount++;}
while(main_root(1, 0, " ")>0){iCount++;}
while(main_root(1, 1, " ")>0){iCount++;}
console.log("iCount",iCount);
//main_root(2,"same as");
D3DatStat.walkthrou(g_d3Obj);
D3DatStat.show();
D3DatStat.calcRootsTotFrq(g_d3Obj);





save2js("./","g_d3Obj",g_d3Obj);

save2js("","flare.json",g_d3Obj);




console.log("end");



