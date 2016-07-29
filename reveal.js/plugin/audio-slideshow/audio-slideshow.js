/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** Audio slideshow is a plugin for reveal.js allowing to
** automatically play audio files for a slide deck. After an audio 
** file has completed playing the next slide or fragment is  
** automatically shown and the respective audio file is played. 
** If no audio file is available, a blank audio file with default
** duration is played instead.
**
** Version: 0.4
** 
** License: MIT license (see LICENSE.md)
**
******************************************************************/

(function(){
	// default parameters
	var prefix = "audio/";
	var suffix = ".ogg";
    var textToSpeechURL = "http://api.voicerss.org/?key=b2864547cd194e81afdb90f2a0dbe5a6&c=ogg&f=8khz_8bit_mono&r=1&hl=en-us&src="
	// var textToSpeechURL = "http://translate.google.com/translate_tts?ie=UTF-8&tl=en-us&client=t&total=1&idx=0&q="; // the text to speech converter
	var defaultDuration = 5; // value in seconds
	var playerOpacity = .05; // opacity when the mouse is far from to the audioplayer
	var startAtFragment = false; // when moving to a slide start at the current fragment or at the start of the slide
	// ------------------

	var silence;
	var currentAudio = null;
	var previousAudio = null;
	var currentLabel = null;
	var currentIcon = null;
	var separator = ".";
	var autoDownLoadAudio = false;
	
	var js = document.createElement("link");
	var iconMode = true;
	var Px;
	var py;
	var subTitleTrigger = true;

    js.rel = "stylesheet";
    js.href = "http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css";

    document.head.appendChild(js);
	
	Reveal.addEventListener( 'fragmentshown', function( event ) {
	   console.debug( "fragmentshown ");
       
       if (!event.subTitle) {
		selectAudio(undefined,0);
		//selectLabel(0);
		if(iconMode){
			selectIcon(0);
		}
		else{
			selectLabel(0);
		}
		
	   }

	} );

	Reveal.addEventListener( 'fragmenthidden', function( event ) {
	  console.debug( "fragmenthidden ");
      
      if (!event.subTitle) {
		selectAudio(undefined,0);
		//selectLabel(0);
		if(iconMode){
			selectIcon(0);
		}
		else{
			selectLabel(0);
		}
	  }
	} );

	Reveal.addEventListener( 'ready', function( event ) {
		setup();
//console.debug( "ready ");
		selectAudio(undefined,0);
		//selectLabel(0);
		if(iconMode){
			selectIcon(0);
		}
		else{
			selectLabel(0);
		}
	} );

	Reveal.addEventListener( 'slidechanged', function( event ) {
		console.debug( "slidechanged ");
		var indices = Reveal.getIndices();
		if ( !startAtFragment && typeof indices.f !== 'undefined' && indices.f > 0) {
			// hide fragments when slide is shown
			Reveal.slide(indices.h, indices.v, -1);		
		}
		if (!event.subTitle) {
		selectAudio(undefined,0);
		//selectLabel(0);
		if(iconMode){
			selectIcon(0);
		}
		else{
			selectLabel(0);
		}
		}
	} );

	Reveal.addEventListener( 'paused', function( event ) {
		currentAudio.pause();
	} );

	Reveal.addEventListener( 'resumed', function( event ) {
	} );

	Reveal.addEventListener( 'overviewshown', function( event ) {
		currentAudio.pause();
		document.querySelector(".audio-controls").style.visibility = "hidden";
	} );

	Reveal.addEventListener( 'overviewhidden', function( event ) {
		document.querySelector(".audio-controls").style.visibility = "visible";
	} );
	
	Reveal.addEventListener( 'menuAudioSelected', function(event) {
		   console.debug("menuAudioSelected");	
            var previousAudio = currentAudio;
			if (currentAudio) {
				currentAudio.pause();
				currentAudio.style.display = "none";
			}

			var h = event.indexh,
			    v = event.indexv,
				f = event.indexf,
				s = event.indexs;
			// change audio
			var audio_id = "audioplayer-" + h + '.' + v;
			if ( f != undefined && f >= 0 ) audio_id = audio_id + '.' + (f+1)+'.'+s;
			else audio_id = audio_id + '.0.' + s;

			currentAudio = document.getElementById( audio_id );
			
			currentAudio.style.display = "block";
			if ( previousAudio && currentAudio.id != previousAudio.id ) {
				currentAudio.volume = previousAudio.volume;
				currentAudio.muted = previousAudio.muted;
	//console.debug( "Play " + currentAudio.id);
				//currentAudio.play();
			}
			
			if ( currentIcon ) {
				currentIcon.style.display = "none";
			}
			if ( currentLabel ) {
				currentLabel.style.display = "none";
			}
			var indices = Reveal.getIndices();
			if(iconMode){
				var icon_id = "icon-" + h + "." + v;
				if (f != undefined && f >= 0) icon_id = icon_id + "." + (f+1)+"."+s;
				else icon_id = icon_id + '.0.' + s;
				
				//console.debug(id);
				currentIcon = document.getElementById( icon_id );
				//console.debug(currentLabel);
				if(subTitleTrigger)
				currentIcon.style.display = "block";
				
				if(Px != undefined && Py != undefined){
					var iconStyleString = "position:fixed; to p: 20px; left:"+Px+"px; top:"+Py+"px; width: 40px";
					var labelStyleString = "position:fixed; to p: 20px; left:"+Px+"px; top:"+Py+"px; width: 80%";
					currentIcon.setAttribute('style', iconStyleString );
					currentIcon.style.zIndex="1000";
					document.getElementById(icon_id.replace(/icon-/, "label-")).setAttribute('style', labelStyleString );
					document.getElementById(icon_id.replace(/icon-/, "label-")).style.zIndex="1000";
					document.querySelector( ".reveal" ).appendChild(currentIcon);
					document.querySelector( ".reveal" ).appendChild(document.getElementById(icon_id.replace(/icon-/, "label-")));	
					document.getElementById(icon_id.replace(/icon-/, "label-")).style.display = "none";
			   }  
			}
			else{
				var label_id = "label-" + h + "." + v;
				if (f != undefined && f >= 0) label_id = label_id + "." + (f+1)+"."+s;
				else label_id = label_id + '.0.' + s;
				
				//console.debug(id);
				currentLabel = document.getElementById( label_id );
				//console.debug(currentLabel);
				if(subTitleTrigger)
				currentLabel.style.display = "block";
				
				if(Px != undefined && Py != undefined){
					var styleString = "position:fixed; to p: 20px; left:"+Px+"px; top:"+Py+"px; width: 80%";
					currentLabel.setAttribute('style', styleString );
					currentLabel.style.zIndex="1000";
					document.getElementById(label_id.replace(/label-/, "icon-")).setAttribute('style', styleString );
					document.getElementById(label_id.replace(/label-/, "icon-")).style.zIndex="1000";
					document.querySelector( ".reveal" ).appendChild(currentLabel);
					document.querySelector( ".reveal" ).appendChild(document.getElementById(label_id.replace(/label-/, "icon-")));	
					document.getElementById(label_id.replace(/label-/, "icon-")).style.display = "none";
				}
			}
	
	});

	function selectAudio( previousAudio,sub_indices ) {
		//console.log(sub_indices);
		
		if ( currentAudio ) {
			currentAudio.pause();
			currentAudio.style.display = "none";
		}
		var indices = Reveal.getIndices();
		var id = "audioplayer-" + indices.h + '.' + indices.v;
		if ( indices.f != undefined && indices.f >= 0 ) id = id + '.' + (parseInt(indices.f)+1)+'.'+sub_indices;
		else id = id + '.0.' + sub_indices;
		//console.log(id);
		currentAudio = document.getElementById( id );
		//console.log(currentAudio);
		currentAudio.style.display = "block";
		if ( previousAudio && currentAudio.id != previousAudio.id ) {
			currentAudio.volume = previousAudio.volume;
			currentAudio.muted = previousAudio.muted;
//console.debug( "Play " + currentAudio.id);
			currentAudio.play();
		}
	}

	function selectLabel( sub_indices) {
		if ( currentLabel ) {
			currentLabel.style.display = "none";
		}
		if ( currentIcon ) {
			currentIcon.style.display = "none";
		}
		var indices = Reveal.getIndices();
		var id = "label-" + indices.h + "." + indices.v;
		if (indices.f != undefined && indices.f >= 0) id = id + "." + (parseInt(indices.f)+1)+"."+sub_indices;
		else id = id + '.0.' + sub_indices;
		
		//console.debug(id);
		currentLabel = document.getElementById( id );
		//console.debug(currentLabel);
		if(subTitleTrigger)
		currentLabel.style.display = "block";
		
		if(Px != undefined && Py != undefined){
			var styleString = "position:fixed; to p: 20px; left:"+Px+"px; top:"+Py+"px; width: 80%";
			currentLabel.setAttribute('style', styleString );
			currentLabel.style.zIndex="1000";
			document.getElementById(id.replace(/label-/, "icon-")).setAttribute('style', styleString );
			document.getElementById(id.replace(/label-/, "icon-")).style.zIndex="1000";
			document.querySelector( ".reveal" ).appendChild(currentLabel);
			document.querySelector( ".reveal" ).appendChild(document.getElementById(id.replace(/label-/, "icon-")));	
			document.getElementById(id.replace(/label-/, "icon-")).style.display = "none";
		}
		
	}
	
		function selectIcon( sub_indices) {
		if ( currentIcon ) {
			currentIcon.style.display = "none";
		}
		if ( currentLabel ) {
			currentLabel.style.display = "none";
		}
		var indices = Reveal.getIndices();
		var id = "icon-" + indices.h + "." + indices.v;
		if (indices.f != undefined && indices.f >= 0) id = id + "." + (parseInt(indices.f)+1)+"."+sub_indices;
		else id = id + '.0.' + sub_indices;
		
		//console.debug(id);
		currentIcon = document.getElementById( id );
		//console.debug(currentLabel);
		if(subTitleTrigger)
		currentIcon.style.display = "block";
		
		if(Px != undefined && Py != undefined){
				var iconStyleString = "position:fixed; to p: 20px; left:"+Px+"px; top:"+Py+"px; width: 40px";
				var labelStyleString = "position:fixed; to p: 20px; left:"+Px+"px; top:"+Py+"px; width: 80%";
				currentIcon.setAttribute('style', iconStyleString );
				currentIcon.style.zIndex="1000";
				document.getElementById(id.replace(/icon-/, "label-")).setAttribute('style', labelStyleString );
				document.getElementById(id.replace(/icon-/, "label-")).style.zIndex="1000";
				document.querySelector( ".reveal" ).appendChild(currentIcon);
				document.querySelector( ".reveal" ).appendChild(document.getElementById(id.replace(/icon-/, "label-")));	
				document.getElementById(id.replace(/icon-/, "label-")).style.display = "none";
		}
	}

	function setup() {
		if ( Reveal.getConfig().audioPrefix ) prefix = Reveal.getConfig().audioPrefix;
		if ( Reveal.getConfig().audioSuffix ) suffix = Reveal.getConfig().audioSuffix;
		if ( Reveal.getConfig().audioTextToSpeechURL ) textToSpeechURL = Reveal.getConfig().audioTextToSpeechURL;
		if ( Reveal.getConfig().audioDefaultDuration ) defaultDuration = Reveal.getConfig().audioDefaultDuration;
		if ( Reveal.getConfig().audioPlayerOpacity ) playerOpacity = Reveal.getConfig().audioPlayerOpacity;
		if ( Reveal.getConfig().separator ) separator = Reveal.getConfig().separator;
		if ( Reveal.getConfig().autoDownLoadAudio != undefined) autoDownLoadAudio = Reveal.getConfig().autoDownLoadAudio;
		if ( Reveal.getConfig().subTitleTrigger != undefined) subTitleTrigger = Reveal.getConfig().subTitleTrigger;
		if ( 'ontouchstart' in window || navigator.msMaxTouchPoints ) {
			opacity = 1;		
		}
		if ( Reveal.getConfig().audioStartAtFragment ) startAtFragment = Reveal.getConfig().audioStartAtFragment;

		// set style so that audio controls are shown on hover 
		var css='.audio-controls>audio { opacity:' + playerOpacity + ';} .audio-controls:hover>audio { opacity:1;} .subTitleIcon{opacity:' + playerOpacity + ';} .subTitleIcon:hover {opacity:1;}';
		style=document.createElement( 'style' );
		if ( style.styleSheet ) {
		    style.styleSheet.cssText=css;
		}
		else { 
		    style.appendChild( document.createTextNode( css ) );
		}		
		document.getElementsByTagName( 'head' )[0].appendChild( style );

		silence = new SilentAudio( defaultDuration ); // create the wave file

		var divElement =  document.createElement( 'div' );
		divElement.className = "audio-controls";
		divElement.setAttribute( 'style', "width: 50%; height:75px; position: fixed; left: 25%; bottom: 4px;z-index: 10;" );
		document.querySelector( ".reveal" ).appendChild( divElement );

		// create audio players for all slides
		var horizontalSlides = document.querySelectorAll( '.reveal .slides>section' );
		for( var h = 0, len1 = horizontalSlides.length; h < len1; h++ ) {
			var verticalSlides = horizontalSlides[ h ].querySelectorAll( 'section' );
			if ( !verticalSlides.length ) {
				setupAllAudioElements( divElement, h, 0, horizontalSlides[ h ] );
			}
			else {
				for( var v = 0, len2 = verticalSlides.length; v < len2; v++ ) {
					setupAllAudioElements( divElement, h, v, verticalSlides[ v ] );
				}
			}
		}
	}
	function setupAllAudioElements( container, h, v, slide ) {
		setupAudioElement( container, h + '.' + v+".0", slide.getAttribute( 'data-audio-src' ), slide.getAttribute( 'data-audio-text' ), slide.querySelector( ':not(.fragment) > video[data-audio-controls]' ) ,slide.getAttribute( 'data-audio-subtitle' ));
		var fragments = slide.querySelectorAll( '.fragment' ) ;
		for( var f = 0, len = fragments.length; f < len; f++ ) {
			setupAudioElement( container, h + '.' + v + '.' + (parseInt(fragments[ f ].getAttribute( 'data-fragment-index' ))+1), fragments[ f ].getAttribute( 'data-audio-src' ), fragments[ f ].getAttribute( 'data-audio-text' ), fragments[ f ].querySelector( 'video[data-audio-controls]' ),fragments[ f ].getAttribute( 'data-audio-subtitle' ) );
		}

	}

	function linkVideoToAudioControls( audioElement, videoElement ) {
		audioElement.addEventListener( 'playing', function( event ) {
			videoElement.currentTime = audioElement.currentTime;
		} );			
		audioElement.addEventListener( 'play', function( event ) {
			videoElement.currentTime = audioElement.currentTime;
			if ( videoElement.paused ) videoElement.play();
		} );			
		audioElement.addEventListener( 'pause', function( event ) {
			videoElement.currentTime = audioElement.currentTime;
			if ( !videoElement.paused ) videoElement.pause();
		} );			
		audioElement.addEventListener( 'volumechange', function( event ) {
			videoElement.volume = audioElement.volume;
			videoElement.muted = audioElement.muted;
		} );		
		audioElement.addEventListener( 'seeked', function( event ) {
			videoElement.currentTime = audioElement.currentTime;
		} );	
		var sourceOfSilence= document.createElement( 'source' );
		if ( videoElement.duration > defaultDuration ) {
			// increase duration of silence	to duration of video
			var videoSilence = new SilentAudio( videoElement.duration ); // create the wave file
			sourceOfSilence.src= videoSilence.dataURI;
		}
		else {
			sourceOfSilence.src= silence.dataURI;
		}
		audioElement.appendChild( sourceOfSilence ); // use this if audio file does not exist
	}

	function setupAudioElement( container, indices, audioFile, text, videoElement ,subtitle) {
	 //console.log(separator);
	 //console.log(subtitle);
	 textArray = text.split(separator);
	 if(subtitle == null){
		 subtitleArray = [];
	 }
	 else{
		 subtitleArray = subtitle.split(separator);
	 }
	 textArray.splice(textArray.length-1,1);
	 //console.log(textArray);
	 for(var i = 0;i < textArray.length; i++){
		var audioElement = document.createElement( 'audio' );
		audioElement.setAttribute( 'style', "position: relative; to p: 20px; left: 10%; width: 80%;" );
		audioElement.id = "audioplayer-" + indices+"."+i;
		audioElement.style.display = "none";
		audioElement.setAttribute( 'controls', '' );
		audioElement.setAttribute( 'preload', 'none' );
		//audioElement.setAttribute( 'preload', 'auto' );
		
		var labelElement = document.createElement('label');
		labelElement.setAttribute( 'style', "position:　relative; to p: 20px; left:10%; width: 80%" );
		labelElement.id = "label-" + indices + "." + i;
		labelElement.style.display = "none";
		labelElement.draggable = true; 
		labelElement.onclick = (function(sub_indices){
		return function(){
		iconMode = true;
		currentLabel.style.display = "none"
		var indices = Reveal.getIndices();
		var id = "icon-" + indices.h + "." + indices.v;
		if (indices.f != undefined && indices.f >= 0) id = id + "." + (parseInt(indices.f)+1)+"."+sub_indices;
		else id = id + '.0.' + sub_indices;
		//console.debug(id);
		currentIcon = document.getElementById( id );
		//console.debug(currentLabel);
		if(subTitleTrigger)
		currentIcon.style.display = "block";
		}
	})(i);
	
		labelElement.addEventListener('dragstart',function(event){
			var dataTransfer = event.dataTransfer;
			dataTransfer.effectAllowed = "all";
		}
		);
		
		labelElement.addEventListener('dragend',function(event){
			event.preventDefault();
			var dataTransfer = event.dataTransfer;
			dataTransfer.dropEffect = "move";
			var e = event || window.event;
			var styleString = "position:fixed; to p: 20px; left:"+e.clientX+"px; top:"+e.clientY+"px; width: 80%";
			Px = e.clientX;
			Py = e.clientY;
			document.getElementById(event.target.id).setAttribute('style', styleString );
			document.getElementById(event.target.id).style.zIndex="1000";
			document.getElementById(event.target.id.replace(/label-/, "icon-")).setAttribute('style', styleString );
			document.getElementById(event.target.id.replace(/label-/, "icon-")).style.zIndex="1000";
			document.querySelector( ".reveal" ).appendChild(document.getElementById(event.target.id));
			document.querySelector( ".reveal" ).appendChild(document.getElementById(event.target.id.replace(/label-/, "icon-")));
			document.getElementById(event.target.id.replace(/label-/, "icon-")).style.display = "none";
		});
		
		var icon = document.createElement("i");
        icon.className = "fa fa-flag subTitleIcon";
        icon.setAttribute('style', "position:　relative; to p: 20px; left:10%; width: 40px" );
		icon.id = "icon-" + indices + "." + i;
		icon.style.display = "none";
		icon.draggable = true; 
		icon.onclick = (function(sub_indices){
			return function(){
			//console.log(currentIcon);
			iconMode = false;
			currentIcon.style.display = "none";
			var indices = Reveal.getIndices();
			var id = "label-" + indices.h + "." + indices.v;
			if (indices.f != undefined && indices.f >= 0) id = id + "." + (parseInt(indices.f)+1)+"."+sub_indices;
			else id = id + '.0.' + sub_indices;
			//console.debug(id);
			currentLabel = document.getElementById( id );
			//console.debug(currentLabel);
			if(subTitleTrigger)
			currentLabel.style.display = "block";
			}
		})(i);
		
		icon.addEventListener('dragstart',function(event){
			var dataTransfer = event.dataTransfer;
			dataTransfer.effectAllowed = "all";
		}
		);
		
		icon.addEventListener('dragend',function(event){
			event.preventDefault();
			var dataTransfer = event.dataTransfer;
			dataTransfer.dropEffect = "move";
			var e = event || window.event;
			var iconStyleString = "position:fixed; to p: 20px; left:"+e.clientX+"px; top:"+e.clientY+"px; width: 40px";
			var labelStyleString = "position:fixed; to p: 20px; left:"+e.clientX+"px; top:"+e.clientY+"px; width: 80%";
			Px = e.clientX;
			Py = e.clientY;
			document.getElementById(event.target.id).setAttribute('style', iconStyleString );
			document.getElementById(event.target.id).style.zIndex="1000";
			document.getElementById(event.target.id.replace(/icon-/, "label-")).setAttribute('style', labelStyleString );
			document.getElementById(event.target.id.replace(/icon-/, "label-")).style.zIndex="1000";
			document.querySelector( ".reveal" ).appendChild(document.getElementById(event.target.id));
			document.querySelector( ".reveal" ).appendChild(document.getElementById(event.target.id.replace(/icon-/, "label-")));
			document.getElementById(event.target.id.replace(/icon-/, "label-")).style.display = "none";
		});
		
		
		//console.log(subtitle);
		if(i < subtitleArray.length){
			if(subtitleArray[i].trim() == ""){
				//labelElement.innerText = textArray[i].trim().split(" ")[0];
				labelElement.innerText = textArray[i].trim();
			}
			else{
				labelElement.innerText = subtitleArray[i].trim();
			}
			
		}
		else{
			//labelElement.innerText = textArray[i].trim().split(" ")[0];
			labelElement.innerText = textArray[i].trim();
		}
		
		
		
		
		if ( videoElement ) {
			// connect play, pause, volumechange, mute, timeupdate events to video
			if ( videoElement.duration ) {
				linkVideoToAudioControls( audioElement, videoElement );
			}
			else {
				videoElement.onloadedmetadata = function() {
					linkVideoToAudioControls( audioElement, videoElement );	
				};
			}
		}
		
		audioElement.addEventListener( 'ended', (function( event,i,length ) {
			return function(event){
			if ( typeof Recorder == 'undefined' || !Recorder.isRecording ) {
				var previousAudio = currentAudio;
				if(i + 1 > length - 1){
					Reveal.next();
					selectAudio( previousAudio,0);
					//selectLabel(0);
					if(iconMode){
						selectIcon(0);
					}
					else{
						selectLabel(0);
					}

				}
				else{
					selectAudio( previousAudio,i+1);
					//selectLabel(i+1);
					if(iconMode){
						selectIcon(i+1);
					}
					else{
						selectLabel(i+1);
					}
				}
				
			}
			}
		})(event,i,textArray.length) )
		;
		audioElement.addEventListener( 'play', (function( event,i,name) {
			return function(event){
							// preload next audio element so that it is available after slide change
			var indices = Reveal.getIndices();	
			var nextId = "audioplayer-" + indices.h + '.' + indices.v;	
            //console.log(indices.f);			
			if ( indices.f != undefined && indices.f >= 0 ) {
				nextId = nextId + '.' + (indices.f + 2)+".0";
			}
			else {
				nextId = nextId + '.1.0';
			}
			var nextAudio = document.getElementById( nextId );
			if ( !nextAudio ) {
				nextId = "audioplayer-" + indices.h + '.' + (indices.v+1)+".0.0";
				nextAudio = document.getElementById( nextId );			
				if ( !nextAudio ) {
					nextId = "audioplayer-" + (indices.h+1) + '.0.0.0';
					nextAudio = document.getElementById( nextId );
				}			
			}
			//console.log(nextAudio);
			if ( nextAudio ) {
//console.debug( "Preload: " + nextAudio.id );
				nextAudio.load();		
			}
			
			
		   if ( textToSpeechURL != null && text != null && autoDownLoadAudio) {
            var content = textToSpeechURL + encodeURIComponent(text);
			var aLink = document.createElement('a');
			var blob = new Blob([content]);
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent("click");
            aLink.href = URL.createObjectURL(blob);
			aLink.download = name+"."+i+".ogg";
			aLink.dispatchEvent(evt);
		   }
				
			}
			
		} )(event,i,indices));
		

		if ( textToSpeechURL != null && text != null ) {
			var audioSource = document.createElement( 'source' );
			audioSource.src = textToSpeechURL + encodeURIComponent(textArray[i]);
			audioElement.insertBefore(audioSource, audioElement.firstChild);
		}

		if ( audioFile != null ) {
			// Support comma separated lists of audio sources
			audioFile.split( ',' ).forEach( function( source ) {						
				var audioSource = document.createElement( 'source' );
				audioSource.src = source;
				audioElement.insertBefore(audioSource, audioElement.firstChild);
			} );
		}
		else {
			var audioSource = document.createElement( 'source' );
			audioSource.src = prefix + indices+"."+i + suffix;
			audioElement.insertBefore(audioSource, audioElement.firstChild);
		}	
		if ( !videoElement ) {
			// only add silence if no videoElement defines the minimum duration
			var sourceOfSilence= document.createElement( 'source' );
			sourceOfSilence.src= silence.dataURI;
			audioElement.appendChild( sourceOfSilence ); // use this if audio file does not exist
		}
		container.appendChild( audioElement );
		container.appendChild( labelElement );
		container.appendChild( icon );
      }
	}

})();

/*****************************************************************
** Create SilentAudio 
** based on: RIFFWAVE.js v0.03
** http://www.codebase.es/riffwave/riffwave.js 
**
** Usage: 
** silence = new SilentAudio( 10 ); // create 10 seconds wave file
**
******************************************************************/

var FastBase64={chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encLookup:[],Init:function(){for(var e=0;4096>e;e++)this.encLookup[e]=this.chars[e>>6]+this.chars[63&e]},Encode:function(e){for(var h=e.length,a="",t=0;h>2;)n=e[t]<<16|e[t+1]<<8|e[t+2],a+=this.encLookup[n>>12]+this.encLookup[4095&n],h-=3,t+=3;if(h>0){var s=(252&e[t])>>2,i=(3&e[t])<<4;if(h>1&&(i|=(240&e[++t])>>4),a+=this.chars[s],a+=this.chars[i],2==h){var r=(15&e[t++])<<2;r|=(192&e[t])>>6,a+=this.chars[r]}1==h&&(a+="="),a+="="}return a}};FastBase64.Init();var SilentAudio=function(e){function h(e){return[255&e,e>>8&255,e>>16&255,e>>24&255]}function a(e){return[255&e,e>>8&255]}function t(e){for(var h=[],a=0,t=e.length,s=0;t>s;s++)h[a++]=255&e[s],h[a++]=e[s]>>8&255;return h}this.data=[],this.wav=[],this.dataURI="",this.header={chunkId:[82,73,70,70],chunkSize:0,format:[87,65,86,69],subChunk1Id:[102,109,116,32],subChunk1Size:16,audioFormat:1,numChannels:1,sampleRate:8e3,byteRate:0,blockAlign:0,bitsPerSample:8,subChunk2Id:[100,97,116,97],subChunk2Size:0},this.Make=function(e){for(var s=0;s<e*this.header.sampleRate;s++)this.data[s]=127;this.header.blockAlign=this.header.numChannels*this.header.bitsPerSample>>3,this.header.byteRate=this.header.blockAlign*this.sampleRate,this.header.subChunk2Size=this.data.length*(this.header.bitsPerSample>>3),this.header.chunkSize=36+this.header.subChunk2Size,this.wav=this.header.chunkId.concat(h(this.header.chunkSize),this.header.format,this.header.subChunk1Id,h(this.header.subChunk1Size),a(this.header.audioFormat),a(this.header.numChannels),h(this.header.sampleRate),h(this.header.byteRate),a(this.header.blockAlign),a(this.header.bitsPerSample),this.header.subChunk2Id,h(this.header.subChunk2Size),16==this.header.bitsPerSample?t(this.data):this.data),this.dataURI="data:audio/wav;base64,"+FastBase64.Encode(this.wav)},this.Make(e)};
