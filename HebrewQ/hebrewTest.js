
var g_voiceUrl="https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H";


///////////////////////////////
var VocabHebrewSample={"מֶ֫לֶךְ": [
	"king",
	"king.mp3",
	"4427",
	"362",
	"12",
	"n",
	"77777 sdfgsd",
	"chap01"
]};
const VOCAB_HEBREW_INFO_ARR=
[
	"eng",
	"aud",
	"sch",
	"frq",
	"dfy",
	"typ",
	"mem",
	"chp"
];
function VocabGetItmByName(name,vhiArr){
	var idx=VOCAB_HEBREW_INFO_ARR.indexOf(name);
	if(idx<0) return alert("wrong name:"+name);
	return vhiArr[idx];
}
///////////////////////////////


var ScoreSys=function(id){
	this.eid=id;
	this.records={
		spanArr:[],
		HebrewTestedOut:{"Err":{},"Oky":{}},
		iMaxSpeed:0,
		AddOut:function(outType, sHb,arr){
			this.HebrewTestedOut[outType][sHb]=arr;
			this.Recordshow();
		},
		Recordshow:function (){
			var icount=this.spanArr.length;
			if(icount==0)return;
			var timesp = 1+this.spanArr[icount-1];
			var rate=icount/(timesp);
			if(rate>this.iMaxSpeed) {
				this.iMaxSpeed=rate;
			}
			var s="<a>speed: "+icount+" / "+timesp+"="+rate.toFixed(2)+"(words/second),="+(rate*60).toFixed(2)+"words/min, iMaxSpeed="+(60*this.iMaxSpeed).toFixed(2)+"(w/m)</a><br>";

			s+=this.genTable("Err");
			s+=this.genTable("Oky");
			$("#show").html(s);
		},
		genTable:function(outType){
				var s="<table border='1'><caption>"+outType+"</caption>";
				s+="<thead><tr><td>#</td><td>Hebrew</td><td>Eng</td><td>aud</td><td>Scd</td><td>Usg</td><td>Dfy</td><td>typ</td><td>Mm</td><td>chp</td></tr>";
				s+="</thead><tbody>";

				var idx=0;
				$.each(this.HebrewTestedOut[outType],function(k,ar){
					s+="<tr><td>"+(idx++)+"</td>";
					s+="<td>"+k+"</td>";
					//s+="<td>"+ar[4]+"</td><td>"+ar[3]+"</td>";
					$.each(ar,function(i,v){
						s+="<td>"+v+"</td>";
					})

					s+="</tr>";
				});
				s+="</tbody></table>";
				return s;
			}
	};//records
}
ScoreSys.prototype.init = function(first_argument) {
	// body...
	$(this.eid).text("0");
	this.spanSeconds=0;
	this.spanSecondsArr=[];
	var _This=this;
	clearInterval(this.IntervalID);
	this.IntervalID=setInterval(function(){
	   _This.IntervalSpan();
	}, 1000);
	//clearInterval()
};
ScoreSys.prototype.timeSpanFormate=function(){

	var second=(this.spanSeconds%60).toString().padStart(2,"0");
	var minute=((this.spanSeconds/60)%60).toFixed(0).padStart(2,"0");
	var hours=(this.spanSeconds/3600).toFixed(0).padStart(2,"0");
	return 	hours+":"+minute+":"+second;
}
ScoreSys.prototype.IntervalSpan = function() {
	// body...
	this.data_start=new Date();
	this.spanSeconds+=1;
	$(this.eid).text(this.timeSpanFormate());
	return;
};
ScoreSys.prototype.Next = function() {
	// body...
	this.records.spanArr.push(this.spanSeconds);
};





function getAudSrc(hebrew_o_english,HebrwInfoAry){
	//var arr=VocabChapsBuf[chap][hebr];
	var chap=HebrwInfoAry[7];
	var spath="audio/"+hebrew_o_english+"/" +chap+"/"+get_AudioStreamFileName(HebrwInfoAry);
	return spath;
}
function mergeJsonData(VocabChaps){
	var mergeDat={};
	$.each(VocabChaps,function(chp,obj){
		Object.keys(obj).forEach(function(key){
			obj[key].push(chp);
			if(mergeDat[key]){
				console.log("ignore duplicated:"+key);
				console.log(obj[key]);
				console.log(mergeDat[key]);
			}
		});
		Object.assign(mergeDat, obj);
	});
	console.log("mergeDat");
	console.log(mergeDat);
	$("#sout").val("var VocabHebrewBuf=\n"+JSON.stringify(mergeDat,null,4));
	return mergeDat;
}

var HebrewQuiz=function(par){
	this.par=par;//{id:'#',Dfy:0,Size:0,VocabChaps:obj}
	this.load_dat(par.VocabChaps);
	this.par.score.init();
}
HebrewQuiz.prototype.load_dat=function(VocabChaps){
	this.g_mergedHebrewInfo=mergeJsonData(VocabChaps);
}
HebrewQuiz.prototype.random_GetKey=function (){
	var randi=Math.random();
	var hebkeyArr=Object.keys(this.g_mergedHebrewInfo);
	var fidx=randi*hebkeyArr.length;
	var rindx=Math.floor( fidx );
	return hebkeyArr[rindx];
}
HebrewQuiz.prototype.random_GetKeyArr=function (iSize, qzLevel){
	var randKeyArr=[];
	while(randKeyArr.length<iSize){
		var key=this.random_GetKey();
		if(randKeyArr.indexOf(key)>=0) continue;
		var dfy=(this.g_mergedHebrewInfo[key][4]);
		if(!dfy)continue;
		if(parseInt(dfy)<=qzLevel) continue;
		randKeyArr.push(key);
	}
	return randKeyArr;
}
HebrewQuiz.prototype.genQuizTable=function(){
	var iSize=this.par.qzSize, qzLevel=this.par.qzDfy;
	var randKeyArr=this.random_GetKeyArr(iSize,qzLevel);
	var i=((10000*Math.random())%(iSize-1)).toFixed(0);
	console.log("random i=",i);
	var key=randKeyArr[i];
	var eng=this.g_mergedHebrewInfo[key][0];
	var src=getAudSrc("hebrew",this.g_mergedHebrewInfo[key]);

	var shb="<div id='HebrewWord' class='SelectOptions heb hebT' sheb='"+this.g_mergedHebrewInfo[key][0]+"' aud='"+ src + "'>"+key+"</div>";

	var s="<table border='1'><caption><a>Hebrew Quiz</a><br>"+"</caption";
	s+="<thead><tr><th>#</th><th>"+shb+"</th><th title='Difficulty'>dfy</th><th>Usg</th></thead>";
	s+="<tbody>";
	for(var i=0;i<iSize;i++){
		var key=randKeyArr[i];//Hebrewword
		var eng=this.g_mergedHebrewInfo[key][0];//
		var src=getAudSrc("english",this.g_mergedHebrewInfo[key]);
		s+="<tr><td>"+i+"</td>";
		s+="<th><a class='eng' aud='"+src+"'>";
		s+=eng;
		s+="</a><button class='eng2'/></th>";
		s+="<td title='Dfy'>";
		s+=this.g_mergedHebrewInfo[key][4];
		s+="</td><td title='Usg'>"+this.g_mergedHebrewInfo[key][3]+"</td></tr>";
	};
	s+="<tbody></table>";
	return s;
}
HebrewQuiz.prototype.MakeQuize=function(){
	var s=this.genQuizTable(this.par);
	//this.par.score.records.addCount(this.second);
	this.par.score.Next();
	this.par.score.records.Recordshow();
	////////
	var HebrewWordEle=$(this.par.id).html(s).find(".SelectOptions");

	var src=$(HebrewWordEle).attr("aud");
	setTimeout(function(){
		audioplay(src)},1000);

	$(HebrewWordEle).bind("click",function(){
		src=$(this).attr("aud");
		audioplay(src);
	});
	var _This=this;
	$(this.par.id).find(".eng").bind("click",function(){
		var targetEng=$("#HebrewWord").attr("sheb");
		var selectEng=$(this).text();
		var HebrewWord=	$("#HebrewWord").text();
		if(targetEng==selectEng){//correct!
			$(this).addClass("txtcolr_white");
			$("#HebrewWord").addClass("txtcolr_white");
			var src=$(this).attr("aud");
			audioplay(src);
			setTimeout(function(){
				_This.MakeQuize();
			},1000);

			_This.par.score.records.AddOut("Oky",HebrewWord, _This.g_mergedHebrewInfo[HebrewWord]);

		}else{//wrong!
			var src=$(this).attr("aud");
			//audioplay(src);
			alert("wrong! \n-Please try again.");

			_This.g_mergedHebrewInfo[HebrewWord][4]++;
			_This.par.score.records.AddOut("Err",HebrewWord, _This.g_mergedHebrewInfo[HebrewWord]);
		};
	});
	$(this.par.id).find(".eng2").bind("click",function(){
		var targetEng=$("#HebrewWord").attr("sheb");
		var HebrewWord=	$("#HebrewWord").text();
		var selectEng=$(this).prev().text();
		var src=$(this).prev().attr("aud");
		if(targetEng==selectEng){//correct!
			$(this).prev().addClass("txtcolr_white");
			$("#HebrewWord").addClass("txtcolr_white");
			//audioplay(src);
			//setTimeout(function(){
			_This.MakeQuize();
			_This.par.score.records.AddOut("Oky",HebrewWord, _This.g_mergedHebrewInfo[HebrewWord]);
			//},0);

		}else{//wrong!
			//audioplay(src);
			alert("wrong! \n-Please try again.");
			_This.g_mergedHebrewInfo[HebrewWord][4]++;
			_This.par.score.records.AddOut("Err",HebrewWord, _This.g_mergedHebrewInfo[HebrewWord]);
		};
	});
};
//
//////////////












/////////////////////////
// vocab table
function getAudPath(hebrew_o_english,chap,HebrwInfoAry){
	//var arr=VocabChapsBuf[chap][hebr];
	var spath="audio/"+hebrew_o_english+"/" +chap+"/"+get_AudioStreamFileName(HebrwInfoAry);
	return spath;
}
function Vocab2TRs(){
	function _get_tr(chap,heb,ar,i){
		var s="";
		var chp=chap.substr(4);
		var audiofilenameHebrew =getAudPath("hebrew",chap, ar);
		var audiofilenameEnglish=getAudPath("english",chap, ar);//"audio/english/"+chap+"/"+get_AudioStreamFileName(ar);
		s+="<tr><td></td>";
		s+="<td>"+chp+"."+(i)+"</td>";
		s+="<td class='heb' aud='"+audiofilenameHebrew+"'>"+heb+"</td>";
		s+="<td class='eng' aud='"+audiofilenameEnglish+"'>"+ar[0]+"</td>";
		s+="<td class='SCH' old='"+ar[2]+"'><a href='"+g_voiceUrl+ar[2]+"'>"+ar[2]+"</a></td>";
		s+="<td class='frq' old='"+ar[3]+"'><a>"+ar[3]+"</a></td>";
		s+="<td class='err' old='"+ar[4]+"' contenteditable><a>"+ar[4]+"</a></td>";
		var cat=ar[5]; if(!cat) cat="";
		s+="<td class='cat' old='"+cat+"' contenteditable><a>"+cat+"</a></td>";
		var cat=ar[6]; if(!cat) cat="";
		s+="<td class='pos' old='"+cat+"' contenteditable><a>"+cat+"</a></td>";
		//s+="<td contenteditable title></td>";
		s+="</tr>";
		return s;
	};

	var s="";
	$.each(VocabChapsBuf,function(chap,obj){
		var i=0;
		$.each(obj,function(heb,arr){
			s+=_get_tr(chap,heb,arr, i++);
		});
	});
	return s;
};


function gen_table_ahard(){

	var trs=Vocab2TRs();
	trs_2_table(trs);
	table_bind();

	outputAll2texta();
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
            //console.log("t1",engstr);
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
			audiofilename=auto_convert_audio_fr_eng(ar[0]);
		}
		if(audiofilename && audiofilename.indexOf("/")>=0){
			return audiofilename;
		}
		return audiofilename;
};
function trs_2_table(trs){
	var s="<table class='tablesorter' border='1'><caption>Vocabs</caption>";
	s+="<thead>";
	s+="<tr><th title='index'>#</th><th title='chapter.index'>chp</th>";
	s+="<th>Heb<button id='togHebrew'>toggleHide</button></th>";
	s+="<th>Eng<button id='togEnglis'>toggleHide</button></th>";
	s+="<th title='Strong Code Hebrew'>SCH</td><th title='Frq in OT'>Frq</td><th title='Difficulty Level higher with bigger in number.'>Dfy</td><th title='Word Type'>WT</th>";
	s+="<th title='Memory Assistance'>Mem</th>";
	s+="</tr>";
	s+="</thead>";
	s+="<tbody>";
	s+=trs;
	s+="</tbody>";
	s+="</table>";
	$("#show").html(s);
}
function table_bind(){
	$("#show").find("td").bind("click",function(){
		$(this).toggleClass("chkclr");
		var src=$(this).attr("aud");
		if(!!src){
			audioplay(src);
			output2texta();
		};
	});
	$("#show").find("#togEnglis").bind("click",function(){
		$(".eng")//.slideToggle();
    	.toggleClass("txtcolr_white");
    	alert();
	});
	$("th #togHebrew").bind("click",function(){
		$(".heb")//.slideToggle();
    	.toggleClass("txtcolr_white");
    	alert();
	});
}
function audioplay(src){
	var s2="<audio autoplay><source src='"+src+"' type='audio/mpeg' /></audio>";
	$("#audio").html(s2);
	console.log(src);
}
function output2texta(){
	var s="{\n";
	$(".heb.chkclr").each(function(){
		s+="\""+$(this).text()+"\"\:\[\"";
		s+=$(this).next().text();
		s+="\",\"";
		s+=$(this).attr("aud");
		s+="\"\, \"\"\]\,\n";
	});
	s+="\},\n";
	$("#texta").val(s);
};
function outputAll2texta(vname){
	if(!vname)vname="VocabChapsDat";
	var opt={"VocabChapsDat":VocabChapsDat, "VocabChapsBuf":VocabChapsBuf}

	var myObj=VocabChapsBuf;
	function __update_VocabChaps(chap,sheb,ChangedArr){
				var arr=myObj[chap][sheb];
				if(arr){
					for(var i=2;i<arr.length;i++){
						arr[i]=ChangedArr[i];
					}
				};//
	};

	function __showDiff(){
		const TilteName={2:"SID",3:"frq", 4:"Dfy",5:"WD",6:"Mem"}
		$("tr").each(function(){
			var chap="chap"+$(this).find("td:eq(1)").text().split(".")[0];
			var sheb=$(this).find("td:eq(2)").text();//.trim();
			var ChangedArr=new Array(7), bChanged=false;
			for(var i=2;i<7;i++){
				var iCol="td:eq("+(2+i)+")";

				//show diff between table and original loaded data (old).
				var valTbl=$(this).find(iCol).text().trim();
				var valOld=$(this).find(iCol).attr("old");
				ChangedArr[i]=(valTbl);
				if( valOld==valTbl){
					$(this).find(iCol).removeClass("modified");
					$(this).find(iCol).find("*").removeClass("modified");
				}else{
					$(this).find(iCol).addClass("modified");
					$(this).find(iCol).find("*").addClass("modified");
					bChanged=true;
				}

				// show diff btw Buf and Dat.
				if( VocabChapsDat[chap]&&VocabChapsDat[chap][sheb]){
					var valDat=""+VocabChapsDat[chap][sheb][i];
					var valBuf=""+        myObj[chap][sheb][i];
					var stitle=TilteName[i]+": Dat="+valDat+" ,Buf="+valBuf;
					$(this).find(iCol).attr("title",stitle);

					if(valBuf==valDat.trim()){
						$(this).find(iCol).removeClass("diff2Eff");
						//console.log(chap,sheb);
					}else{
						$(this).find(iCol).addClass("diff2Eff");
					}
				}
			};//for
			if(bChanged && myObj[chap]){
				__update_VocabChaps(chap,sheb,ChangedArr);
			};//if

		});
		return;
	};
	//__updateTable();
	__showDiff();
	var s="var "+vname+"=\n"+JSON.stringify(myObj,null,2);
	$("#texta").val(s);
	//jqsave2afile("../out/tmp/test.json",s);
	return;
};

function swap_arr_6and7(){
	$.each(VocabChapsBuf,function(key,obj){
		$.each(obj,function(k,arr){
			var tmp=arr[5];
			arr[5]=arr[6];
			arr[6]=tmp;
		});
	});
	var s="var VocabChapsBuf=\n"+JSON.stringify(VocabChapsBuf,null,2);
	$("#texta").val(s);
}






///////////////////////////
//////
var setTimeoutId=null;
	var trindx=0;
	var he01=1;
function autoplay_start(clsArr){
	var trTota=$("tr").length;

	//var clsArr=[".eng",".heb",];
	console.log("total tr="+trTota)
	function next_audio(){
		if(1===he01){
			he01=0;trindx+=1;
		}
		else{
			he01=1;
		}
		if( trindx>=trTota){
			trindx=0;
		}
		var clsname=clsArr[he01];

		$("tr:eq('"+trindx+"')").find(clsname).each(function(){
			var src=$(this).attr("aud");
			audioplay(src);
			console.log(src);
			$(this).toggleClass("chkclr");
			var IsVisible=$(this).is(":visible");
			//if(!IsVisible){
				$(this)[0].scrollIntoView(false);
			//}
		});

		var milliseconds=3000;
		setTimeoutId = setTimeout(next_audio, milliseconds);
	}
	next_audio();
	//var milliseconds=3000;
	//setTimeoutId = setTimeout(next_audio, milliseconds);
	//clearTimeout(myVar);
}
function toggle_auto_play_audio(){
	if(!setTimeoutId){
		autoplay_start([".heb",".eng"]);
	}
	else{
		clearTimeout(setTimeoutId);
		setTimeoutId=null;
	}

}
////
//////////////////////////


function exportVocabHebrewBuf(){
	var mergedObj=mergeJsonData(VocabChapsBuf);
	$(".heb").each(function(){
		var shb=$(this).text();
		var src=$(this).attr("aud");
		var ilast=src.lastIndexOf("/")+1;
		var aud=src.substring(ilast);
		mergedObj[shb][1]=aud;
	});
	var s="var VocabHebrewBuf=\n";
	s+=JSON.stringify(mergedObj,null,4);
	$("#texta").val(s);
}
function export_arr_no_marker(VocabChap){
	return exportVocabHebrewBuf();
	var arr=[];
	$.each(VocabChap,function(clsnam,claObj){
		var lst=Object.keys(claObj);
		$.each(lst,function(i,str){
			var ar=str.split(/[\,|\s]/g);
			$.each(ar,function(j,shbrw){
				var cleanHbrw=remove_markers(shbrw);
				if(cleanHbrw.length>1 && arr.indexOf(cleanHbrw)<0 ){
					arr.push(cleanHbrw);
				}
			});
		});
	});
	var s="//gen fr hebrewTextbook.htm\n";
	s+="var Hebrew_word_ciu=\n";
	s+=JSON.stringify(arr,null,2);
	$("#texta").val(s);
}
function remove_markers(sHebrewWord){
        var sword='';
        for(var k=0;k<sHebrewWord.length;k++){
            var code=sHebrewWord.charCodeAt(k);
            if(code>=1488 && code<=1514){
                var ch=sHebrewWord.charAt(k);
                sword+=ch;
            }
        }
        return sword;
}




function enable_table_sorter(){
	$("table").tablesorter({
    //  theme: 'blue',
        usNumberFormat : false,
        sortReset      : true,
        sortRestart    : true,

        widgets: ['columns','output', ],//'zebra', 'editable'

    });
}

function restapi_save2afile(fname,txt){
	var url = "localhost:7778/save2afile";
	url+="?fname="+fname;
	url+="&dat="+encodeURIComponent(txt);
	window.open(url);
};
function restapi_upHebewVocab(fname,txt){
	var url = "localhost:7778/upHebewVocab/";
	url+="?fname="+fname;
	url+="&dat="+encodeURIComponent(txt);
	window.open(url);
};