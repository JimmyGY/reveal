var RevealReader = window.RevealReader || (function(){
	
	var rate = 1;
	var pitch = 1;
	var volume = 1;
	var voice = 'UK English Female';
	var playerOpacity = 0.05;
    var defaultDuration = 5;
    var autoplay = false;
    var continousRecord = true;

    var silence;
    var currentAudio = null;
    var previousAudio = null;

    var playBtn;
    var recordBtn;
    var pauseResBtn;
    var stopBtn;
    var downloadBtn;

    var isPlay = true;

    Reveal.addEventListener( 'fragmentshown', function( event ) {
        selectReader();
    } );

    Reveal.addEventListener( 'fragmenthidden', function( event ) {
        selectReader();
    } );

    Reveal.addEventListener( 'ready', function( event ) {
        //setup();
//console.debug( "ready ");
        loadResource("../reveal.js/plugin/audio-slideshow-new/js/responsiveVoice.min.js", 'script', function(){
            setup();
            selectReader();

        });

                
    } );

    Reveal.addEventListener( 'slidechanged', function( event ) {
        //console.debug( "slidechanged ");
        var indices = Reveal.getIndices();
                
        selectReader();
    } );

    Reveal.addEventListener( 'paused', function( event ) {
        console.debug("paused");
        currentAudio.pause();

    } );

    Reveal.addEventListener( 'resumed', function( event ) {
        console.debug("resumed");
    } );

    Reveal.addEventListener( 'overviewshown', function( event ) {
        currentAudio.pause();
        document.querySelector(".audio-controls").style.visibility = "hidden";
    } );

    Reveal.addEventListener( 'overviewhidden', function( event ) {
        
        document.querySelector(".audio-controls").style.visibility = "visible";
    } );



    function selectReader( previousAudio ) {
        if ( currentAudio ) {
            currentAudio.pause();
            currentAudio.style.display = "none";
        }
        var indices = Reveal.getIndices();
        var id = "audioplayer-" + indices.h + '.' + indices.v;
        if ( indices.f != undefined && indices.f >= 0 ) {
            id = id + '.' + (indices.f+1);
        }
        else {
            id  = id + '.0';
        } 
        currentAudio = document.getElementById( id );
        if ( currentAudio ) {
            currentAudio.style.display = "block";
            if ( previousAudio ) {
                if ( currentAudio.id != previousAudio.id ) {
                    currentAudio.volume = previousAudio.volume;
                    currentAudio.muted = previousAudio.muted;
//console.debug( "Play " + currentAudio.id);
                    currentAudio.play();
                }
            }
            else if ( autoplay ) {
                currentAudio.play();
            }
        }
    }

	function setup() {
		var config = Reveal.getConfig().reader;
        if ( config ) {
            if ( config.voice ) voice = config.voice;
            if ( config.rate ) rate = config.rate;
            if (config.volume) volume = config.volume;
            if (config.pitch) pitch = config.pitch;

        }

        if ( 'ontouchstart' in window || navigator.msMaxTouchPoints ) {
            opacity = 1;        
        }
        
        // set style so that audio controls are shown on hover 
        var css='.audio-controls>audio { opacity:' + playerOpacity + ';} .audio-controls:hover>audio { opacity:1;}';
        style=document.createElement( 'style' );
        if ( style.styleSheet ) {
            style.styleSheet.cssText=css;
        }
        else { 
            style.appendChild( document.createTextNode( css ) );
        }       
        document.getElementsByTagName( 'head' )[0].appendChild( style );

        silence = new SilentAudio( defaultDuration ); //

        var divElement =  document.createElement( 'div' );
        divElement.className = "audio-controls";
        divElement.setAttribute( 'style', "width: 50%; height:75px; position: fixed; left: 25%; bottom: 104px;z-index: 33;" );

        playBtn = document.createElement("input");
        playBtn.id = "playButton";
        playBtn.setAttribute("type","button");
        playBtn.setAttribute("value", "Play TTS");
        playBtn.addEventListener('click', onPlayBtnClicked);

        recordBtn = document.createElement("input");
        recordBtn.id = "recordButton";
        recordBtn.setAttribute("type","button");
        recordBtn.setAttribute("value", "Record TTS");
        recordBtn.addEventListener('click', onRecordBtnClicked);

        pauseResBtn = document.createElement("input");
        pauseResBtn.id = "pauseResButton";
        pauseResBtn.setAttribute("type","button");
        pauseResBtn.setAttribute("value", "Pause");
        pauseResBtn.addEventListener('click', onPauseResumeClicked);
        pauseResBtn.disabled = true;

        stopBtn = document.createElement("input");
        stopBtn.id = "stopButton";
        stopBtn.setAttribute("type","button");
        stopBtn.setAttribute("value", "Stop");
        stopBtn.addEventListener('click', onStopBtnClicked);
        stopBtn.disabled = true;

        downloadBtn = document.createElement("input");
        downloadBtn.id = "downloadButton";
        downloadBtn.setAttribute("type","button");
        downloadBtn.setAttribute("value", "Download");
        downloadBtn.addEventListener('click', onDownloadBtnClicked);
        downloadBtn.disabled = true;
       

        divElement.appendChild(playBtn);
        divElement.appendChild(recordBtn);
        divElement.appendChild(pauseResBtn);
        divElement.appendChild(stopBtn);

        document.querySelector( ".reveal" ).appendChild( divElement );

        var horizontalSlides = document.querySelectorAll( '.reveal .slides>section' );
        for( var h = 0, len1 = horizontalSlides.length; h < len1; h++ ) {
            var verticalSlides = horizontalSlides[ h ].querySelectorAll( 'section' );
            if ( !verticalSlides.length ) {
                setupAllReaderElements( divElement, h, 0, horizontalSlides[ h ] );
            }
            else {
                for( var v = 0, len2 = verticalSlides.length; v < len2; v++ ) {
                    setupAllReaderElements( divElement, h, v, verticalSlides[ v ] );
                }
            }
        }

    }
	
    function setupAllReaderElements( container, h, v, slide) {
        setupReaderElement( container, h + '.' + v + '.0' );
        var i = 0;
        var  fragments;
        while ( (fragments = slide.querySelectorAll( '.fragment[data-fragment-index="' + i +'"]' )).length > 0 ) {
//console.log( h + '.' + v + '.' + i  + ": >" + text +"<")
            i++;
            setupReaderElement( container, h + '.' + v + '.' + i);
        }
    }

    function setupReaderElement( container, indices ) {
        var audioElement = document.createElement( 'audio' );
        audioElement.setAttribute( 'style', "position: relative; top: 20px; left: 10%; width: 80%;" );
        audioElement.id = "audioplayer-" + indices;
        audioElement.style.display = "none";
        audioElement.setAttribute( 'controls', '' );
        audioElement.setAttribute( 'preload', 'none' );

        audioElement.addEventListener( 'ended', function( event ) {
            if ( typeof Recorder == 'undefined' || !Recorder.isRecording ) {
                var previousAudio = currentAudio;
                Reveal.next();
                selectReader( previousAudio );
            }
        } );

        audioElement.addEventListener( 'play', function( event ) {

        } );

        audioElement.addEventListener( 'pause', function( event ) {
            
        } );

        audioElement.addEventListener( 'seeked', function( event ) {

        } );        


        var audioSource = document.createElement( 'source' );
        audioSource.src = "";
        audioElement.insertBefore(audioSource, audioElement.firstChild);

        container.appendChild(audioElement);

        
    }

    function setupFallbackAudio(audioElement) {
               
        if ( !audioElement.querySelector('source[data-audio-silent]') ) {
            // create silenet source if not yet existent
            var audioSource = document.createElement( 'source' );
            audioSource.src = silence.dataURI; 
            audioSource.setAttribute("data-audio-silent", defaultDuration);
            audioElement.appendChild(audioSource, audioElement.firstChild);
        }
    }

    function onPlayBtnClicked() {
        // start play
        isPlay = true;
        play();

        recordBtn.disabled = true;
        pauseResBtn.disabled = false;
        stopBtn.disabled = false;

    }

    function onRecordBtnClicked() {
        isPlay = false;
        record();

        playBtn.disabled = true;
        pauseResBtn.disabled = false;
        stopBtn.disabled = false;

    }

    function onPauseResumeClicked() {
        
        if (responsiveVoice.isPlaying() && pauseResBtn.value === "Pause") {
            responsiveVoice.pause();
            if (!isPlay) { 
                Recorder.pause();
            }

            pauseResBtn.value = "Resume";
            stopBtn.disabled = true;
        } else if (responsiveVoice.isPlaying() && pauseResBtn.value === "Resume") {
            if (!isPlay) {
                Recorder.resume();
            }

            responsiveVoice.resume();

            pauseResBtn.value = "Pause";
            stopBtn.disabled = false;
        } else {
            console.debug("playing error");
            // TODO reset
        }

        if (isPlay) {
            playBtn.disabled = true;
        } else {
            recordBtn.disabled = true;
        }
        pauseResBtn.disabled = false;
        
    }

    function onStopBtnClicked() {
        
        if (responsiveVoice.isPlaying()) {
            responsiveVoice.cancel();
            if (!isPlay) {
                Recorder.stop();
            }
        }

        playBtn.disabled = false;
        recordBtn.disabled = false;
        pauseResBtn.disabled = true;
        stopBtn.disabled = true;

        if (!isPlay) {
            downloadBtn.disabled = false;
        }

    }

    function onDownloadBtnClicked() {
        Recorder.downloadZip();
    }

	function record() {

		var audiotext = RevealSubtitles.getEditAudioText();

		Recorder.start();

		var parameters = {
            rate: rate,
            pitch: pitch,
            volume: volume,
            onstart: onRecordStart,
            onend: onRecordEnd
        };

		responsiveVoice.speak(audiotext, voice, parameters);
		//responsiveVoice.speak(audiotext);
	}

	function play() {
		var audiotext = RevealSubtitles.getEditAudioText();
        //console.debug(audiotext);
        var parameters = {
            rate: rate,
            pitch: pitch,
            volume: volume,
            onstart: onPlayStart,
            onend: onPlayEnd
        };

		responsiveVoice.speak(audiotext, voice, parameters);
	}

	function loadVoices(selectView) {
		var voicelist = responsiveVoice.getVoices();
		voicelist.forEach(function(item){
			var option = document.createElement("option");
			option.text = item.name;
			option.value = item.name;
			selectView.appendChild(option);
		});

	}

	function onRecordStart() {
		console.debug("onRecordStart");
	}

	function onRecordEnd() {
		console.debug("onRecordEnd");

        Recorder.stop();
        
        // Reveal.next();
        // selectReader();

        // record();
	}

    function onPlayStart() {

    }

    function onPlayEnd() {
        Reveal.next();
        play();
    }

	function setupLayout() {
        var voiceDiv = document.createElement("div");
        voiceDiv.id = "voicetestdiv";
        //var textarea = document.createElement("textarea");
        //textarea.id = "text";
        var selectVoice = document.createElement("select");
        selectVoice.id = "voiceselection";
        loadVoices(selectVoice);
        selectVoice.addEventListener('change', function(event){
        	voice = selectVoice.value;
        	console.debug(voice);
        });

        var linebreak = document.createElement("br");
        var playBtn = document.createElement("input");
        playBtn.id = "playbutton";
        playBtn.setAttribute("type","button");
        playBtn.setAttribute("value", "Play");
        playBtn.addEventListener('click', play);

        var stopBtn = document.createElement("input");
        stopBtn.id = "stopbutton";
        stopBtn.setAttribute("type","button");
        stopBtn.setAttribute("value", "Stop");
        stopBtn.addEventListener('click', stop);

        var recordBtn = document.createElement("input");
        recordBtn.id = "stopbutton";
        recordBtn.setAttribute("type","button");
        recordBtn.setAttribute("value", "Record");
        recordBtn.addEventListener('click', record);


        var rateLbl = document.createElement("label");
        rateLbl.setAttribute("for", "rate");
        rateLbl.innerText = "Rate";
        var rateRange = document.createElement("input");
        rateRange.id = "rate_slider";
        rateRange.setAttribute("type", "range");
        rateRange.setAttribute("min", "0.1");
        rateRange.setAttribute("max", "2");
        rateRange.setAttribute("value", "1");
        rateRange.setAttribute("step", "0.1");
        var rateInput = document.createElement("input");
        rateInput.id = "rate";
        rateInput.setAttribute("type", "text");
        rateInput.setAttribute("value", "1");
        rateInput.setAttribute("size", "5");
        rateRange.addEventListener('change', function(event){
        	rateInput.value = rateRange.value;
        	rate = rateInput.value;
        });


        var pitchLbl = document.createElement("label");
        pitchLbl.setAttribute("for", "pitch");
        pitchLbl.innerText = "Pitch";
        var pitchRange = document.createElement("input");
        pitchRange.id = "pitch_slider";
        pitchRange.setAttribute("type", "range");
        pitchRange.setAttribute("min", "0.1");
        pitchRange.setAttribute("max", "2");
        pitchRange.setAttribute("value", "1");
        pitchRange.setAttribute("step", "0.1");
        var pitchInput = document.createElement("input");
        pitchInput.id = "pitch";
        pitchInput.setAttribute("type", "text");
        pitchInput.setAttribute("value", "1");
        pitchInput.setAttribute("size", "5");
        pitchRange.addEventListener('change', function(event){
        	pitchInput.value = pitchRange.value;
        	pitch = pitchInput.value;
        });

        var volLbl = document.createElement("label");
        volLbl.setAttribute("for", "volume");
        volLbl.innerText = "Volume";
        var volRange = document.createElement("input");
        volRange.id = "volume_slider";
        volRange.setAttribute("type", "range");
        volRange.setAttribute("min", "0.1");
        volRange.setAttribute("max", "2");
        volRange.setAttribute("value", "1");
        volRange.setAttribute("step", "0.1");
        var volInput = document.createElement("input");
        volInput.id = "volumn";
        volInput.setAttribute("type", "text");
        volInput.setAttribute("value", "1");
        volInput.setAttribute("size", "5");
        volRange.addEventListener('change', function(event){
        	volInput.value = volRange.value;
        	volume = volInput.value;
        });


        //voiceDiv.appendChild(textarea);
        voiceDiv.appendChild(selectVoice);
        voiceDiv.appendChild(linebreak);
        voiceDiv.appendChild(playBtn);
        voiceDiv.appendChild(stopBtn);
        voiceDiv.appendChild(recordBtn);
		voiceDiv.appendChild(rateLbl);
		voiceDiv.appendChild(rateRange);
		voiceDiv.appendChild(rateInput);
		voiceDiv.appendChild(pitchLbl);
		voiceDiv.appendChild(pitchRange);
		voiceDiv.appendChild(pitchInput);
		voiceDiv.appendChild(volLbl);
		voiceDiv.appendChild(volRange);
		voiceDiv.appendChild(volInput);

        voiceDiv.setAttribute('style', "position: fixed; left:8%; bottom:124px; font-size:24px; z-index:33");
		document.querySelector( ".reveal" ).appendChild( voiceDiv );
	}


	function loadResource( url, type, callback ) {
		var head = document.querySelector( 'head' );
		var resource;

		if ( type === 'script' ) {
			resource = document.createElement( 'script' );
			resource.type = 'text/javascript';
			resource.src = url;
		}
		else if ( type === 'stylesheet' ) {
			resource = document.createElement( 'link' );
			resource.rel = 'stylesheet';
			resource.href = url;
		}

		// Wrapper for callback to make sure it only fires once
		var finish = function() {
			if( typeof callback === 'function' ) {
				callback.call();
				callback = null;
			}
		}

		resource.onload = finish;

		// IE
		resource.onreadystatechange = function() {
			if ( this.readyState === 'loaded' ) {
				finish();
			}
		}

		// Normal browsers
		head.appendChild( resource );
	}
})();