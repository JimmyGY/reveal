
var RevealSubtitles = window.RevealSubtitles || (function(){

    var regionProportion = 0.15;
    var defaultSubtitle = "Input subtitle here";
    var defaultAudioText = "Input audio text here";
    var fontSize = 20;
    var editLabelFontSize = 15;
    var fontFamily = "Times New Roman";
    var currentSubtitle;

    var mode = 'general';
    var show = true;

    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "../reveal.js/plugin/subtitles/style.css";
    document.head.appendChild(css);

	Reveal.addEventListener( 'ready', function( event ) {
		setup();
		console.debug("ready");
		selectSubtitle();

	} );

	Reveal.addEventListener( 'fragmentshown', function( event ) {
		console.debug("fragmentshown");
		selectSubtitle();
	} );

	Reveal.addEventListener( 'fragmenthidden', function( event ) {
		console.debug("fragmenthidden");
		selectSubtitle();
	} );

	Reveal.addEventListener( 'slidechanged', function( event ) {
		console.debug("slidechanaged");
		selectSubtitle();
	} );

	Reveal.addEventListener('changeFontSize', function(event) {
		fontSize = fontSize + event.size;
        //document.getElementById("fontButton").setAttribute('style', "position: fixed; left: 0%; top: 10%;font-size:" + fontSize + "px;");
        content = document.getElementsByName("subtitleElement");
        for (i = 0; i < content.length; i++) {
            content[i].style.fontSize = fontSize+"px";
            content[i].style.display = "None";
        }
        currentSubtitle.style.display = "block";
	});

	Reveal.addEventListener('showSubtitle', function(event) {
		show = !show;
		if (!show) {
			document.querySelector(".reveal").setAttribute('style', "width:100%; left : 0px; height: 100%;");
			var subTitleRegion = document.getElementById("subTitleRegion");
			subTitleRegion.style.visibility = "hidden";
			currentSubtitle.style.visibility  = "hidden";
			

		} else {
			document.querySelector(".reveal").setAttribute('style', "width:100%; left : 0px; height: " + 100 * (1 - regionProportion) + "%;");
			var subTitleRegion = document.getElementById("subTitleRegion");
			subTitleRegion.style.visibility = "visible";
			currentSubtitle.style.visibility = "visible";
			

		}
	});
	function setup() {
		var config = Reveal.getConfig().subtitles;
		if (config) {
			if (config.regionProportion) {
				regionProportion = config.regionProportion;
			}
			if (config.defaultSubtitle) defaultSubtitle = config.defaultSubtitle;
			if (config.defaultAudioText) defaultAudioText = config.defaultAudioText;
			if (config.show) show = config.show;
			if (config.fontSize) fontSize = config.fontSize;
			if (config.fontFamily) fontFamily = config.fontFamily;
			if (config.editLabelFontSize) editLabelFontSize = config.editLabelFontSize;
			if (config.mode) mode = config.mode;
		}

		//change slides height
        document.querySelector(".reveal").setAttribute('style', "width:100%; left : 0px; height:" + (1 - regionProportion) * 100 + "%;");
        
        //subtitle region
		var subTitleRegion = document.getElementById("subTitleRegion");
        if (subTitleRegion == null) {
            subTitleRegion = document.createElement('div');
            
            subTitleRegion.id = "subTitleRegion";
            subTitleRegion.setAttribute('style', "position: fixed;  z-index: 10;top:" + (1 - regionProportion) * 100 + "%;bottom:0px; left:0px; right:0px;");
            subTitleRegion.style.display = "block";
            //subTitleRegion.appendChild(subTitleFrame)
        }
        document.body.appendChild(subTitleRegion);

        //subtitle mode button
        var modeBtn = document.createElement("i");
        modeBtn.className = "subtitles-mode-btn fa fa-retweet";
        modeBtn.setAttribute('style', "position: absolute; right:8%; bottom:10px;");
        modeBtn.addEventListener('click', function(event) {
			changeAllMode();
		});
        subTitleRegion.appendChild(modeBtn);

        // create audio players for all slides
		var horizontalSlides = document.querySelectorAll( '.reveal .slides>section' );
		for( var h = 0, len1 = horizontalSlides.length; h < len1; h++ ) {
			var verticalSlides = horizontalSlides[ h ].querySelectorAll( 'section' );
			if ( !verticalSlides.length ) {
				setupAllSubtitleElements( subTitleRegion, h, 0, horizontalSlides[ h ] );
			}
			else {
				for( var v = 0, len2 = verticalSlides.length; v < len2; v++ ) {
					setupAllSubtitleElements( subTitleRegion, h, v, verticalSlides[ v ] );
				}
			}
		}
	}

	function setupAllSubtitleElements(container, h, v, slide) {

		var subtitle = defaultSubtitle;
		var audiotext = defaultAudioText;
		
		if ( slide.hasAttribute( 'data-audio-subtitle' ) ) {
			subtitle = slide.getAttribute( 'data-audio-subtitle' );
		}

		if ( slide.hasAttribute( 'data-audio-text' ) ) {
			audiotext = slide.getAttribute( 'data-audio-text' );
		}

		setupSubtitleElement( container, h + '.' + v + '.0', subtitle, audiotext);
		var i = 0;
		var  fragments;
		while ( (fragments = slide.querySelectorAll( '.fragment[data-fragment-index="' + i +'"]' )).length > 0 ) {
			var subtitle = defaultSubtitle;
			var audiotext = defaultAudioText;
			for( var f = 0, len = fragments.length; f < len; f++ ) {
				if ( fragments[ f ].hasAttribute( 'data-audio-subtitle' ) ) {
					subtitle = fragments[ f ].getAttribute( 'data-audio-subtitle' );
					audiotext = fragments[ f ].getAttribute( 'data-audio-text' );
				}
			}
//console.log( h + '.' + v + '.' + i  + ": >" + text +"<")
			i++;
			setupSubtitleElement( container, h + '.' + v + '.' + i, subtitle, audiotext);
			
		}
	}

	function setupSubtitleElement(container, indices, subtitle, audiotext) {
		var subtitleElement = document.createElement("div");
		subtitleElement.className = "subtitleElement";
		subtitleElement.setAttribute('style', "position: fixed; font-size:"+ fontSize +"px ; font-family: "+ fontFamily +"; left:8%; right: 8%; height: " + container.offsetHeight + "px; width : 80%;");
        subtitleElement.id = "subtitle-" + indices + ".0";
        
        subtitleElement.className = "subtitleElement";
        subtitleElement.style.display = "none";
        //subtitleElement.style.zIndex = "1000";
        //subtitleElement.draggable = true;
        subtitleElement.setAttribute("name", "subtitleElement");

        
     	var subtitleContent = document.createElement('div');
     	subtitleContent.className = "subtitle-content-div";
     	subtitleContent.setAttribute('style', "position: relative ; z-index = 1000; left: 10px; top : 10px; overflow: auto; height: " + (container.offsetHeight - 20) + "px; width : 100%;");            
     	subtitleContent.innerText = subtitle;
     	subtitleElement.appendChild(subtitleContent);

        var subtitleEditElement = document.createElement("div");
        subtitleEditElement.className = "subtitle-edit-row";
        var subtitleEditCol1 = document.createElement('div');
        subtitleEditCol1.className = "subtitle-edit-col";
        var subtitleEditCol2 = document.createElement('div');
        subtitleEditCol2.className = "subtitle-edit-col";
        var labelEditText = document.createElement('label');
        labelEditText.className = "subtitle-edit-label";
        labelEditText.innerHTML = "Audio Text";
        labelEditText.style.fontSize = editLabelFontSize + "px";
        var textEditArea = document.createElement('textarea');
        textEditArea.innerText = audiotext;
        var labelEditSubtitle = document.createElement('label');
        labelEditSubtitle.className = "subtitle-edit-label";
        labelEditSubtitle.innerHTML = "Subtitle";
        labelEditSubtitle.style.fontSize = editLabelFontSize + "px";
        var subtitleEditArea = document.createElement('textarea');
        subtitleEditArea.innerText = subtitle;

        subtitleEditCol1.appendChild(labelEditSubtitle);
        subtitleEditCol1.appendChild(subtitleEditArea);
        subtitleEditCol2.appendChild(labelEditText);
        subtitleEditCol2.appendChild(textEditArea);

        subtitleEditElement.appendChild(subtitleEditCol1);
        subtitleEditElement.appendChild(subtitleEditCol2);

        subtitleElement.appendChild(subtitleEditElement);

	    if (mode == 'general') {
        	subtitleContent.style.display = "block";
        	subtitleEditElement.style.display = "none";
	    } else if (mode == 'edit') {
	    	subtitleContent.style.display = "none";
        	subtitleEditElement.style.display = "block";
	    } else {
	    	subtitleContent.style.display = "none";
        	subtitleEditElement.style.display = "none";
	    	console.error("Subtitle Invalid mode.");
	    }
		container.appendChild( subtitleElement );
	}

	function selectSubtitle() {
        if (currentSubtitle) {
            currentSubtitle.style.display = "none";
        }
        var indices = Reveal.getIndices();
        var id = "subtitle-" + indices.h + "." + indices.v;
        if (indices.f != undefined && indices.f >= 0) id = id + "." + (parseInt(indices.f) + 1) + ".0";
        else id = id + '.0.0';

        currentSubtitle = document.getElementById(id);
        var subtitleContent, subtitleEditElement;

		subtitleContent = currentSubtitle.querySelector(".subtitle-content-div");
		subtitleEditElement = currentSubtitle.querySelector(".subtitle-edit-row");

		if(show){
			currentSubtitle.style.display = "block";
			currentSubtitle.style.visibility = "visible";
			if (mode == 'general') {
	        	subtitleContent.style.display = "block";
	        	subtitleEditElement.style.display = "none";
		    } else if (mode == 'edit') {
		    	subtitleContent.style.display = "none";
	        	subtitleEditElement.style.display = "block";
		    } else {
		    	subtitleContent.style.display = "none";
	        	subtitleEditElement.style.display = "none";
		    	console.error("Subtitle Invalid mode.");
		    }
		}
		else{
			currentSubtitle.style.visibility = "hidden";
		}
	}

	function changeAllMode() {
		var allSubtitleElements = document.querySelectorAll(".subtitleElement");
		var subtitleElement, subtitleContent, subtitleEditElement;
		for (var i = 0, len = allSubtitleElements.length; i < len; i++ ) {
			subtitleElement = allSubtitleElements[i];
			subtitleContent = subtitleElement.querySelector(".subtitle-content-div");
			subtitleEditElement = subtitleElement.querySelector(".subtitle-edit-row");
			changeMode(subtitleContent, subtitleEditElement);
		}
		if (mode == 'general') {
			mode = 'edit';
		} else if (mode == 'edit') {
			mode = 'general';
		} else {
			console.error('Invalid mode.');
		}

	}

	function changeMode(subtitleContent, subtitleEditElement) {
		if (mode == 'general') {
			
			//console.debug("after mode general: "+ mode);
        	subtitleContent.style.display = "none";
        	subtitleEditElement.style.display = "block";
	    } else if (mode == 'edit') {
	    	

			//console.debug("after mode edit: "+ mode);

	    	subtitleContent.style.display = "block";
        	subtitleEditElement.style.display = "none";
	    } else {
	    	subtitleContent.style.display = "none";
        	subtitleEditElement.style.display = "none";
	    	console.error("Subtitle Invalid mode, cannot change mode.");
	    }

	}

})();