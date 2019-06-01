
var g_voiceUrl = "https://www.blueletterbible.org/lang/Lexicon/Lexicon.cfm?strongs=H";


///////////////////////////////
var VocabHebrewSample = {
	"מֶ֫לֶךְ": [
		"king",
		"king.mp3",
		"4427",
		"362",
		"12",
		"n",
		"77777 sdfgsd",
		"chap01"
	]
};
const VOCAB_HEBREW_INFO_ARR =
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
function VocabGetItmByName(name, vhiArr) {
	var idx = VOCAB_HEBREW_INFO_ARR.indexOf(name);
	if (idx < 0) return alert("wrong name:" + name);
	return vhiArr[idx];
}
function GetAudPath(english_o_hebrew, arr) {
	var chp = VocabGetItmByName("chp", arr);
	var aud = VocabGetItmByName("aud", arr);

	var path = "audio/" + english_o_hebrew + "/" + chp + "/" + aud;
	return path;
}
///////////////////////////////


var ScoreSys = function (id) {
	this.eid = id;
	this.records = {
		spanArr: [],
		HebrewTestedOut: { "Err": {}, "Oky": {} },
		iMaxSpeed: 0,
		AddOut: function (outType, sHb, arr) {
			this.HebrewTestedOut[outType][sHb] = arr;
			this.Recordshow();
		},
		Recordshow: function () {
			var icount = this.spanArr.length;
			if (icount == 0) return;
			var timesp = 1 + this.spanArr[icount - 1];
			var rate = icount / (timesp);
			if (rate > this.iMaxSpeed) {
				this.iMaxSpeed = rate;
			}
			var s = "<a>speed: " + icount + " / " + timesp + "=" + rate.toFixed(2) + "(words/second),=" + (rate * 60).toFixed(2) + "words/min, iMaxSpeed=" + (60 * this.iMaxSpeed).toFixed(2) + "(w/m)</a><br>";

			s += this.genTable("Err");
			s += this.genTable("Oky");
			$("#show").html(s);
		},
		genTable: function (outType) {
			var s = "<table border='1'><caption>" + outType + "</caption>";
			s += "<thead><tr><td>#</td><td>Hebrew</td><td>Eng</td><td>aud</td><td>Scd</td><td>Usg</td><td>Dfy</td><td>typ</td><td>Mm</td><td>chp</td></tr>";
			s += "</thead><tbody>";

			var idx = 0;
			$.each(this.HebrewTestedOut[outType], function (k, ar) {
				s += "<tr><td>" + (idx++) + "</td>";
				s += "<td>" + k + "</td>";
				//s+="<td>"+ar[4]+"</td><td>"+ar[3]+"</td>";
				$.each(ar, function (i, v) {
					s += "<td>" + v + "</td>";
				})

				s += "</tr>";
			});
			s += "</tbody></table>";
			return s;
		}
	};//records
}
ScoreSys.prototype.init = function (first_argument) {
	// body...
	$(this.eid).text("0");
	this.spanSeconds = 0;
	this.spanSecondsArr = [];
	var _This = this;
	clearInterval(this.IntervalID);
	this.IntervalID = setInterval(function () {
		_This.IntervalSpan();
	}, 1000);
	//clearInterval()
};
ScoreSys.prototype.timeSpanFormate = function () {

	var second = (this.spanSeconds % 60).toString().padStart(2, "0");
	var minute = ((this.spanSeconds / 60) % 60).toFixed(0).padStart(2, "0");
	var hours = (this.spanSeconds / 3600).toFixed(0).padStart(2, "0");
	return hours + ":" + minute + ":" + second;
}
ScoreSys.prototype.IntervalSpan = function () {
	// body...
	this.data_start = new Date();
	this.spanSeconds += 1;
	$(this.eid).text(this.timeSpanFormate());
	return;
};
ScoreSys.prototype.Next = function () {
	// body...
	this.records.spanArr.push(this.spanSeconds);
};






function mergeJsonData(VocabChaps) {
	var mergeDat = {};
	$.each(VocabChaps, function (chp, obj) {
		Object.keys(obj).forEach(function (key) {
			obj[key].push(chp);
			if (mergeDat[key]) {
				console.log("ignore duplicated:" + key);
				console.log(obj[key]);
				console.log(mergeDat[key]);
			}
		});
		Object.assign(mergeDat, obj);
	});
	console.log("mergeDat");
	console.log(mergeDat);
	$("#sout").val("var VocabHebrewBuf=\n" + JSON.stringify(mergeDat, null, 4));
	return mergeDat;
}

var HebrewQuiz = function (par) {
	this.par = par;//{id:'#',Dfy:0,Size:0,VocabChaps:obj}
	this.load_dat(par.VocabChaps);
	this.par.score.init();
}
HebrewQuiz.prototype.load_dat = function (VocabChaps) {
	this.g_mergedHebrewInfo = mergeJsonData(VocabChaps);
}
HebrewQuiz.prototype.random_GetKey = function () {
	var randi = Math.random();
	var hebkeyArr = Object.keys(this.g_mergedHebrewInfo);
	var fidx = randi * hebkeyArr.length;
	var rindx = Math.floor(fidx);
	return hebkeyArr[rindx];
}
HebrewQuiz.prototype.random_GetKeyArr = function (iSize, qzLevel) {
	var randKeyArr = [];
	while (randKeyArr.length < iSize) {
		var key = this.random_GetKey();
		if (randKeyArr.indexOf(key) >= 0) continue;
		var dfy = (this.g_mergedHebrewInfo[key][4]);
		if (!dfy) continue;
		if (parseInt(dfy) <= qzLevel) continue;
		randKeyArr.push(key);
	}
	return randKeyArr;
}
HebrewQuiz.prototype.genQuizTable = function () {
	var iSize = this.par.qzSize, qzLevel = this.par.qzDfy;
	var randKeyArr = this.random_GetKeyArr(iSize, qzLevel);
	var i = ((10000 * Math.random()) % (iSize - 1)).toFixed(0);
	console.log("random i=", i);
	var key = randKeyArr[i];
	var arr = this.g_mergedHebrewInfo[key];
	var eng = VocabGetItmByName("eng", arr);
	var src = GetAudPath("hebrew", arr);

	var shb = "<div id='HebrewWord' class='SelectOptions heb hebT' sheb='" + this.g_mergedHebrewInfo[key][0] + "' aud='" + src + "'>" + key + "</div>";

	var s = "<table border='1'><caption><a>Hebrew Quiz</a><br>" + "</caption";
	s += "<thead><tr><th>#</th><th>" + shb + "</th><th title='Difficulty'>dfy</th><th>Usg</th></thead>";
	s += "<tbody>";
	for (var i = 0; i < iSize; i++) {
		var key = randKeyArr[i];//Hebrewword
		var arr = this.g_mergedHebrewInfo[key];
		var eng = VocabGetItmByName("eng", arr);//
		var src = GetAudPath("english", arr);
		s += "<tr><td>" + i + "</td>";
		s += "<th><a class='eng' aud='" + src + "'>";
		s += eng;
		s += "</a><button class='eng2'/></th>";
		s += "<td title='Dfy'>";
		s += VocabGetItmByName("dfy", arr);//
		s += "</td><td title='Usg'>" + VocabGetItmByName("frq", arr);//+"</td></tr>";
	};
	s += "<tbody></table>";
	return s;
}
HebrewQuiz.prototype.MakeQuize = function () {
	var s = this.genQuizTable(this.par);
	//this.par.score.records.addCount(this.second);
	this.par.score.Next();
	this.par.score.records.Recordshow();
	////////
	var HebrewWordEle = $(this.par.id).html(s).find(".SelectOptions");

	var src = $(HebrewWordEle).attr("aud");
	setTimeout(function () {
		audioplay(src)
	}, 1000);

	$(HebrewWordEle).bind("click", function () {
		src = $(this).attr("aud");
		audioplay(src);
	});
	var _This = this;
	$(this.par.id).find(".eng").bind("click", function () {
		var targetEng = $("#HebrewWord").attr("sheb");
		var selectEng = $(this).text();
		var HebrewWord = $("#HebrewWord").text();
		if (targetEng == selectEng) {//correct!
			$(this).addClass("txtcolr_white");
			$("#HebrewWord").addClass("txtcolr_white");
			var src = $(this).attr("aud");
			audioplay(src);
			setTimeout(function () {
				_This.MakeQuize();
			}, 1000);

			_This.par.score.records.AddOut("Oky", HebrewWord, _This.g_mergedHebrewInfo[HebrewWord]);

		} else {//wrong!
			var src = $(this).attr("aud");
			//audioplay(src);
			alert("wrong! \n-Please try again.");

			_This.g_mergedHebrewInfo[HebrewWord][4]++;
			_This.par.score.records.AddOut("Err", HebrewWord, _This.g_mergedHebrewInfo[HebrewWord]);
		};
	});
	$(this.par.id).find(".eng2").bind("click", function () {
		var targetEng = $("#HebrewWord").attr("sheb");
		var HebrewWord = $("#HebrewWord").text();
		var selectEng = $(this).prev().text();
		var src = $(this).prev().attr("aud");
		if (targetEng == selectEng) {//correct!
			$(this).prev().addClass("txtcolr_white");
			$("#HebrewWord").addClass("txtcolr_white");
			//audioplay(src);
			//setTimeout(function(){
			_This.MakeQuize();
			_This.par.score.records.AddOut("Oky", HebrewWord, _This.g_mergedHebrewInfo[HebrewWord]);
			//},0);

		} else {//wrong!
			//audioplay(src);
			alert("wrong! \n-Please try again.");
			_This.g_mergedHebrewInfo[HebrewWord][4]++;
			_This.par.score.records.AddOut("Err", HebrewWord, _This.g_mergedHebrewInfo[HebrewWord]);
		};
	});
};
//
//////////////












/////////////////////////
// vocab table

function VocabBodyTrs(vobj) {
	console.log(vobj);
	var s = "";
	$.each(vobj, function (hbr, arr) {
		var i = 0;
		var chp = VocabGetItmByName("chp", arr);
		var eng = VocabGetItmByName("eng", arr);
		var sch = VocabGetItmByName("sch", arr);
		var frq = VocabGetItmByName("frq", arr);
		var dfy = VocabGetItmByName("dfy", arr);
		var typ = VocabGetItmByName("typ", arr);
		var mem = VocabGetItmByName("mem", arr);
		var aud = VocabGetItmByName("aud", arr);

		var audH = GetAudPath("hebrew", arr);
		var audE = GetAudPath("english/", arr);
		//console.log(eng, audE);


		s += "<tr><td/>";
		s += "<td class='heb' aud='" + audH + "' fnm='" + aud + "'>" + hbr + "</td>";
		s += "<td class='eng' aud='" + audE + "' fnm='" + aud + "'>" + eng + "</td>";
		s += "<td class='SCH' old='" + sch + "'><a href='" + g_voiceUrl + sch + "'>" + sch + "</a></td>";
		s += "<td class='frq' old='" + frq + "'><a>" + frq + "</a></td>";
		s += "<td class='err' old='" + dfy + "' contenteditable>" + dfy + "</td>";
		s += "<td class='cat' old='" + typ + "' contenteditable>" + typ + "</td>";
		s += "<td class='pos' old='" + mem + "' contenteditable>" + mem + "</td>";
		s += "<td>" + chp + "</td>";

		s += "</tr>"
	});
	return s;
};
function VocabHeader() {
	var s = "";
	s += "<thead>";
	s += "<tr><th title='index'>#</th>";
	s += "<th>Heb<button id='togHebrew'>toggleHide</button></th>";
	s += "<th>eng<button id='togEnglis'>toggleHide</button></th>";
	s += "<th title='Strong Code Hebrew'>sch</td><th title='Frq in OT'>frq</td><th title='Difficulty Level higher with bigger in number.'>dfy</td><th title='Word Type'>typ</th>";
	s += "<th title='Memory Assistance'>mem</th>";
	s += "<th title='chapter.index'>chp</th>"
	s += "</tr>";
	s += "</thead>";
	return s;
}

function gen_table_ahard() {

	//var btrs=VocabBodyTrs(VocabHebrewBuf);
	gen_table(VocabHebrewBuf);
	table_bind();

	showTableDiff2(VocabHebrewDat, "diff2Eff");//diff2Eff (VocabHebrewBuf);
}

function gen_table(vobj) {
	var s = "<table class='tablesorter' border='1'><caption>Hebrew-Vocabulary</caption>";
	s += VocabHeader();
	s += "<tbody id='vtbdy'>";
	s += VocabBodyTrs(vobj);
	s += "</tbody>";
	s += "</table>";
	$("#show").html(s);
}
function table_bind() {
	$("#show").find("td").bind("click", function () {
		$(this).toggleClass("chkclr");
		var src = $(this).attr("aud");
		if (!!src) {
			audioplay(src);
			output2texta();
		};
	});
	$("#show").find("#togEnglis").bind("click", function () {
		$(".eng")//.slideToggle();
			.toggleClass("txtcolr_white");
		alert();
	});
	$("#show").find("td").bind("keyup", function () {
		var ret = getTdElmArrFrTr($(this).parentsUntil("tbody"));
		console.log(ret);
		restapi_upHebewVocab("jsonpster", ret.vobj);
	});
	$("th #togHebrew").bind("click", function () {
		$(".heb")//.slideToggle();
			.toggleClass("txtcolr_white");
		alert();
	});
}
function audioplay(src) {
	var s2 = "<audio autoplay><source src='" + src + "' type='audio/mpeg' /></audio>";
	$("#audio").html(s2);
	console.log(src);
}
function output2texta() {
	var s = "{\n";
	$(".heb.chkclr").each(function () {
		s += "\"" + $(this).text() + "\"\:\[\"";
		s += $(this).next().text();
		s += "\",\"";
		s += $(this).attr("aud");
		s += "\"\, \"\"\]\,\n";
	});
	s += "\},\n";
	$("#texta").val(s);
};
function getTdElmArrFrTr(trElm) {
	var heb = $(trElm).find("td:eq(1)");
	var eng = $(trElm).find("td:eq(2)");
	var sch = $(trElm).find("td:eq(3)");
	var frq = $(trElm).find("td:eq(4)");
	var dfy = $(trElm).find("td:eq(5)");
	var typ = $(trElm).find("td:eq(6)");
	var mem = $(trElm).find("td:eq(7)");
	var chp = $(trElm).find("td:eq(8)");
	var elemArr = [eng, heb, sch, frq, dfy, typ, mem, chp];

	var sheb = $(heb).text();
	var info = [$(eng).text(), $(heb).attr("fnm"), $(sch).text(), $(frq).text(), $(dfy).text(), $(typ).text(), $(mem).text(), $(chp).text()];
	var vobj = {};
	vobj[sheb] = info;
	//console.log(vobj);
	return { elemArr: elemArr, vobj: vobj };
}
function GetObjFrTable() {
	var cobj = {};
	$("#vtbdy").find("tr").each(function () {
		var ret = getTdElmArrFrTr(this);
		var heb = ret.elemArr[1];

		var key = $(heb).text();
		var src = $(heb).attr("aud");
		var ilast = 1 + src.lastIndexOf("/");
		var aud = src.substr(ilast);

		cobj[key] = [];
		$.each(ret.elemArr, function (i, elm) {
			var str = $(elm).text();
			cobj[key].push(str);
		});
		cobj[key][1] = aud;
	});
	console.log(cobj);
	return cobj;
}
function showTableDiff2(cobj, cssDiffCls) {
	$("#vtbdy").find("tr").each(function () {
		var ret = getTdElmArrFrTr(this);
		var heb = ret.elemArr[1];
		var key = $(heb).text();

		$.each(ret.elemArr, function (i, elm) {
			var str = $(elm).text();
			if (1 == i) str = $(elm).attr("fnm");
			var arr = cobj[key];
			var str2 = cobj[key][i];
			if (str2 != str) {
				$(elm).addClass(cssDiffCls);//"diff2Eff");
			} else {
				//console.info(cobj[key]);
			}
		});
	});
}
function outputAll2texta(vobj) {
	var diffObj = {};
	var guiObj = GetObjFrTable();
	$.each(VocabHebrewBuf, function (key, arr) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] != guiObj[key][i]) {
				diffObj[key] = guiObj[key];
				break;
			};
		};
	});
	showTableDiff2(VocabHebrewBuf, "modified");//diff2Eff
	var s = JSON.stringify(diffObj, null, 4);
	$("#texta").val(s);
	//jqsave2afile("../out/tmp/test.json",s);
	return;
};
function export_arr_no_marker() {
	var jsn = JSON.stringify(VocabHebrewBuf);
	var bufObj = JSON.parse(jsn);//clone Obj
	var guiObj = GetObjFrTable();
	$.each(bufObj, function (key, arr) {
		bufObj[key] = guiObj[key];//keep bufObj struct. 
	});

	showTableDiff2(VocabHebrewBuf, "modified");

	var s = "//gen fr table\n";
	s += "var VocabHebrewBuf=\n";
	s += JSON.stringify(bufObj, null, 4);
	$("#texta").val(s);
}






///////////////////////////
//////
var setTimeoutId = null;
var trindx = 0;
var he01 = 1;
function autoplay_start(clsArr) {
	var trTota = $("tr").length;

	//var clsArr=[".eng",".heb",];
	console.log("total tr=" + trTota)
	function next_audio() {
		if (1 === he01) {
			he01 = 0; trindx += 1;
		}
		else {
			he01 = 1;
		}
		if (trindx >= trTota) {
			trindx = 0;
		}
		var clsname = clsArr[he01];

		$("tr:eq('" + trindx + "')").find(clsname).each(function () {
			var src = $(this).attr("aud");
			audioplay(src);
			console.log(src);
			$(this).toggleClass("chkclr");
			var IsVisible = $(this).is(":visible");
			//if(!IsVisible){
			$(this)[0].scrollIntoView(false);
			//}
		});

		var milliseconds = 3000;
		setTimeoutId = setTimeout(next_audio, milliseconds);
	}
	next_audio();
	//var milliseconds=3000;
	//setTimeoutId = setTimeout(next_audio, milliseconds);
	//clearTimeout(myVar);
}
function toggle_auto_play_audio() {
	if (!setTimeoutId) {
		autoplay_start([".heb", ".eng"]);
	}
	else {
		clearTimeout(setTimeoutId);
		setTimeoutId = null;
	}

}
////
//////////////////////////




function remove_markers(sHebrewWord) {
	var sword = '';
	for (var k = 0; k < sHebrewWord.length; k++) {
		var code = sHebrewWord.charCodeAt(k);
		if (code >= 1488 && code <= 1514) {
			var ch = sHebrewWord.charAt(k);
			sword += ch;
		}
	}
	return sword;
}




function enable_table_sorter() {
	$("table").tablesorter({
		//  theme: 'blue',
		usNumberFormat: false,
		sortReset: true,
		sortRestart: true,

		widgets: ['columns', 'output',],//'zebra', 'editable'

	});
}


function restapi_upHebewVocab(fname, vobj) {
	var txt = JSON.stringify(vobj);
	txt = encodeURIComponent(txt);//must see svr decodeURIComponent();
	var inp = { fname: fname, dat: vobj };
	var prm = { api: "updateVocabHebrewBuf", inp: inp };
	//window.open(url);
	console.log(Jsonpster);
	//Jsonpster.Set ({api:"updateVocabHebrewBuf", param:inp}); // = JSON.stringify(inp);
	Jsonpster.Run(prm, function (ret) {
		jsonpsvr_ok();
	});
};

function jsonpsvr_ok() {
	//https://www.w3schools.com/js/js_json_jsonp.asp
	var s = $("#texta").val();
	if (s.length > 10) s = "";
	$("#texta").val(s + ".");
}




