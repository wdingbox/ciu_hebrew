function gen_js_fr_table(){

	function get_data_idxMax(){
		var n=0;
		var ntr=$('tr').length-1;
		var sidxMax=$("tr:eq("+ntr+")").find("td:eq(0)").text();
		var idxMax=parseInt(sidxMax);
		return idxMax;
	}
	var ss="var hebrew_word_verb2=[\n";
	var idxMax=get_data_idxMax();
	for(var t=0;t<=idxMax;t++){
		ss+=get_an_objstr(t);
	};
	ss+="];\n";
	return ss;
}
function get_an_objstr(idx){
		var retObj={};
		$("tr").each(function(){
			var sidx=$(this).find("td:eq(0)").text().trim();
			if(sidx===""+idx){
				var sform=$(this).find("td:eq(1)").text().trim();
				if(undefined === retObj[sform]){
					retObj[sform]={};
				}
				var sNumb=$(this).find("td:eq(2)").text().trim();
				if(undefined === retObj[sform][sNumb]){
					retObj[sform][sNumb]=[];
				}
				var idxMax=$(this).find("td").length;
				for(var i=3;i<idxMax;i++){
					var heb=$(this).find("td:eq("+i+")").text().trim();
					heb=heb.replace("\n","<br>");
					heb=heb.replace("\t","");
					heb=heb.replace(/	/g,"");
					retObj[sform][sNumb].push(heb);
				};	
				sret+="],\n";			
			};
		});
		//////
		var sret="{\n";
		$.each(retObj,function(key,obj){
			sret+="'"+key+"':{";
			$.each(obj,function(sN,arr){
				sret+="'"+sN+"':[";
				$.each(arr,function(i,val){
					sret+="'"+val+"',";
				});
				sret+="],";
			});
			sret=sret.substr(0, sret.length-1);
			sret+="},\n";
		});
		sret+="},\n";
		return sret;
};




function gen_table_ahat(){
	gen_table(hebrew_word_verb2,"all verbs");	
}
function gen_table(data_arr, capstr){
	var strs="";
	$.each(data_arr,function(i, heblexicalkey_obj){
		strs+=table2_trs(i, heblexicalkey_obj);
	});
	strs=trs_2_table(strs,capstr);

	$("#show").html(strs);	
	table_bind();
}
function table2_trs(idx, obj){
		function get_astr(sform, sN, idx, val){
			var s="";
			if(sform==="perfect" && sN==="p" && idx==4){
				return "";
			}
			if(sform==="imperative" && [0,3,4].indexOf(idx)>=0){
				return "x";
			}
			s+="<a class='heb'>"+val+"</a>";
			return s;
		}
		function get_td_cls(sform, sN, idx){
			var sarr=["perfect_s3", ];
			var scls=sform+"_"+sN+idx;
			if(sarr.indexOf(scls)>=0){
				return " class='heblexical'";
			}
			sarr=["perfect_s3", "narrative_s3", "imperative_s1"];
			if(sarr.indexOf(scls)>=0){
				return " class='basicChange'";
			}
			sarr=["perfect_p3", "perfect_p4"];
			if(sarr.indexOf(scls)>=0){
				return " class='perfect_p3_p4'";
			}
			sarr=["narrative_s1", "narrative_s4"];
			if(sarr.indexOf(scls)>=0){
				return " class='narrative_s1_s4'";
			}
			sarr=["narrative_p2", "narrative_p4"];
			if(sarr.indexOf(scls)>=0){
				return " class='narrative_p2_p4'";
			}
			return "";
		}
		var s="";
		$.each(obj,function(sform,obj2){
			var trbegin="<tr class='idx"+idx+"'><td>"+idx+"</td><td>"+sform+"</td>";
			
			$.each(obj2,function(sN,arr){
				s+=trbegin+"<td>"+sN+"</td>";
				$.each(arr,function(idx,val){
					if(val.length===0) val="&nbsp;&nbsp;";
					var asv=get_astr(sform,sN,idx,val);
					var tdcls=get_td_cls(sform,sN,idx);
					s+="<td "+tdcls+">"+asv+"</td>";
				});
				s+="</tr>";
			});
		});
		return s;
}

var g_vPG=["1c","2m","2f","3m","3f"];//,"cp1","mp2","fp2","mp3","fp3"];

var g_vPGN=["1cs","2ms","2fs","3ms","3fs","1cp","2mp","2fp","3mp","3fp"];
var g_vFORM=[];//"perfect","imperfect","narrative","imperative"];
function verb_cols(){

	var s="<th>form</th><th>n</th>";
	var titleAry=[];
	for(var m=0;m<g_vPG.length;m++){
			s+="<th>"+g_vPG[m]+"</th>";
	}	
	return [s,titleAry];
}
function trs_2_table(trs,caption){

	var s="<table class='tablesorter' border='1'><caption>"+caption+"</caption>";
	s+="<thead>";
	s+="<tr><th>#</th>";
	s+=verb_cols()[0];
	s+="</tr>";
	s+="</thead>";
	s+="<tbody>";
	s+=trs;
	s+="</tbody>";
	s+="</table>";
	return (s);
}
function table_bind(){
	$("td").bind("click",function(){
		$(this).toggleClass("chkclr");
		$(this).attr('contenteditable', function(index, attr){
			return true;
		});
		var src=$(this).attr("aud");
		if(!!src){
			var s2="<audio autoplay><source src='"+src+"' type='audio/mpeg' /></audio>";
			$("#audio").html(s2);
			console.log(src);			
		};
	});	

	$(".heblexical").bind("click",function(){
		var sidx=$(this).parentsUntil("tbody").find("td:eq(0)").text().trim();
		//alert(sidx);
		var idx=parseInt(sidx);
		var strjs=get_an_objstr(idx);
		strjs=clean_jstr(strjs);
		$("#txarea").val(strjs);
		var jsObj=JSON.parse(strjs);
		update_hebrew_word_verb2(jsObj);
		$("#txarea").val(JSON.stringify(jsObj));
		strjs=JSON.stringify(hebrew_word_verb2);
		var sout="var hebrew_word_verb2="+beautify_jstr(strjs)+";";
		$("#txarea").val(sout);
		
	});
}
function update_hebrew_word_verb2(jsobj){
	function get_lexic(jsobj){
		return jsobj["perfect"]["s"][3];
	}
	var strlex=get_lexic(jsobj);
	for(var i=0;i<hebrew_word_verb2.length;i++){
		if(get_lexic(hebrew_word_verb2[i])==strlex){
			hebrew_word_verb2[i]=jsobj;
		}
	};
}
function clean_jstr(strjs){
		strjs=strjs.replace(/\,\n$/,'');
		strjs=strjs.replace(/\'/g,'\"');
		strjs=strjs.replace(/\,\]/g, "]");
		strjs=strjs.replace(/\,\n\}/g, "}");
		strjs=strjs.replace(/\n/g, "");	
		return strjs;
}
function beautify_jstr(strjs){
		strjs=strjs.replace(/\{\"perfect\"/g, "\n\{\n\"perfect\"");
		strjs=strjs.replace(/\}\}\,/g, "\}\n\}\,\n");
		strjs=strjs.replace(/\]\}\}\]/g, "\]\}\n\}\n\]");
		var re = new RegExp("a|b", "i");
		var cvrt2=["narrative","imperative","imperfect","Active","Passive"];
		$.each(cvrt2,function(i,str){
			var reg=new RegExp("\""+str,"g");
			strjs=strjs.replace(reg, "\n\""+str);
		});	
		return strjs;
}
function enable_table_sorter(){
	//table sorter
	$("table").tablesorter({
    //  theme: 'blue',
        usNumberFormat : false,
        sortReset      : true,
        sortRestart    : true,  

        widgets: ['columns','output', ],//'zebra', 'editable'
    });	
}


///////////////////////////////////
function hebrew_word_verb_converter2(){
	var ss2="var hebrew_word_verb2=[\n";
	var snum=["s","p"],coma=[",",""];
	function get_sobj(jsn){
		var sobj="";
		$.each(jsn,function(key,arr){
			sobj+="'"+key+"':{";
			var k=0;
			for(var i=0;i<2;i++){
				sobj+="'"+snum[i]+"':[";
				for(var j=0;j<5;j++){
					sobj+="'"+arr[k]+"',";
					k++;
				}
				sobj+="]"+coma[i];
			}
			sobj+="},\n";
		});
		return sobj;
	}
	$.each(hebrew_word_verb,function(i,jsn){
		var sobj=get_sobj(jsn);
		if(sobj.length>0){
			ss2+="{\n"+sobj+"},\n";
		}	
	});
	ss2+="];\n";
	return ss2;
}
///////////////////


///////////////////
var WeakLetterArr=["א","ע","ה","ח","נ","ן","ו","י","ר"];
function show_weak_leters(){
	var s="<table border='1'>";
	for(var i=0;i<WeakLetterArr.length;i++){
		s+="<tr><td>"+i+"</td><td>"+WeakLetterArr[i]+"</td></tr>";
	}
	s+="</table>";
	$("#show").append(s);	
}
function GetRoot(hebword){
	var sWeak=[];
	for(var i=0;i<hebword.length;i++){
		var al=hebword.charCodeAt(i);
		if(al>=1488&&al<=1516){
			sWeak.push(hebword[i]);
		}
	}
	return sWeak;
}
function Show_AlphetLetters(){
	var s="<table border='1'>";
	var k=0;
	for(var i=1488;i<1515;i++){
		var al=String.fromCharCode(i);
		s+="<tr><td>"+(k++)+"</td><td>"+i+"</td><td class='heb'>"+al+"</td></tr>";
	}
	s+="</table>";
	return $("#show").append(s);
}
function GetWeak(hebword){
	var sWeak=[];
	for(var i=0;i<WeakLetterArr.length;i++){
		var al=WeakLetterArr[i];
		if(hebword.indexOf(al)>=0){
			sWeak.push(al);
		}
	}
	return sWeak.join(" | ");
}
function GetCharCodesList(hebword){
	var sWeak=[];
	for(var i=0;i<hebword.length;i++){
		var al=hebword.charCodeAt(i);
		sWeak.push("("+al+"==="+hebword[i]+")");
	}
	return sWeak.join(" <br> ");
}
var g_all_weak_type_statis={};
var g_TermType=["I","II","III"];
function Gen_weak_type_stats(hebword){
	var sroot=GetRoot(hebword);

	for(var i=0;i<sroot.length;i++){
		var al=sroot[i];
		if(WeakLetterArr.indexOf(al)>=0){
			var stpe=g_TermType[i]+"-"+al;
			if(!g_all_weak_type_statis[stpe]){
				g_all_weak_type_statis[stpe]=[];
			}
			g_all_weak_type_statis[stpe].push(hebword);
		}
	}
}
function Get_Weak_Type_Arr(hebword){
	var sroot=GetRoot(hebword);
	var stype=[];
	for(var i=0;i<sroot.length;i++){
		var al=sroot[i];
		if(WeakLetterArr.indexOf(al)>=0){
			var stpe=g_TermType[i]+"-"+al;
			stype.push(stpe);
		}
	}
	return stype;
}
function show_all_weak_type_statis(){
	var s="<table border='1'>";
	s+="<thead><tr><th>#</th><th>type</th><th>words</th></tr></thead>";
	var k=0;
	//g_all_weak_type_statis=g_all_weak_type_statis.sort();
	$.each(g_all_weak_type_statis,function(styp,arr){
		var hebr=arr.join("<br>");
		s+="<tr><td>"+(k++)+"</td><td>"+styp+"</td><td class='heb'>"+hebr+"</td></tr>";
	});
	s+="</table>";
	$("#show").append(s);
	gen_weak_options();	
}
var g_all_weak_types_sorted_arr=[];
function gen_weak_options(){
	if(g_all_weak_types_sorted_arr.length>0) return;
	var s="";
	g_all_weak_types_sorted_arr=Object.keys(g_all_weak_type_statis).sort();
	g_all_weak_types_sorted_arr.unshift("Strong");
	$.each(g_all_weak_types_sorted_arr,function(i,styp){
		s+="<option value='"+styp+"'>"+styp+"</option>";
	});	
	$("#tojs").append(s);
}
function Get_DatArr_By_WeakType(weakType){
	if(g_all_weak_types_sorted_arr[0]===weakType){
		return Get_DatArr_Strong();
	}
	var ret=[];
	$.each(hebrew_word_verb2,function(i,jsn){
		if(jsn["perfect"]){
			var heb3ms=jsn["perfect"]["s"][3];
			var weaksAr=Get_Weak_Type_Arr(heb3ms);	
			if(weaksAr.indexOf(weakType)>=0){
				ret.push(jsn);
			}	
		}
	});	
	return ret;
}
function Get_DatArr_Strong(){
	var ret=[];
	$.each(hebrew_word_verb2,function(i,jsn){
		if(jsn["perfect"]){
			var heb3ms=jsn["perfect"]["s"][3];
			var weaksAr=Get_Weak_Type_Arr(heb3ms);	
			if(weaksAr.length===0){
				ret.push(jsn);
			}	
		}
	});	
	return ret;
}
function show_hebrew_word_verb2_find_weak_root(){
	var s="<table border='1'>";
	g_all_weak_type_statis={};
	$.each(hebrew_word_verb2,function(i,jsn){
		if(jsn["perfect"]){
			var heb3ms=jsn["perfect"]["s"][3];
			Gen_weak_type_stats(heb3ms);
			s+="<tr><td>"+i+"</td>";
			s+="<td class='heb'>"+heb3ms+"</td>";
			s+="<td class='heb'>"+Get_Weak_Type_Arr(heb3ms).join("<br>")+"</td>";
			s+="<td class='heb'>"+GetRoot(heb3ms)+"</td>";
			s+="<td class='heb'>"+GetWeak(heb3ms)+"</td>";
			s+="<td class='heb'>"+GetCharCodesList(heb3ms)+"</td>";
			s+="</tr>";			
		}

	});
	s+="</table>";
	$("#show").html(s);	
	show_weak_leters();
	Show_AlphetLetters();
	show_all_weak_type_statis();
}



