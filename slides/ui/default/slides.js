// S5 v1.2a1 slides.js -- released into the Public Domain
//
// Please see http://www.meyerweb.com/eric/tools/s5/credits.html for information 
// about all the wonderful and talented contributors to this code!

var undef;
var slideCSS = '';
var snum = 0;
var smax = 1;
var incpos = 0;
var number = undef;
var s5mode = true;
var defaultView = 'slideshow';
var controlVis = 'visible';

var s5NotesWindow;
var previousSlide = 0;
var presentationStart = new Date();
var presentationPeriod;

var isIE = navigator.appName == 'Microsoft Internet Explorer' && navigator.userAgent.indexOf('Opera') < 1 ? 1 : 0;
var isOp = navigator.userAgent.indexOf('Opera') > -1 ? 1 : 0;
var isGe = navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('Safari') < 1 ? 1 : 0;

function hasClass(object, className) {
	if (!object.className) return false;
	return (object.className.search('(^|\\s)' + className + '(\\s|$)') != -1);
}

function hasValue(object, value) {
	if (!object) return false;
	return (object.search('(^|\\s)' + value + '(\\s|$)') != -1);
}

function removeClass(object,className) {
	if (!object || !hasClass(object,className)) return;
	object.className = object.className.replace(new RegExp('(^|\\s)'+className+'(\\s|$)'), RegExp.$1+RegExp.$2);
}

function addClass(object,className) {
	if (!object || hasClass(object, className)) return;
	if (object.className) {
		object.className += ' '+className;
	} else {
		object.className = className;
	}
}

function GetElementsWithClassName(elementName,className) {
	var allElements = document.getElementsByTagName(elementName);
	var elemColl = new Array();
	for (var i = 0; i< allElements.length; i++) {
		if (hasClass(allElements[i], className)) {
			elemColl[elemColl.length] = allElements[i];
		}
	}
	return elemColl;
}

function isParentOrSelf(element, id) {
	if (element == null || element.nodeName=='BODY') return false;
	else if (element.id == id) return true;
	else return isParentOrSelf(element.parentNode, id);
}

function isParentLink(element){
	if (element == null || element.nodeName=='BODY') {
        return false;
    } else if (element.nodeName.toLowerCase() == 'a'){
        return true;
    }
    return isParentLink(element.parentNode);    
}

function nodeValue(node) {
	var result = "";
	if (node.nodeType == 1) {
		var children = node.childNodes;
		for (var i = 0; i < children.length; ++i) {
			result += nodeValue(children[i]);
		}		
	}
	else if (node.nodeType == 3) {
		result = node.nodeValue;
	}
	return(result);
}

function slideLabel() {
	var slideColl = GetElementsWithClassName('*','slide');
	var list = document.getElementById('jumplist');
	smax = slideColl.length;
	for (var n = 0; n < smax; n++) {
		var obj = slideColl[n];

		var did = 'slide' + n.toString();
		obj.setAttribute('id',did);

//		if (isOp) continue;   // Opera fix (hallvord)

		var otext = '';
		var menu = obj.firstChild;
		if (!menu) continue; // to cope with empty slides
		while (menu && menu.nodeType == 3) {
			menu = menu.nextSibling;
		}
	 	if (!menu) continue; // to cope with slides with only text nodes

		var menunodes = menu.childNodes;
		for (var o = 0; o < menunodes.length; o++) {
			otext += nodeValue(menunodes[o]);
		}
		list.options[list.length] = new Option(otext, n);
	}
}

function currentSlide() {
	var cs;
	if (document.getElementById) {
		cs = document.getElementById('currentSlide');
	} else {
		cs = document.currentSlide;
	}
	cs.innerHTML = '<a id="plink" href="" target="_self">' + 
		'<span id="csHere">' + snum + '<\/span> ' + 
		'<span id="csSep">\/<\/span> ' + 
		'<span id="csTotal">' + (smax-1) + '<\/span>' +
		'<\/a>'
		;
	if (snum == 0) {
		cs.style.visibility = 'hidden';
	} else {
		cs.style.visibility = 'visible';
	}
}

function go(step) {
	if (document.getElementById('slideProj').disabled || step == 0) return;
	var jl = document.getElementById('jumplist');
	var cid = 'slide' + snum;
	var ce = document.getElementById(cid);
	if (incrementals[snum].length > 0) {
		for (var i = 0; i < incrementals[snum].length; i++) {
			removeClass(incrementals[snum][i], 'current');
			removeClass(incrementals[snum][i], 'incremental');
		}
	}
	if (step != 'j') {
		snum += step;
		lmax = smax - 1;
		if (snum > lmax) snum = lmax;
		if (snum < 0) snum = 0;
	} else
		snum = parseInt(jl.value);
	var nid = 'slide' + snum;
	var ne = document.getElementById(nid);
	if (!ne) {
		ne = document.getElementById('slide0');
		snum = 0;
	}
	if (step < 0) {incpos = incrementals[snum].length} else {incpos = 0;}
	if (incrementals[snum].length > 0 && incpos == 0) {
		for (var i = 0; i < incrementals[snum].length; i++) {
			if (hasClass(incrementals[snum][i], 'current'))
				incpos = i + 1;
			else
				addClass(incrementals[snum][i], 'incremental');
		}
	}
	if (incrementals[snum].length > 0 && incpos > 0)
		addClass(incrementals[snum][incpos - 1], 'current');
	if (! isOp) { //hallvord
		ce.style.visibility = 'hidden'; 
		ne.style.visibility = 'visible';
	} // /hallvord
    location.hash = nid;
	jl.selectedIndex = snum;
	currentSlide();
	reloadNote();
	permaLink();
	number = undef;
}

function goTo(target) {
	if (target >= smax || target == snum) return;
	go(target - snum);
}

function subgo(step) {
	if (step > 0) {
		removeClass(incrementals[snum][incpos - 1],'current');
		removeClass(incrementals[snum][incpos], 'incremental');
		addClass(incrementals[snum][incpos],'current');
		incpos++;
	} else {
		incpos--;
		removeClass(incrementals[snum][incpos],'current');
		addClass(incrementals[snum][incpos], 'incremental');
		addClass(incrementals[snum][incpos - 1],'current');
	}
	loadNote();
}

function toggle() {
	var slideColl = GetElementsWithClassName('*','slide');
	var slides = document.getElementById('slideProj');
	var outline = document.getElementById('outlineStyle');
	if (!slides.disabled) {
		slides.disabled = true;
        hideNotesWindow();
		outline.disabled = false;
		s5mode = false;
		fontSize('1em');
		for (var n = 0; n < smax; n++) {
			var slide = slideColl[n];
			slide.style.visibility = 'visible';
		}
	} else {
		slides.disabled = false;
		outline.disabled = true;
		s5mode = true;
		fontScale();
		for (var n = 0; n < smax; n++) {
			var slide = slideColl[n];
			slide.style.visibility = 'hidden';
		}
		slideColl[snum].style.visibility = 'visible';
	}
}

function showHide(action) {
	var obj = GetElementsWithClassName('*','hideme')[0];
	switch (action) {
	case 's': obj.style.visibility = 'visible'; break;
	case 'h': obj.style.visibility = 'hidden'; break;
	case 'k':
		if (obj.style.visibility != 'visible') {
			obj.style.visibility = 'visible';
		} else {
			obj.style.visibility = 'hidden';
		}
	break;
	}
}

// 'keys' code adapted from MozPoint (http://mozpoint.mozdev.org/)
function keys(key) {
	if (!key) {
		key = event;
		key.which = key.keyCode;
	}
	if (key.which == 84) {
		toggle();
		return;
	}
	if (s5mode) {
		switch (key.which) {
			case 10: // return
			case 13: // enter
				if (window.event && isParentOrSelf(window.event.srcElement, 'controls')) return;
				if (key.target && (isParentOrSelf(key.target, 'controls') || key.target.nodeName.toLowerCase () == "button")) return;
				if(number != undef) {
					goTo(number);
					break;
				}
			case 32: // spacebar
			case 34: // page down
			case 39: // rightkey
			case 40: // downkey
            case 74: // j
				if(number != undef) {
					go(number);
				} else if (!incrementals[snum] || incpos >= incrementals[snum].length) {
					go(1);
				} else {
					subgo(1);
				}
				break;
			case 33: // page up
			case 37: // leftkey
			case 38: // upkey
            case 66: // b
            case 75: // k
				if(number != undef) {
					go(-1 * number);
				} else if (!incrementals[snum] || incpos <= 0) {
					go(-1);
				} else {
					subgo(-1);
				}
				break;
			case 36: // home
				goTo(0);
				break;
			case 35: // end
				goTo(smax-1);
				break;
			case 67: // c
				showHide('k');
				break;
			case 78: // n
                toggleNotesWindow();
				break;
		}
		if (key.which < 48 || key.which > 57) {
			number = undef;
		} else {
			if (window.event && isParentOrSelf(window.event.srcElement, 'controls')) return;
			if (key.target && isParentOrSelf(key.target, 'controls')) return;
			number = (((number != undef) ? number : 0) * 10) + (key.which - 48);
		}
	}
	return false;
}

function isleft(x){
    var width = 1024;
    if (window.innerWidth) {
		width = window.innerWidth;
	} else if (document.documentElement.clientWidth) {
		width = document.documentElement.clientWidth;
	} else if (document.body.clientWidth) {
		width = document.body.clientWidth;
	}
    return x < width/2;
}

function clicker(e) {
	number = undef;
	var target;
	if (window.event) {
		target = window.event.srcElement;
		e = window.event;
	} else {
         target = e.target;
    }
	if (target.href != null || hasValue(target.rel, 'external') || isParentOrSelf(target, 'controls') || isParentOrSelf(target,'embed') || isParentOrSelf(target,'object') || target.nodeName.toLowerCase () == "button" || (target.nodeName.toLowerCase () == "img" && isParentLink(target))) {
        return true;
    }
	if (!e.which || e.which == 1) {
        var step = 1;
        if(isleft(e.clientX)){
            step = -1;
        }
		if (!incrementals[snum] || incpos >= incrementals[snum].length) {
			go(step);
		} else {
			subgo(step);
		}
	}
}

function findSlide(hash) {
	var target = null;
	var slides = GetElementsWithClassName('*','slide');
	for (var i = 0; i < slides.length; i++) {
		var targetSlide = slides[i];
		if ( (targetSlide.name && targetSlide.name == hash)
		 || (targetSlide.id && targetSlide.id == hash) ) {
			target = targetSlide;
			break;
		}
	}
	while(target != null && target.nodeName != 'BODY') {
		if (hasClass(target, 'slide')) {
			return parseInt(target.id.slice(5));
		}
		target = target.parentNode;
	}
	return null;
}

function slideJump() {
	if (window.location.hash == null) return;
	var sregex = /^#slide(\d+)$/;
	var matches = sregex.exec(window.location.hash);
	var dest = null;
	if (matches != null) {
		dest = parseInt(matches[1]);
	} else {
		dest = findSlide(window.location.hash.slice(1));
	}
	if (dest != null)
		go(dest - snum);
}

function fixLinks() {
	var thisUri = window.location.href;
	thisUri = thisUri.slice(0, thisUri.length - window.location.hash.length);
	var aelements = document.getElementsByTagName('A');
	for (var i = 0; i < aelements.length; i++) {
		var a = aelements[i].href;
		var slideID = a.match('\#slide[0-9]{1,2}');
		if ((slideID) && (slideID[0].slice(0,1) == '#')) {
			var dest = findSlide(slideID[0].slice(1));
			if (dest != null) {
				if (aelements[i].addEventListener) {
					aelements[i].addEventListener("click", new Function("e",
						"if (document.getElementById('slideProj').disabled) return;" +
						"go("+dest+" - snum); " +
						"if (e.preventDefault) e.preventDefault();"), true);
				} else if (aelements[i].attachEvent) {
					aelements[i].attachEvent("onclick", new Function("",
						"if (document.getElementById('slideProj').disabled) return;" +
						"go("+dest+" - snum); " +
						"event.returnValue = false;"));
				}
			}
		}
	}
}

function externalLinks() {
	if (!document.getElementsByTagName) return;
	var anchors = document.getElementsByTagName('a');
	for (var i=0; i<anchors.length; i++) {
		var anchor = anchors[i];
		if (anchor.getAttribute('href') && hasValue(anchor.rel, 'external')) {
			anchor.target = '_blank';
			addClass(anchor,'external');
		}
	}
}

function permaLink() {
	document.getElementById('plink').href = window.location.pathname + '#slide' + snum;
}

function createControls() {
	var controlsDiv = document.getElementById("controls");
	if (!controlsDiv) return;
	var hider = ' onmouseover="showHide(\'s\');" onmouseout="showHide(\'h\');"';
	var hideDiv, hideList = '';
	if (controlVis == 'hidden') {
		hideDiv = hider;
	} else {
		hideList = hider;
	}
	controlsDiv.innerHTML = '<form action="#" id="controlForm"' + hideDiv + '>' +
	'<div id="navLinks">' +
	'<a accesskey="n" id="show-notes" href="javascript:toggleNotesWindow();" title="Show Notes" target="_self">&equiv;<\/a>' +
	'<a accesskey="t" id="toggle" href="javascript:toggle();" title="Show Outline" target="_self">&#216;<\/a>' +
	'<a accesskey="z" id="prev" href="javascript:go(-1);" title="Prev Slide" target="_self">&laquo;<\/a>' +
	'<a accesskey="x" id="next" href="javascript:go(1);" title="Next Slide" target="_self">&raquo;<\/a>' +
	'<div id="navList"' + hideList + '><select id="jumplist" onchange="go(\'j\');"><\/select><\/div>' +
	'<\/div><\/form>' +
    '<div id="cursor_left_holder" style="display:none; cursor:url(' + "'ui/default/cursor_left.ico'" + '), auto"></div>' +
    '<div id="cursor_right_holder" style="display:none; cursor:url(' + "'ui/default/cursor_right.ico'" + '), auto"></div>';
	if (controlVis == 'hidden') {
		var hidden = document.getElementById('navLinks');
	} else {
		var hidden = document.getElementById('jumplist');
	}
	addClass(hidden,'hideme');
}

function fontScale() {  // causes layout problems in FireFox that get fixed if browser's Reload is used; same may be true of other Gecko-based browsers
	if (!s5mode) return false;
	var vScale = 48;  // both yield 16 (the usual browser default) at 1024x768
	var hScale = 64;  // perhaps should auto-calculate based on theme's declared value?
	if (window.innerHeight) {
		var vSize = window.innerHeight;
		var hSize = window.innerWidth;
	} else if (document.documentElement.clientHeight) {
		var vSize = document.documentElement.clientHeight;
		var hSize = document.documentElement.clientWidth;
	} else if (document.body.clientHeight) {
		var vSize = document.body.clientHeight;
		var hSize = document.body.clientWidth;
	} else {
		var vSize = 700;  // assuming 1024x768, minus chrome and such
		var hSize = 1024; // these do not account for kiosk mode or Opera Show
	}
	var newSize = Math.min(Math.round(vSize/vScale),Math.round(hSize/hScale));
	fontSize(newSize + 'px');
	if (isGe) {  // hack to counter incremental reflow bugs
		var obj = document.getElementsByTagName('body')[0];
		obj.style.display = 'none';
		obj.style.display = 'block';
	}
}

function fontSize(value) {
	if (!(s5ss = document.getElementById('s5ss'))) {
		if (!document.createStyleSheet) {
			document.getElementsByTagName('head')[0].appendChild(s5ss = document.createElement('style'));
			s5ss.setAttribute('media','screen, projection');
			s5ss.setAttribute('id','s5ss');
		} else {
			document.createStyleSheet();
			document.s5ss = document.styleSheets[document.styleSheets.length - 1];
		}
	}
	if (!(document.s5ss && document.s5ss.addRule)) {
		while (s5ss.lastChild) s5ss.removeChild(s5ss.lastChild);
		s5ss.appendChild(document.createTextNode('html {font-size: ' + value + ' !important;}'));
	} else {
		document.s5ss.addRule('html','font-size: ' + value + ' !important;');
	}
}

function notOperaFix() {
	slideCSS = document.getElementById('slideProj').href;
	var slides = document.getElementById('slideProj');
	var outline = document.getElementById('outlineStyle');
	slides.setAttribute('media','screen');
	outline.disabled = true;
	if (isGe) {
		slides.setAttribute('href','null');   // Gecko fix
		slides.setAttribute('href',slideCSS); // Gecko fix
	}
	if (isIE && document.styleSheets && document.styleSheets[0]) {
		document.styleSheets[0].addRule('img', 'behavior: url(ui/default/iepngfix.htc)');
		document.styleSheets[0].addRule('div', 'behavior: url(ui/default/iepngfix.htc)');
		document.styleSheets[0].addRule('.slide', 'behavior: url(ui/default/iepngfix.htc)');
	}
}

function getIncrementals(obj) {
	var incrementals = new Array();
	if (!obj) 
		return incrementals;
	var children = obj.childNodes;
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (hasClass(child, 'incremental')) {
			if (child.nodeName == 'OL' || child.nodeName == 'UL') {
				removeClass(child, 'incremental');
				for (var j = 0; j < child.childNodes.length; j++) {
					if (child.childNodes[j].nodeType == 1) {
						addClass(child.childNodes[j], 'incremental');
					}
				}
			} else {
				incrementals[incrementals.length] = child;
				removeClass(child,'incremental');
			}
		}
		if (hasClass(child, 'show-first')) {
			if (child.nodeName == 'OL' || child.nodeName == 'UL') {
				removeClass(child, 'show-first');
				if (child.childNodes[isGe].nodeType == 1) {
					removeClass(child.childNodes[isGe], 'incremental');
				}
			} else {
				incrementals[incrementals.length] = child;
			}
		}
		incrementals = incrementals.concat(getIncrementals(child));
	}
	return incrementals;
}

function createIncrementals() {
	var incrementals = new Array();
	for (var i = 0; i < smax; i++) {
		incrementals[i] = getIncrementals(document.getElementById('slide'+i));
	}
	return incrementals;
}

function defaultCheck() {
	var allMetas = document.getElementsByTagName('meta');
	for (var i = 0; i< allMetas.length; i++) {
		if (allMetas[i].name == 'defaultView') {
			defaultView = allMetas[i].content;
		}
		if (allMetas[i].name == 'controlVis') {
			controlVis = allMetas[i].content;
		}
	}
}

// Key trap fix, new function body for trap()
function trap(e) {
	if (!e) {
		e = event;
		e.which = e.keyCode;
	}
	try {
		modifierKey = e.ctrlKey || e.altKey || e.metaKey;
	}
	catch(e) {
		modifierKey = false;
	}
	return modifierKey || e.which == 0;
}

function noteLabel() { // Gives notes id's to match parent slides
	var notes = GetElementsWithClassName('div','notes');
	for (var i = 0; i < notes.length; i++) {
		var note = notes[i];
		var id = 'note' + note.parentNode.id.substring(5);
		note.setAttribute('id',id);
	}
}

function createNotesWindow() { // creates a window for our notes
    var element = document.createElement('iframe');
    element.id = 's5NotesWindow';
    element.name = 's5NotesWindow';
    element.setAttribute('frameborder', 0);
    element.width = '100%';
    element.scrolling = 'auto';
    element.style.zIndex = 1000;
    element.style.position = 'absolute';
    element.style.margin = 0;
    element.style.top = 0;
    element.style.display = 'none';
    element.setAttribute('tabindex', '1');
    element.onload = "this.style.height=document.body.clientHeight-84";
    element.height = '100%';
    element.src = 'ui/s5-notes.html';
    document.body.appendChild(element);
    document.body.setAttribute('tabindex', '0');
    s5NotesWindow = element.contentWindow;
}

function toggleNotesWindow(){
    var hided = (document.getElementById('s5NotesWindow').style.display=='none');
    document.getElementById('s5NotesWindow').style.display = (hided ? '' : 'none');
    if(hided){
        document.getElementById('s5NotesWindow').focus();
    }else{
        document.body.focus();
    }
}

function hideNotesWindow(){
    document.getElementById('s5NotesWindow').style.display = 'none';
}

function reloadNote(){
    if(s5NotesWindow.document.getElementById('notes')/*document loaded*/){
        loadNote();
    }
}

function loadNote() {
    // Loads a note into the note window
	var notes = nextNotes = '<em class="disclaimer">There are no notes for this slide.</em>';
	if (document.getElementById('note' + snum)) {
		notes = document.getElementById('note' + snum).innerHTML;
	}
	if (document.getElementById('note' + (snum + 1))) {
		nextNotes = document.getElementById('note' + (snum + 1)).innerHTML;
	}
	
	var jl = document.getElementById('jumplist');
	var slideTitle = jl.options[jl.selectedIndex].text.replace(/^\d+\s+:\s+/, '') + ((jl.selectedIndex) ? ' (' + jl.selectedIndex + '/' + (smax - 1) + ')' : '');
	if (incrementals[snum].length > 0) {
		slideTitle += ' <small>[' + incpos + '/' + incrementals[snum].length + ']</small>';
	}
	if (jl.selectedIndex < smax - 1) {
		var nextTitle = jl.options[jl.selectedIndex + 1].text.replace(/^\d+\s+:\s+/, '') + ((jl.selectedIndex + 1) ? ' (' + (jl.selectedIndex + 1) + '/' + (smax - 1) + ')' : '');
	} else {
		var nextTitle = '[end of slide show]';
        nextNotes = '';
	}
	
	s5NotesWindow.document.getElementById('slide').innerHTML = slideTitle;
	s5NotesWindow.document.getElementById('notes').innerHTML = notes;
	s5NotesWindow.document.getElementById('next').innerHTML = nextTitle;
	s5NotesWindow.document.getElementById('nextnotes').innerHTML = nextNotes;
    s5NotesWindow.document.getElementById('timeLeft').innerHTML = document.getElementById('timeLeft').innerHTML;
    s5NotesWindow.noteLoaded();
}

function windowChange() {
	fontScale();
}

function startup() {
	defaultCheck();
	createControls();  // hallvord
	slideLabel();
	incrementals = createIncrementals();
	noteLabel(); // [SI:060104] must follow slideLabel()
	fixLinks();
	externalLinks();
	fontScale();
    createNotesWindow();
	if (!isOp) notOperaFix();
	slideJump();
    presentationPeriod = document.getElementById('timeLeft').innerHTML;
    if(! presentationPeriod){
        presentationPeriod = 120;
    }else{
        presentationPeriod = parseInt(presentationPeriod);
    }
    setInterval(function(){
        var now = new Date();
        var timeLeft = presentationPeriod - parseInt((now.valueOf() - presentationStart.valueOf())/60000);
        document.getElementById('timeLeft').innerHTML = timeLeft;
        s5NotesWindow.document.getElementById('timeLeft').innerHTML = timeLeft;
        if(timeLeft < 0){
            document.getElementById('timer').className = 'overtime';
            s5NotesWindow.document.getElementById('timer').className = 'overtime';
        }
    }, 60000);
	if (defaultView == 'outline') {
		toggle();
	}
	document.onkeyup = keys;
	document.onkeypress = trap;
	document.onclick = clicker;
}

window.onload = startup;
window.onresize = function(){setTimeout('windowChange()',5);};
window.onmousemove = function(e) {
    if(s5mode){
        if (isleft(e.clientX)) {
            if(document.body.style.cursor != document.getElementById("cursor_left_holder").style.cursor){
                document.body.style.cursor = document.getElementById("cursor_left_holder").style.cursor;
            }
        } else {
            if(document.body.style.cursor != document.getElementById("cursor_right_holder").style.cursor){
                document.body.style.cursor = document.getElementById("cursor_right_holder").style.cursor;
            }
	    }
    } else {
        document.body.style.cursor = 'auto';
    }
};
