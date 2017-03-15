(function(){

	var currentTimer = null;
	var currentCounter = null;
	var isRunning = false;
	var iconMode = true;
	var hours = 0,
	    minutes = 0,
		seconds = 0;

	var timerOpacity = .05;
	// default parameters
	var js = document.createElement("link");

    js.rel = "stylesheet";
    js.href = "http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css";

    document.head.appendChild(js);
	
	Reveal.addEventListener( 'fragmentshown', function( event ) {
       console.debug('fragmentshown');
	});

	Reveal.addEventListener( 'fragmenthidden', function( event ) {
	  	console.debug('fragmenthidden');
	} );

	Reveal.addEventListener( 'ready', function( event ) {
		setup();
		selectTimer();
	} );

	Reveal.addEventListener( 'slidechanged', function( event ) {
		console.debug( "slidechanged ");
		selectTimer();
	} );

	Reveal.addEventListener( 'paused', function( event ) {
		
	} );

	Reveal.addEventListener( 'resumed', function( event ) {
	} );

	Reveal.addEventListener( 'overviewshown', function( event ) {
		//document.querySelector(".audio-controls").style.visibility = "hidden";
	} );

	Reveal.addEventListener( 'overviewhidden', function( event ) {
		//document.querySelector(".audio-controls").style.visibility = "visible";
	} );
	
	Reveal.addEventListener( 'timerSwitchMode', function( event ) {
		var timerIcon = document.getElementById("timerclock");
		var timerDiv = document.getElementById("timer-div");
		var shown = event.shown;
		if (iconMode) {
			timerIcon.style.display = shown ? "block" : "none";
		} else {
			timerDiv.style.display = shown ? "block" : "none";
		}
	} );
	
	function setup() {		
		
		// set style so that audio controls are shown on hover 
		var css='#timerclock { opacity:' + timerOpacity + ';} #timerclock:hover { opacity:1;}';
		
		style=document.createElement( 'style' );
		if ( style.styleSheet ) {
		    style.styleSheet.cssText=css;
		}
		else { 
		    style.appendChild( document.createTextNode( css ) );
		}		
		document.getElementsByTagName( 'head' )[0].appendChild( style );

		//silence = new SilentAudio( defaultDuration ); // create the wave file

		var divElement =  document.createElement( 'div' );
		divElement.className = "timer-controls";
		divElement.id = "timer-div";
		divElement.setAttribute( 'style', "width: 100px; height:80px; position: fixed; left: 0; top:0;" );
		if (iconMode) {
			divElement.style.display = "none";
		}

		var clockElement =  document.createElement( 'i' );
		clockElement.className = "fa fa-clock-o";
		clockElement.id = "timerclock";
		clockElement.setAttribute( 'style', "width: 20px; height:20px; position: fixed; left: 30px; top:10px;" );
		if (!iconMode) {
			clockElement.style.display = "none";
		}

		if(iconMode) {
			clockElement.style.display = "none";
		}
		
		var startPauseBtn = document.createElement('i');
		startPauseBtn.className = 'fa fa-play-circle-o';
		startPauseBtn.setAttribute('aria-hidden', "true");
		startPauseBtn.id = "timerstart";

		var resetBtn = document.createElement('i');
		resetBtn.className = 'fa fa-stop-circle-o';
		resetBtn.setAttribute('aria-hidden', "true");
		resetBtn.setAttribute('style', "margin-left:5px");
		resetBtn.id = "timerstop";
		//resetBtn.style.display = "none";
		
		//var startPauseBtn = document.getElementById("timerstart");
		startPauseBtn.onclick = (function(){
			
			return function(event){
				event.stopPropagation();
				if (isRunning) {
					isRunning = false;
					startPauseBtn.className = 'fa fa-play-circle-o';
					clearInterval(currentCounter);
				} else {
					isRunning = true;
					startPauseBtn.className = 'fa fa-pause-circle-o';
					currentCounter = setInterval(countUpTime, 1000);
				}
			}
		})();

		//var resetBtn = document.getElementById("timerstop");
		resetBtn.onclick = (function(){
			
			return function(e) {
				e.stopPropagation();
			 	if (isRunning) {
					isRunning = false;
					startPauseBtn.className = 'fa fa-play-circle-o';
					clearInterval(currentCounter);
					resetTime();
				} else {
					clearInterval(currentCounter);
					resetTime();
				}
		 	}
		})();

		//var timerIcon = document.getElementById("timerclock");
		clockElement.onclick = (function(){
			return function() {
				switchMode();
			}
		})();

		divElement.appendChild(startPauseBtn);
		divElement.appendChild(resetBtn);

		divElement.onclick = (function(){
			return function() {
				switchMode();
			}
		})();

		document.querySelector( ".reveal" ).appendChild( divElement );
		document.querySelector(".reveal").appendChild( clockElement );

		// create audio players for all slides
		var horizontalSlides = document.querySelectorAll( '.reveal .slides>section' );
		for( var h = 0, len1 = horizontalSlides.length; h < len1; h++ ) {
			var verticalSlides = horizontalSlides[ h ].querySelectorAll( 'section' );
			if ( !verticalSlides.length ) {
				setupAllTimerElements( divElement, h, 0, horizontalSlides[ h ] );
			}
			else {
				for( var v = 0, len2 = verticalSlides.length; v < len2; v++ ) {
					setupAllTimerElements( divElement, h, v, verticalSlides[ v ] );
				}
			}
		}
	}
	function setupAllTimerElements( container, h, v, slide ) {
		setupTimerElement( container, h + '.' + v);
		// var fragments = slide.querySelectorAll( '.fragment' ) ;
		// for( var f = 0, len = fragments.length; f < len; f++ ) {
		// 	setupAudioElement( container, h + '.' + v + '.' + (parseInt(fragments[ f ].getAttribute( 'data-fragment-index' ))+1), fragments[ f ].getAttribute( 'data-audio-src' ), fragments[ f ].getAttribute( 'data-audio-text' ), fragments[ f ].querySelector( 'video[data-audio-controls]' ),fragments[ f ].getAttribute( 'data-audio-subtitle' ) );
		// }

	}

	function setupTimerElement( container, indices) {
		var labelElement = document.createElement('label');
		labelElement.setAttribute( 'style', "position:　relative; left:10%; width: 80%" );
		labelElement.id = "timerlabel-" + indices;
		labelElement.style.display = "none";
		labelElement.innerText = "00:00";
		//resetBtn.style.display = "none";

		//container.appendChild(labelElement);
		container.insertBefore(labelElement, container.firstChild);
		//container.appendChild(startPauseBtn);
		//container.appendChild(resetBtn);
	}
	
	function selectTimer() {
		//console.log(sub_indices);
		if ( currentTimer ) {
			currentTimer.style.display = "none";
		}
		var indices = Reveal.getIndices();
		var id = "timerlabel-" + indices.h + '.' + indices.v;
		//console.debug(id);
		currentTimer = document.getElementById( id );
		if (currentTimer && !iconMode) {
			currentTimer.style.display = "inline";
		}

		
	}

	function switchMode() {
		var timerIcon = document.getElementById("timerclock");
		//var startPauseBtn = document.getElementById("timerstart");
		//var resetBtn = document.getElementById("timerstop");
		var timerDiv = document.getElementById("timer-div");

		if ( currentTimer ) {
			currentTimer.style.display = "none";
		}
		var indices = Reveal.getIndices();
		var id = "timerlabel-" + indices.h + '.' + indices.v;
		//console.debug(id);
		currentTimer = document.getElementById( id );

		if (iconMode) {
			iconMode = false;
			timerIcon.style.display = "none";
			//selectTimer();
			//startPauseBtn.style.display = "block";
			//resetBtn.style.display = "block";
			// if (currentTimer) {
			// 	currentTimer.style.display = "inline";
			// }
			timerDiv.style.display = "block";
			selectTimer();
		} else {
			iconMode = true;

			timerIcon.style.display = "";
			timerDiv.style.display = "none";
			//startPauseBtn.style.display = "none";
			//resetBtn.style.display = "none";
			// if (currentTimer) {
			// 	currentTimer.style.display = "none";
			// }
		}
	}

	function countUpTime() {
		seconds = seconds + 1;
		if (seconds == 60) {
			seconds = 0;
			minutes = minutes + 1;
			if (minutes == 60) {
				hours = hours + 1;
			}
		}

		displayTime();
	}

	function displayTime() {

		var indices = Reveal.getIndices();
		var id = "timerlabel-" + indices.h + "." + indices.v;
		console.debug(id);
		currentTimer = document.getElementById( id );
		console.debug(currentTimer);

		var time='';
		if (hours > 0) {
			time += hours > 9 ? hours : "0"+hours;
			time += ":";
		}
		
		time += minutes > 9 ? minutes : "0"+minutes;
		time+=":";
		time += seconds > 9 ? seconds : "0"+seconds;

		currentTimer.innerText = time;

	}

	function resetTime() {
		hours = 0;
		minutes = 0;
		seconds = 0;

		displayTime();
	}

})();

var FastBase64={chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encLookup:[],Init:function(){for(var e=0;4096>e;e++)this.encLookup[e]=this.chars[e>>6]+this.chars[63&e]},Encode:function(e){for(var h=e.length,a="",t=0;h>2;)n=e[t]<<16|e[t+1]<<8|e[t+2],a+=this.encLookup[n>>12]+this.encLookup[4095&n],h-=3,t+=3;if(h>0){var s=(252&e[t])>>2,i=(3&e[t])<<4;if(h>1&&(i|=(240&e[++t])>>4),a+=this.chars[s],a+=this.chars[i],2==h){var r=(15&e[t++])<<2;r|=(192&e[t])>>6,a+=this.chars[r]}1==h&&(a+="="),a+="="}return a}};FastBase64.Init();var SilentAudio=function(e){function h(e){return[255&e,e>>8&255,e>>16&255,e>>24&255]}function a(e){return[255&e,e>>8&255]}function t(e){for(var h=[],a=0,t=e.length,s=0;t>s;s++)h[a++]=255&e[s],h[a++]=e[s]>>8&255;return h}this.data=[],this.wav=[],this.dataURI="",this.header={chunkId:[82,73,70,70],chunkSize:0,format:[87,65,86,69],subChunk1Id:[102,109,116,32],subChunk1Size:16,audioFormat:1,numChannels:1,sampleRate:8e3,byteRate:0,blockAlign:0,bitsPerSample:8,subChunk2Id:[100,97,116,97],subChunk2Size:0},this.Make=function(e){for(var s=0;s<e*this.header.sampleRate;s++)this.data[s]=127;this.header.blockAlign=this.header.numChannels*this.header.bitsPerSample>>3,this.header.byteRate=this.header.blockAlign*this.sampleRate,this.header.subChunk2Size=this.data.length*(this.header.bitsPerSample>>3),this.header.chunkSize=36+this.header.subChunk2Size,this.wav=this.header.chunkId.concat(h(this.header.chunkSize),this.header.format,this.header.subChunk1Id,h(this.header.subChunk1Size),a(this.header.audioFormat),a(this.header.numChannels),h(this.header.sampleRate),h(this.header.byteRate),a(this.header.blockAlign),a(this.header.bitsPerSample),this.header.subChunk2Id,h(this.header.subChunk2Size),16==this.header.bitsPerSample?t(this.data):this.data),this.dataURI="data:audio/wav;base64,"+FastBase64.Encode(this.wav)},this.Make(e)};
