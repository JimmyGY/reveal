var RevealReader = window.RevealReader || (function(){
	
	
	var rate = 1,
	pitch = 1,
	volume = 1,
	voice = 'UK English Female';
	

	loadResource("../reveal.js/plugin/audio-slideshow-new/js/responsiveVoice.min.js", 'script', function(){
		// console.log("responsiveVoice loaded");
		// loadResource("../reveal.js/plugin/audio-slideshow-new/js/reader.js", 'script', function() {
		// 	console.log("reader.js loaded");
		setupLayout();
	});

	Reveal.addEventListener( 'ready', function( event ) {
		//setup();
		// loadResource("../reveal.js/plugin/audio-slideshow-new/js/jquery-2.1.4.min.js", 'script', function(){
		// loadResource("../reveal.js/plugin/audio-slideshow-new/js/responsiveVoice.min.js", 'script', function(){
		// // console.log("responsiveVoice loaded");
		// // loadResource("../reveal.js/plugin/audio-slideshow-new/js/reader.js", 'script', function() {
		// // 	console.log("reader.js loaded");
		// });
		// });
		// });
		console.debug("ready");

	} );

	function setup() {
		var config = Reveal.getConfig().reader;

		//setupLayout();

		var speakBtn = document.createElement("i");
        speakBtn.className = "subtitles-mode-btn fa fa-file-audio-o";
        speakBtn.setAttribute('style', "position: fixed; left:8%; bottom:124px; font-size:24px; z-index:33");
        speakBtn.addEventListener('click', record);
		document.querySelector( ".reveal" ).appendChild( speakBtn );

		// var recordBtn = document.createElement("i");
  //       recordBtn.className = "subtitles-mode-btn fa fa-bullhorn";
  //       recordBtn.setAttribute('style', "position: fixed; left:8%; bottom:150px; font-size:24px; z-index:33");
  //       recordBtn.addEventListener('click', read());
		// document.querySelector( ".reveal" ).appendChild( speakBtn );
	}

	function record() {

		var audiotext = RevealSubtitles.getEditAudioText();

		Recorder.toggleRecording();

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
            volume: volume
        };

		responsiveVoice.speak(audiotext, voice, parameters);
	}

	function stop() {
		responsiveVoice.cancel();
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
		Recorder.toggleRecording();
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