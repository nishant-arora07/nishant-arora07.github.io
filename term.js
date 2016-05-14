var term, logDate, logTime, counter, pageBuffer, pageCallback, connectCallback, homeScreen, timer, state, feelingLucky, resultsCrsr, params=null, audios=null;
var pageDelay=90;
var connectDelay=50;
var frameChar='\u2016'; //'\u2551';
var sepChar='\u2503';
var pipeChar='\u254F';
var flashDelay=400;
var months=[
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];
var weekdays=[
	'Sunday', 'Monday', 'Tuesday', 'Wednesday',
	'Thursday', 'Friday', 'Saturday'
];
var googleLogo=[
	' %c(blue)HH    HH      %c(red) A        %c(yellow)PPPPPPP   %c(yellow)PPPPPPP  %c(green1)YY    YY  %c(0)',
	' %c(blue)HH    HH      %c(red)AAAA      %c(yellow)PP    PP  %c(yellow)PP    PP  %c(green1)YY  YY    %c(0)',
	' %c(blue)HH    HH     %c(red)AA  AA     %c(yellow)PP    PP  %c(yellow)PP    PP   %c(green1)YYYY   %c(0)',
	' %c(blue)HHHHHHHH  %c(red)  AA    AA    %c(yellow)PPPPPPP   %c(yellow)PPPPPPP     %c(green1)YY  %c(0)',
	' %c(blue)HH    HH %c(red)  AAAAAAAAAA   %c(yellow)PP        %c(yellow)PP          %c(green1)YY %c(0)',
	' %c(blue)HH    HH %c(red) AA        AA  %c(yellow)PP        %c(yellow)PP          %c(green1)YY  %c(0)',
	' %c(blue)HH    HH %c(red)AA          AA %c(yellow)PP        %c(yellow)PP          %c(green1)YY  %c(0)',
	'',
	' %c(yellow)BBBBBBB     %c(cyan);;    %c(green1)DDDDDDD          %c(blue) A        %c(red)YY    YY   %c(0)',
	' %c(yellow)BB    BB   %c(cyan);;     %c(green1)DD    DD         %c(blue)AAAA       %c(red)YY  YY      %c(0)',
	' %c(yellow)BB    BB          %c(green1)DD    DD        %c(blue)AA  AA       %c(red)YYYY      %c(0)',
	' %c(yellow)BBBBBBB           %c(green1)DD    DD     %c(blue)  AA    AA       %c(red)YY   %c(0)',
	' %c(yellow)BB    BB          %c(green1)DD    DD    %c(blue)  AAAAAAAAAA      %c(red)YY    %c(0)',
	' %c(yellow)BB    BB          %c(green1)DD    DD    %c(blue) AA        AA     %c(red)YY     %c(0)',
	' %c(yellow)BBBBBBB           %c(green1)DDDDDDD     %c(blue)AA          AA    %c(red)YY    %c(0)',
];
var resultsSeparator='+---------------------------------+---------------------------------+';
var blankLine='                                                                                ';
var stopLine= '................................................................................';
var separatorLine= frameChar+'------------------------------------------------------------------------------'+frameChar;
var frameLine=pad(0,'');

var news = [
	['AL GORE INVENTS THE INTERNET', ''],
	['MICHEAL JACKSON OWNS PLUTO', ''],
	['RONALD REAGAN VISITS BELGIUM BY ACCIDENT', ''],
	['FIRST DEMOCRAT IN SPACE', '']
];

var searchResults= null;
var resultsError='';
var resultsReady=true;
var pageOffsets=[0];
var resultsSeen=0;
var moreResults=false;
var logName='';
var kbd, keycapsPath='keycaps80s/';
var isMobile = RegExp(/\bmobile\b/i).test(navigator.userAgent);

var openingPrompt = ' surpro\bisr\be me\n\t\tGet ready...';

var initialPrompts = [
	pad(9, 'Selected server [ NISHANT-PC ]'),
	pad(9, 'Dialing number...'),
	pad(9, 'Sending connection key...'),
	pad(9, 'Receiving data...')
];

function init() {
	var i, d=new Date();
	logDate = weekdays[d.getDay()]+' '+d.getDate()+' '+months[d.getMonth()]+' '+d.getFullYear();
	logTime = normalize(d.getHours(),2)+':'+normalize(d.getMinutes(),2)+':'+normalize(d.getSeconds(),2);
	getParams();
	if (params) {
		var n=params.u || params.user;
		if (n) {
			n=n.replace(/[\s\.\-]+/g, '_').replace(/[^\w$]/g, '').replace(/^_+/, '').replace(/_+$/, '');
			if (n.length>11) n=n.substring(0,11);
			if (RegExp(/[a-z]/i).test(n)) logName=n;
		}
	}
	TermGlobals.assignStyle( 16, 'b', '<span class="blueBg">', '</span>' );
	TermGlobals.assignStyle( 32, 'f', '<span class="redBg">', '</span>' );
	TermGlobals.setColor('blue', '#2b6afd');
	TermGlobals.setColor('cyan', '#00f0f3');
	TermGlobals.setColor('green', '#00ed62');
	TermGlobals.setColor('green2', '#009113');
	TermGlobals.setColor('yellow', '#fbee67');
	TermGlobals.setColor('red', '#c90004');
	termOpen();
	if (isMobile || (params && params.kbd)) keyboardLoad();
}

function normalize(n,l) {
	n=String(n);
	while (n.length<l) n='0'+n;
	return n;
}

function compileHomeScreen() {
	var i, l;
	var user=(logName)? logName.toUpperCase():'ANONYMOUS';
	homeScreen=new Array();
	homeScreen.push(frameLine);
	homeScreen.push(frameLine);
	homeScreen.push( pad(10, '%c(green2)Welcome, it\'s ' + logDate + '. It\'s your Birthday! :)%c(0)') ); //'+logDate+'
	homeScreen.push(frameLine);
	for (i=0, l=googleLogo.length; i<l; i++) homeScreen.push( pad(11, googleLogo[i]) );
	homeScreen.push(frameLine);
	homeScreen.push(frameLine);
}

function termOpen() {
	if ((!term) || (term.closed)) {
		term = new Terminal(
			{
				x: 0,
				y: 0,
				termDiv: 'terminal',
				bgColor: '#000',
				frameWidth: 0,
				initHandler: termInitHandler,
				handler: termHandler,
				rows: 25,
				cols: 81,
				crsrBlockMode: true,
				crsrBlinkMode: true
			}
		);
		term.open();
	}
}

function termInitHandler() {
	this.type('Nishant @ NISHANT-PC: ~/whatever/Hello.World$');
	this.cursorOn();
	var opts='';
	if (logName) opts=' /u="'+logName+'"';
	if (params && params.q) {
		params.q=params.q.replace(/[\u0000-\u001F]/g, ' ').replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s{2,}/g, ' ');
		if (params.q) opts+=' /q="'+params.q.replace(/\"/g, '\\"')+'"';
	}
	if (opts) openingPrompt=openingPrompt.replace(/\n/, opts+'\n');
	setTimeout( function() {openingSequence(0); }, 2600); //SPEED 2600
}

function openingSequence(n) {
	term.cursorOff();
	if (n<openingPrompt.length) {
		var c=openingPrompt.charAt(n++);
		switch (c) {
			case '\b':
				term.c--;
				term.type(' ');
				term.c--;
				break;
			case '\n':
				term.newLine();
				term.type(openingPrompt.substring(n));
				n=openingPrompt.length;
				break;
			default:
				term.type(c);
		}
		term.cursorOn();
		var delay=  (c=='\b')? 300: (n<openingPrompt.length && openingPrompt.charAt(n) =='\b')? 240:120;
		setTimeout( function() { openingSequence(n); }, delay+Math.floor(Math.random()*120));
	}
	else {
		setTimeout(startLogin, 2800);   //SPEED 2800
	}
}

function startLogin() {
	var blueWhite=8*256+16;
	var blueYellow=4*256+16;
	term.clear();
	term.maxLines = term.conf.rows-1;
	term.r=term.maxLines; term.c=0;
	term.type(sepChar, blueWhite);
	term.type('        NISHANT-PC          ', blueYellow);
	term.type(sepChar, blueWhite);
	term.type('  Serial  ', blueYellow);
	term.type(sepChar, blueWhite);
	term.type('  Connected  ', blueYellow);
	term.type(sepChar, blueWhite);
	term.type('    Login time '+logTime+'    ', blueYellow);
	term.type(sepChar, blueWhite);
	for (var r=0; r<term.conf.rows-2;r++) {
		term.typeAt(r,0,frameChar);
		term.typeAt(r,79,frameChar);
	}
	loginSequence();
}

function loginSequence() {
	if (audios) audios[0].play();
	term.maxLines--;
	connectCallback=showHome;
	showPage(initialPrompts, connect, 250);
	getGoogleNews();
}

function showHome() {
	term.cursorOff();
	state=0;
	term.maxLines=term.conf.rows-1;
	if (!homeScreen) compileHomeScreen();
	showPage(homeScreen)//, showHome2)
}

function showHome2() {
	term.newLine();
	if (isMobile || (params && params.kbd)) keyboardShow();
	counter=0;
	term.maxLines=term.conf.rows-1;
	flashSearchLuckyPrompt();
	state=1;
	term.charMode=true;
	term.lock=false;
	term.cursorSet(term.conf.rows-2, 0);
	term.cursorOn();
	resultsCrsr=0;
	resultsSeen=0;
	pageOffsets=[0];
	moreResults=false;
	if (params && params.q) {
		setTimeout( autoChoose, 1000);
		term.lock=true;
	}
}

function autoChoose() {
	term.lock=false;
	TermGlobals.keyHandler({which:115, _remapped:true, _repeat:false});
	var q=params.q;
	setTimeout( function(){autoSearch(q, 0);}, 400);
	delete params.q;
	term.lock=true;
}

function autoSearch(q, i) {
	term.lock=false;
	if (i<q.length) {
		TermGlobals.keyHandler({which:q.charCodeAt(i++), _remapped:true, _repeat:false});
		setTimeout(function(){autoSearch(q,i);}, 320);
	}
	else {
		TermGlobals.keyHandler({which:13, _remapped:true, _repeat:false});
	}
	term.lock=true;
}

function showResults() {
	term.cursorOff();
	if (searchResults && searchResults.length) {
		if (feelingLucky) {
			var r=searchResults[0];
			goToUrl(r.visibleUrl, r.url, true);
		}
		else {
			showResultsPage();
		}
	}
	else {
		var p=new Array();
		if (resultsError) {
			p.push(pad(6,'%c(red)ERROR: '+resultsError+'%c(0)'));
		}
		else {
			p.push(pad(6,'No search results for this search string.'));
		}
		while(p.length<21) p.push(frameLine);
		p.push(pad(6,'--- PRESS A KEY TO START A NEW SEARCH ---'));
		showPage(p, showResults2);
		state=4;
	}
	term.charMode=true;
}

function goToUrl(host, url, showReconnectMessage) {
	term.cursorOff();
	term.newLine();
	term.type('---> CONNECTING TO HOST '+host+'...');
	if (showReconnectMessage) term.write('%n%c(green2)--- RECONNECT WITH OPTION CODE >0< ---');
	self.location.href=url;
	term.lock=false;
}

function showResultsPage() {
	var i, l, k, kl, p=new Array();
	var pageLength=0;
	var base=(resultsCrsr)? pageOffsets[resultsCrsr-1]:0;
	if (!resultsCrsr) p.push(pad(6, '[SEARCH RESULTS]%c(green2)[HOME OPTION CODE >0<]%c(0)'));
	p.push(pad(6, resultsSeparator));
	for (i=base, l=Math.min(base+5, searchResults.length); i<l; i++) {
		var r=searchResults[i];
		var box1 = wrapTo([r.title,r.content], 31, 4);
		var box2 = [wrapTo('Host '+r.visibleUrl,31,1), wrapTo(r.url,31,1), 'OPTION CODE NUMBER >'+(i+1)+'<'];
		for (k=0, kl=Math.max(3, box1.length); k<kl; k++) {
			var s1=box1[k] || '';
			var s2=box2[k] || '';
			if (s1.length<32) s1+=blankLine.substring(0,32-s1.length);
			if (s2.length<32) s2+=blankLine.substring(0,32-s2.length);
			p.push( pad(6, pipeChar+' '+s1.replace(/%/g, '%%')+pipeChar+' '+s2.replace(/%/g, '%%')+pipeChar) );
		}
		p.push(pad(6, resultsSeparator));
		pageLength++;
		if (i>resultsSeen) resultsSeen=i;
		if (p.length>18) break;
	}
	pageOffsets[resultsCrsr]=base+pageLength;
	if (pageOffsets[resultsCrsr]<searchResults.length) {
		while(p.length<21) p.push(frameLine);
		p.push('--- PRESS A KEY TO VIEW THE NEXT PAGE ---');
		moreResults=true;
	}
	else {
		p.push(separatorLine);
		p.push(pad(6,'Please enter your option code to connect to a host...'));
		while(p.length<22) p.push(frameLine);
		moreResults=false;
	}
	showPage(p, showResults2);
}

function showResults2() {
	term.newLine();
	term.cursorOn();
}

function flashSearchLuckyPrompt() {
	if (timer) clearTimeout(timer);
	if (counter) {
		counter=0;
		term.typeAt(term.conf.rows-3, 53, 'Choose (S/L)', 7*256);
	}
	else {
		counter=1;
		term.typeAt(term.conf.rows-3, 53, '            ', 0);
	}
	timer=setTimeout(flashSearchLuckyPrompt, flashDelay);
}

function showPage(buf, callback, delay) {
	pageBuffer=buf;
	pageCallback=callback;
	if (!delay) delay=pageDelay;
	term.lock=true;
	setTimeout(function(){showPageStep(0, delay);}, delay);
}

function showPageStep(n, delay) {
	term.newLine();
	term.write(pageBuffer[n++]);
	if (n<pageBuffer.length) {
		setTimeout(function(){showPageStep(n, delay);}, delay);
	}
	else {
		term.lock=false;
		if (typeof pageCallback == 'function') pageCallback();
	}
}

function connect() {
	term.maxLines=term.conf.rows-1;
	term.r=term.maxLines-1;
	term.c=0;
	term.maxCols=80;
	term.lock=true;
	counter=100+Math.floor(Math.random()*120);
	setTimeout( connectStep, connectDelay );
}

function connectStep() {
	term.type('.');
	if (--counter>0 || !resultsReady) {
		setTimeout(connectStep, connectDelay);
	}
	else {
		term.lock=false;
		connectEnd();
	}
}

function connectEnd() {
	term.maxCols=81;
	term.typeAt(term.conf.rows-2,0,stopLine);
	if (typeof connectCallback == 'function') connectCallback();
}

function wrapTo(t, cols, rows) {
	var rmax, l, i, s, r, ofs, wantArray=true; out=new Array();
	if (typeof t=='string') {
		t=[t];
		if (rows==1) wantArray=false;
	}
	else if (t===undefined || t===null) {
		return (rows==1)? '':[''];
	}
	else if (typeof t!='object') {
		return (rows==1)? String(t):[String(t)];
	}
	rmax=rows-1;
	for (i=0, l=t.length; i<l && out.length<rows; i++) {
		s=t[i];
		while (s.length>cols) {
			if (out.length==rmax) {
				if (s.length>cols) s=s.substring(0,cols-3).replace(/\s{2,}$/, '')+'...';
				out.push(s);
				s='';
				break;
			}
			r=s.substring(cols);
			s=s.substring(0,cols);
			ofs=Math.max(s.lastIndexOf(' '),s.lastIndexOf('-'), s.lastIndexOf(','), s.lastIndexOf('.'), s.lastIndexOf('!'), s.lastIndexOf('?'));
			if (ofs>0) {
				r=s.substring(ofs+1).replace(/^\s+/,' ')+r;
				s=s.substring(0,ofs+1);
			}
			out.push(s);
			s=r.replace(/^\s+/,'');
		}
		if (s) out.push(s);
	}
	return (wantArray)? out:out[0];
}

function pad(p, t) {
	var l, s=frameChar;
	if (p>1) s+=blankLine.substring(0,p-1);
	s+=t;
	l=s.replace(/%c\(.*?\)/g, '').replace(/%[+-][ribfu]/g, '').replace(/%%/g, '%').length;
	if (l<79) s+=blankLine.substring(0,79-l);
	return s+=frameChar;
}

function termHandler() {
	switch (state) {
		case -1:
			if (this.charMode && (this.inputChar==48 || this.inputChar==27)) {
				state=0;
				this.cursorOff();
				this.charMode=false;
				this.lock=true;
				if (this.c>0) this.newLine();
				this.type(stopLine);
				showHome();
			}
			break;
		case 1:
			if (this.inputChar==115 || this.inputChar==108) {
				this.cursorOff();
				feelingLucky=(this.inputChar==108);
				counter=1;
				clearTimeout(timer);
				this.typeAt(this.conf.rows-3, 53, 'Choose (S/L)'+String.fromCharCode(this.inputChar), 7*256);
				this.charMode=false;
				this.maxLines=this.conf.rows-2;
				this.write(pad(9, 'What is your search string? '));
				this.typeAt(this.conf.rows-3, 37, '[                                       ]', 32+7*256);
				this.enterFieldMode(38, 77, 32+4*256);
				state++;
			}
			else if (this.inputChar>48 && this.inputChar<53) {
				var url=news[this.inputChar-49][1];
				if (url) {
					this.cursorOff();
					if (!window.open(url, '_blank')) {
						clearTimeout(timer);
						this.typeAt(this.conf.rows-3, 53, '            ');
						var host=url.replace(/^.*?\/\/(.*?)\/.*$/, '$1');
						goToUrl(host, url, true);
						state=-1;
					}
				}
			}
			else if (this.inputChar==105 || this.inputChar==73) {
				// unofficial img-search
				this.cursorOff();
				clearTimeout(timer);
				this.typeAt(this.conf.rows-3, 53, 'Choose (S/L)'+String.fromCharCode(this.inputChar), 7*256);
				this.write(pad(9, 'Search mode: Images. Sure to switch the search engine? (Y/N)'));
				this.typeAt(this.r,79, frameChar);
				this.newLine();
				this.cursorSet(this.conf.rows-3, 69);
				this.cursorOn();
				this.maxLines=this.conf.rows-2;
				state=5;
			}
			return;
		case 2:
			this.newLine();
			var q=this.lineBuffer.replace(/^\s+/,'').replace(/\s+$/,'');
			if (q) {
				this.write(pad(9, 'Searching for: %c(white)"'+wrapTo(q.replace(/\"/g, '\\"'), 52, 1).replace(/%/g, '%%')+'"%c(0)'));
				connectCallback=showResults;
				googleSearch(q);
				if (audios) audios[1].play();
				connect();
				state++;
			}
			else {
				if (this.c>0) this.newLine();
				this.type(stopLine);
				showHome();
			}
			return;
		case 3:
			if (this.inputChar==48 || this.inputChar==27) {
				this.cursorOff();
				this.charMode=false;
				this.lock=true;
				if (this.c>0) this.newLine();
				this.type(stopLine);
				showHome();
			}
			else if (!feelingLucky) {
				if (this.inputChar>48 && this.inputChar<58) {
					var idx=this.inputChar-49;
					if (searchResults && idx<=resultsSeen) {
						var url=searchResults[idx].url;
						if (url) {
							if (!window.open(url, '_blank')) goToUrl(searchResults[idx].visibleUrl, url, false);
						}
					}
				}
				else if (this.inputChar==this.termKey.LEFT || this.inputChar==this.termKey.UP) {
					if (resultsCrsr) {
						resultsCrsr--;
						showResults();
					}
				}
				else if (searchResults && moreResults) {
					resultsCrsr++;
					showResults();
				}
			}
			return;
		case 4:
			this.cursorOff();
			this.charMode=false;
			this.lock=true;
			if (this.c>0) this.newLine();
			this.type(stopLine);
			showHome();
			return;
		case 5:
			if (this.inputChar==121 || this.inputChar==89 || this.inputChar==110 || this.inputChar==78) {
				this.cursorOff();
				this.charMode=false;
				this.lock=true;
				this.type(String.fromCharCode(this.inputChar));
				this.newLine();
				if (this.inputChar==121 || this.inputChar==89) {
					var url='images/';
					if (params) {
						var n=params.u || params.user;
						if (n) url+='?u='+encodeURIComponent(n);
					}
					this.type('Disconnecting...');
					this.newLine();
					this.type('Connecting to BBS [GOOGLE IMAGES SEARCH ENGINE]...');
					setTimeout(function() {window.location.href=url;}, 450);
				}
				else {
					this.type(stopLine);
					showHome();
				}
			}
			break;
	}
}

function googleSearch(q) {
	searchResults=null;
	resultsReady=false;
	resultsError='';
	var s=document.createElement('script');
	s.type='text/javascript';
	s.src='https://ajax.googleapis.com/ajax/services/search/web?v=1.0&q='+encodeURIComponent(q)+'&callback=googleResults&rsz=8&start=0&hl=en';
	document.getElementsByTagName('body')[0].appendChild(s);
}

function googleResults(obj) {
	if (typeof obj == 'object') {
		if (obj.responseStatus!=200) {
			resultsError = (typeof obj.responseDetails == 'string')? obj.responseDetails: 'Received status '+obj.responseStatus+'.';
		}
		else {
			var d=obj.responseData;
			if (typeof d == 'object' && typeof d.results =='object' && d.results.length) {
				var r=d.results;
				searchResults=new Array();
				for (var i=0, l=Math.min(8, r.length); i<l; i++) {
					var item=r[i];
					searchResults.push({
						title: item.titleNoFormatting.toUpperCase(),
						content: item.content.replace(/<br(\s*\/\s*)>/gi, ' / ').replace(/<.*?>/g, '').replace(/^\s+/,'').replace(/\s+$/,'').replace(/\s+/g,' ').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&apos;/g,'\'').replace(/&#([0-9]+);/g, entityUnescape ).replace(/&amp;/g,'&'),
						url: item.unescapedUrl,
						visibleUrl: item.visibleUrl
					});
				}
				if (typeof d.cursor == 'object' && d.cursor.moreResultsUrl) {
					searchResults.push({
						title: 'MORE GOOGLE RESULTS',
						content: 'Google web search with this search string...',
						url: d.cursor.moreResultsUrl,
						visibleUrl: 'www.google.com'
					});
				}
				else {
					searchResults.push({
						title: 'GOOGLE WEB SEARCH',
						content: 'Visit Google web search for more...',
						url: 'http://www.google.com/',
						visibleUrl: 'www.google.com'
					});
				}
			}
			else {
				resultsError='Data Error.';
			}
		}
	}
	else {
		resultsError='Communication Error, received <none>.';
	}
	resultsReady=true;
}

function entityUnescape(str, p1, offset, s) {
	return String.fromCharCode(parseInt(p1,10));
}

function getGoogleNews() {
	resultsReady=false;
	var s=document.createElement('script');
	s.type='text/javascript';
	s.src='https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q='+encodeURIComponent('http://news.google.com/news?pz=1&cf=all&ned=us&hl=en&topic=h&num=4&output=rss')+'&callback=googleNewsResults';
	document.getElementsByTagName('body')[0].appendChild(s);
}

function googleNewsResults(obj) {
	resultsReady=true;
	if (typeof obj == 'object') {
		if (obj.responseStatus==200) {
			var d=obj.responseData;
			if (typeof d == 'object' && typeof d.feed =='object' && typeof d.feed.entries == 'object' && d.feed.entries.length) {
				var r=d.feed.entries;
				for (var i=0, l=Math.min(4, r.length); i<l; i++) {
					var item=r[i];
					if (item.title) {
						var t=wrapTo(item.title.toUpperCase(),44,1);
						while (t.length<44) t+=' ';
						news[i]=[t+' ['+(i+1)+']', item.link];
					}
				}
			}
		}
	}
}

function setupAudio() {
	var type, a=document.createElement('audio');
	if (!a || !a.canPlayType) return;
	if (a.canPlayType('audio/mpeg')!='') {
		type='mp3';
	}
	else if (a.canPlayType('audio/ogg')!='') {
		type='ogg';
	}
	else if (a.canPlayType('audio/wav')!='' || a.canPlayType('audio/x-wav')!='') {
		type='wav';
	}
	else {
		return;
	}
	var v=0.2;
	audios=new Array();
	a.setAttribute('preload', 'auto');
	a.setAttribute('autobuffer', 'autobuffer');
	a.setAttribute('src', 'modem1.'+type);
	audios.push(a);
	a.load();
	a.volume=v;
	a=document.createElement('audio')
	a.setAttribute('preload', 'auto');
	a.setAttribute('autobuffer', 'autobuffer');
	a.setAttribute('src', 'modem2.'+type);
	audios.push(a);
	a.load();
	a.volume=v;
}

function keyboardLoad() {
	var s=document.createElement('script');
	s.src='termkbd_min.js';
	s.onload=keyboardLoaded;
	document.getElementsByTagName('body')[0].appendChild(s);
}
function keyboardLoaded() {
	if (state==1) {
		keyboardShow();
	}
	else {
		TermKeyboard.prototype.preload(keycapsPath);
	}
}
function keyboardShow() {
	if (!window.TermKeyboard) return;
	if (!kbd) kbd=new TermKeyboard({kbdDiv: 'virtualkbd', keycapsPath: keycapsPath, kbdClass: (isMobile)? 'mobile':''});
	kbd.show();
	var el=document.getElementById('virtualkbd');
	if (el) {
		el.style.marinLeft='0';
		el.style.left=Math.floor((document.getElementById('terminal').offsetWidth-el.offsetWidth)/2)+'px';
	}
}

function getParams() {
	if (self.location.search.length>1) {
		var q=self.location.search.substring(1);
		if (q.indexOf('=')>0) {
			var parts=q.split(/&/);
			params={};
			for (var i=0, l=parts.length; i<l; i++) {
				var pair=parts[i].split(/=/);
				params[pair[0].toLowerCase()]=getDecodedValue(pair[1]);
			}
		}
	}
}

function getDecodedValue(v) {
	var v1, v2, decoded=false;
	if (!v) return '';
	v=v.replace(/\+/g, '%20');
	if (RegExp(/%u[0-9a-fA-F]{4}/).test(v)) {
		v = unescape(v);
		decoded=true;
	}
	if (!decoded) {
		try {
			v1=decodeURIComponent(v);
			if (encodeURIComponent(v1)==v) {
				v=v1;
				decoded=true;
			}
		}
		catch(e) {}
	}
	if (!decoded) {
		try {
			var v1=unescape(v);
			if (escape(v1)==v) {
				v=v1;
				decoded=true;
			}
		}
		catch(e) {}
	}
	if (!decoded) {
		try {
			var v1=decodeURI(v);
			if (encodeURI(v1)==v) {
				v=v1;
				decoded=true;
			}
		}
		catch(e) {}
	}
	if (!decoded) v=v.replace(/(%20|\+)/gi, ' ');
	return v;
}

setupAudio();
onload=init;
