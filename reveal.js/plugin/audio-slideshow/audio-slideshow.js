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
(function() {
    // default parameters
    var prefix = "audio/";
    var suffix = ".m4a";
    var downloadSuffix = ".ogg";
    var textToSpeechURL = "https://api.voicerss.org/?key=b2864547cd194e81afdb90f2a0dbe5a6&c=ogg&f=44khz_16bit_mono&r=1&hl=en-us&src="
        // var textToSpeechURL = "http://translate.google.com/translate_tts?ie=UTF-8&tl=en-us&client=t&total=1&idx=0&q="; // the text to speech converter
    var defaultDuration = 5; // value in seconds
    var playerOpacity = .05; // opacity when the mouse is far from to the audioplayer
    var startAtFragment = false; // when moving to a slide start at the current fragment or at the start of the slide
    var autoDownLoadAudio = false;
    //var separator = ".";
    separator = "!@#$%";

    // ------------------
    var fontSize = 25;
    var silence;
    var paging = true;
    var currentAudio = null;
    var previousAudio = null;
    var currentLabel = null;

    var js = document.createElement("link");
    js.rel = "stylesheet";
    js.href = "../css/font-awesome.min.css";
    document.head.appendChild(js);

    var js = document.createElement("link");
    js.rel = "stylesheet";
    js.href = "../css/switch.css";
    document.head.appendChild(js);

    var Px;
    var py;
    var MouseStartX;
    var MouseStartY;
    var startHeight;
    var startWidth;
    var contentStartHeight;
    var contentStartWidth;

    var labelPos = {};
    var subTitleWidth = document.querySelector(".reveal").offsetWidth * 0.5;
    var subTitleRegionProportion = 0.15;
    var subTitleRegionWidth = document.querySelector(".reveal").offsetHeight * subTitleRegionProportion;
    var myCirclePlayer;
    var hoverStyle;
    var hoverResizeStyle;

    var show = true;
    var dragRegion = true;
	
	var dataTransferx;
    var dataTransfery;
    var dataTransferMouseX;
    var dataTransferMouseY;

    Reveal.addEventListener('fragmentshown', function(event) {
        if (!event.subTitle) {
            selectAudio(undefined, 0);
            selectLabel(0);
        }
    });

    Reveal.addEventListener('fragmenthidden', function(event) {
        console.debug("fragmenthidden ");
        if (!event.subTitle) {
            selectAudio(undefined, 0);
            selectLabel(0);
        }
    });

    Reveal.addEventListener('ready', function(event) {
        setup();
        selectAudio(undefined, 0);
        selectLabel(0);
    });

    Reveal.addEventListener('slidechanged', function(event) {
        var indices = Reveal.getIndices();
        if (!startAtFragment && typeof indices.f !== 'undefined' && indices.f > 0) {
            // hide fragments when slide is shown
            Reveal.slide(indices.h, indices.v, -1);
        }
        if (!event.subTitle) {
            selectAudio(undefined, 0);
            selectLabel(0);

        }
    });

    Reveal.addEventListener('paused', function(event) {
        currentAudio.pause();
    });

    Reveal.addEventListener('resumed', function(event) {});

    Reveal.addEventListener('overviewshown', function(event) {
        myCirclePlayer.pause();
        document.getElementById("cp_container_1").style.visibility = "hidden";
        currentLabel.style.display = "none";
    });

    Reveal.addEventListener('overviewhidden', function(event) {
        document.getElementById("cp_container_1").style.visibility = "visible";
        currentLabel.style.display = "block"
    });

    Reveal.addEventListener('menuAudioSelected', function(event) {
        var previousAudio = currentAudio;
        if (currentAudio) {
            //currentAudio.pause();
            //currentAudio.style.display = "none";
            myCirclePlayer.pause();
        }

        var h = event.indexh,
            v = event.indexv,
            f = event.indexf,
            s = event.indexs;
        // change audio
        var audio_id = "audioplayer-" + h + '.' + v;
        if (f != undefined && f >= 0) audio_id = audio_id + '.' + (f + 1) + '.' + s;
        else audio_id = audio_id + '.0.' + s;

        currentAudio = document.getElementById(audio_id);

        //currentAudio.style.display = "block";
        /*if (previousAudio && currentAudio.id != previousAudio.id) {
            currentAudio.volume = previousAudio.volume;
            currentAudio.muted = previousAudio.muted;
            //console.debug( "Play " + currentAudio.id);
            //currentAudio.play();
        }*/
        if (!myCirclePlayer) {
            myCirclePlayer = new CirclePlayer("#jquery_jplayer_1", {

            }, {
                cssSelectorAncestor: "#cp_container_1"
            });

            myCirclePlayer.player.bind(jQuery.jPlayer.event.play, function(event) {
                console.debug("play");
                currentAudio.dispatchEvent(new Event('play'));
            });

            myCirclePlayer.player.bind(jQuery.jPlayer.event.ended, function(event) {
                currentAudio.dispatchEvent(new Event('ended'));
            });
        }

        if (currentAudio) {
            /*jQuery("#jquery_jplayer_1").jPlayer("setMedia", {
                oga: currentAudio.childNodes[0].src
            });*/
            myCirclePlayer.setMedia({
                //oga: currentAudio.childNodes[0].src
				//oga: currentAudio.childNodes[1].src
                m4a: currentAudio.childNodes[0].src
            });
        }
        if (currentLabel) {
            currentLabel.style.display = "none";
        }
        var indices = Reveal.getIndices();
		var label_id = "label-" + h + "." + v;
		if (f != undefined && f >= 0) label_id = label_id + "." + (f + 1) + "." + s;
		else label_id = label_id + '.0.' + s;
		currentLabel = document.getElementById(label_id);
		currentLabel.style.display = "block";
		if (labelPos.x != undefined) {
			setLocation(label_id, labelPos);
		}
    });

	Reveal.addEventListener('showSubtitle', function(event) {
		show = !show;
		if (!show) {
			if(paging){
				document.querySelector(".reveal").setAttribute('style', "width:100%; left : 0px; height: 100%;");
				var subTitleRegion = document.getElementById("subTitleRegion");
				subTitleRegion.style.visibility = "hidden";
				currentLabel.style.visibility  = "hidden";
			}
			else{
				currentLabel.style.visibility  = "hidden";
			}

		} else {
			if(paging){
					document.querySelector(".reveal").setAttribute('style', "width:100%; left : 0px; height: " + 100 * (1 - subTitleRegionProportion) + "%;");
					var subTitleRegion = document.getElementById("subTitleRegion");
					subTitleRegion.style.visibility = "visible";
					currentLabel.style.visibility = "visible";
			}
			else{
				currentLabel.style.visibility = "visible";
			}

		}
	});
	
	Reveal.addEventListener('changeFontSize', function(event) {
		fontSize = fontSize + event.size;
        //document.getElementById("fontButton").setAttribute('style', "position: fixed; left: 0%; top: 10%;font-size:" + fontSize + "px;");
        content = document.getElementsByName("subtitleDiv");
        for (i = 0; i < content.length; i++) {
            content[i].style.fontSize = fontSize+"px";
            content[i].style.display = "None";
        }
        currentLabel.style.display = "block";
	});
	
	Reveal.addEventListener('downloadAudio', function(event) {
		audioID = currentAudio.id;
        name = audioID.replace("audioplayer-", "") + downloadSuffix;
        if (currentAudio != null) {
            for (var i = 0; i < currentAudio.childNodes.length; i++) {
                if (currentAudio.childNodes[i].name == "audio-src-online") {
                    var content = currentAudio.childNodes[i].src;
                    
                    

                     fetch(content).then(function(resp){
                             return resp.blob();
                         }).then(function(blob){
                             var a = document.createElement('a');
                              var url = window.URL.createObjectURL(blob);
                              var filename = name;
                              a.href = url;
                              a.download = filename;
                              a.click();
                              window.URL.revokeObjectURL(url);
                         });
                }
            }
        }
	});
	
    function selectAudio(previousAudio, sub_indices) {
        if (currentAudio) {
            //currentAudio.pause();
            myCirclePlayer.pause();
            currentAudio.style.display = "none";
        }
        var indices = Reveal.getIndices();
        var id = "audioplayer-" + indices.h + '.' + indices.v;
        if (indices.f != undefined && indices.f >= 0) id = id + '.' + (parseInt(indices.f) + 1) + '.' + sub_indices;
        else id = id + '.0.' + sub_indices;
        //console.log(id);
        currentAudio = document.getElementById(id);
        //console.log(currentAudio);
        //currentAudio.style.display = "block";
        //var volume;

        if (!myCirclePlayer) {
            myCirclePlayer = new CirclePlayer("#jquery_jplayer_1", {

            }, {
                cssSelectorAncestor: "#cp_container_1"
            });
            //console.debug("circleplayer");
            myCirclePlayer.player.bind(jQuery.jPlayer.event.play, function(event) {
                console.debug('play');
                currentAudio.dispatchEvent(new Event('play'));

            });

            myCirclePlayer.player.bind(jQuery.jPlayer.event.ended, function(event) {
                currentAudio.dispatchEvent(new Event('ended'));
            });
        }

        if (currentAudio) {
            //jQuery("#jquery_jplayer_1").jPlayer({
            //	ready: function() {
            //		jQuery(this).jPlayer("setMedia", {
            //			oga: currentAudio.childNodes[0].src
            //		})
            //	},
            //	swfPath: "/js",
            //	supplied: "m4a, oga"
            //});
            myCirclePlayer.setMedia({
                /**
                    [0] for local audio, [1] for link
                **/
                //oga: currentAudio.childNodes[0].src
				//oga: currentAudio.childNodes[1].src
                //mp3: currentAudio.childNodes[1].src
                //wav: currentAudio.childNodes[1].src
                m4a: currentAudio.childNodes[0].src
                //m4a: "http://www.jplayer.org/audio/m4a/Miaow-07-Bubble.m4a",
            });

            if (previousAudio && currentAudio.id != previousAudio.id) {
                //currentAudio.volume = previousAudio.volume;
                //currentAudio.muted = previousAudio.muted;
                myCirclePlayer.play();
            }
        }
    }

    function selectLabel(sub_indices) {
        if (currentLabel) {
            currentLabel.style.display = "none";
        }
        var indices = Reveal.getIndices();
        var id = "label-" + indices.h + "." + indices.v;
        if (indices.f != undefined && indices.f >= 0) id = id + "." + (parseInt(indices.f) + 1) + "." + sub_indices;
        else id = id + '.0.' + sub_indices;
        currentLabel = document.getElementById(id);
		currentLabel.style.display = "block";
		if(show){
			currentLabel.style.visibility = "visible";
		}
		else{
			currentLabel.style.visibility = "hidden";
		}
        
        if (labelPos.x != undefined) {
            setLocation(id, labelPos)
        }
    }

    function setLocation(labelId, labelPos) {
        if (!paging) {
            var labelStyleString = "position:fixed; font-size:" + fontSize + "px; z-index: 1000; font-family: 'Times New Roman'; background-color : #DDDDDD ; height: " + document.getElementById(labelId).offsetHeight + "px; left:" + labelPos.x + "px; top:" + labelPos.y + "px; width :" + document.getElementById(labelId).offsetWidth + "px;";
            //var labelStyleString = "position:absolute; font-size:" + fontSize + "px; z-index: 1000; font-family: 'Times New Roman'; background-color : #DDDDDD ; height: " + document.getElementById(labelId).offsetHeight + "px; left:" + labelPos.x + "px; top:" + labelPos.y + "px; width :" + document.getElementById(labelId).offsetWidth + "vh;";
            document.getElementById(labelId).setAttribute('style', labelStyleString);
            document.querySelector(".reveal").appendChild(document.getElementById(labelId));
			if(show){
				document.getElementById(labelId).style.visibility = "visible";
			}
			else{
				document.getElementById(labelId).style.visibility = "hidden";
			}
        } else {
            subTitleLayout(document.getElementById(labelId));
        }
    }

    function subTitleLayout(labelElement) {
        document.querySelector(".reveal").setAttribute('style', "width:100%; left : 0px; height:" + (1 - subTitleRegionProportion) * 100 + "%;");
        var subTitleRegion = document.getElementById("subTitleRegion");
        subTitleRegion.style.display = "block";
		if(show){
			subTitleRegion.style.visibility = "visible";
		}
		else{
			subTitleRegion.style.visibility = "hidden";
		}
        var labelStyleString = "position:fixed; z-index:1000;font-size:" + fontSize + "px;font-family: 'Times New Roman'; left:8%; right:8%; width :" + subTitleRegion.offsetWidth * 0.84 + "px; height: " + (subTitleRegion.offsetHeight) + "px;";
        //var labelStyleString = "position:absolute; font-size:" + fontSize + "px; z-index: 1000; font-family: 'Times New Roman'; background-color : #DDDDDD ; height: " + document.getElementById(labelId).offsetHeight + "px; left:" + labelPos.x + "px; top:" + labelPos.y + "px; width :" + document.getElementById(labelId).offsetWidth + "vh;";
        labelElement.setAttribute('style', labelStyleString);
        labelElement.childNodes[4].style.height = (subTitleRegion.offsetHeight - 20) + "px";
        labelElement.childNodes[4].style.width = (subTitleRegion.offsetWidth * 0.84 - 20) + "px";
        labelElement.childNodes[0].style.visibility = "hidden";
        labelElement.childNodes[1].style.visibility = "hidden";
        labelElement.childNodes[2].style.visibility = "hidden";
        labelElement.childNodes[3].style.visibility = "hidden";
        subTitleRegion.appendChild(labelElement);
		if(show){
			labelElement.style.visibility = "visible";
		}
		else{
			labelElement.style.visibility = "hidden";
		}
    };

    function subTitlePosition(Px, Py, labelId) {
        labelPos.x = Px;
        labelPos.y = Py;
        var proportion;
        if (paging) {
            proportion = 0;
        } else {
            proportion = subTitleRegionProportion;
        }
        if (Px < 0) {
            labelPos.x = 0;
        } else if (Px + document.getElementById(labelId).offsetWidth >= document.querySelector(".reveal").offsetWidth) {
            labelPos.x = document.querySelector(".reveal").offsetWidth - document.getElementById(labelId).offsetWidth;
        }
        if (Py < 0) {
            labelPos.y = 0;
        } else if (!paging && Py + document.getElementById(labelId).offsetHeight >= document.querySelector(".reveal").offsetHeight * (1 - proportion)) {
            subTitleLayout(document.getElementById(labelId));
            paging = true;
            return
        } else if (paging && Py + subTitleRegionWidth >= document.querySelector(".reveal").offsetHeight * (1 - proportion)) {
            subTitleLayout(document.getElementById(labelId));
            return;
        }

        var labelStyleString = "position:fixed; z-index:1000; font-size:" + fontSize + "px; font-family: 'Times New Roman'; background-color : #DDDDDD ; height:" + document.getElementById(labelId).offsetHeight + "px; left:" + labelPos.x + "px; top:" + labelPos.y + "px;width :" + document.getElementById(labelId).offsetWidth + "px;";
        //var labelStyleString = "position:absolute; font-size:" + fontSize + "px; z-index: 1000; font-family: 'Times New Roman'; background-color : #DDDDDD ; height: " + document.getElementById(labelId).offsetHeight + "px; left:" + labelPos.x + "px; top:" + labelPos.y + "px; width :" + document.getElementById(labelId).offsetWidth + "vh;";

        document.getElementById(labelId).setAttribute('style', labelStyleString);
        document.getElementById(labelId).childNodes[0].style.visibility = "visible";
        document.getElementById(labelId).childNodes[1].style.visibility = "visible";
        document.getElementById(labelId).childNodes[2].style.visibility = "visible";
        document.getElementById(labelId).childNodes[3].style.visibility = "visible";

        if (paging) {
            document.querySelector(".reveal").setAttribute('style', "height:100%; left : 0px; width: 100 %;");
            document.querySelector(".reveal").appendChild(document.getElementById(labelId));
            document.getElementById("subTitleRegion").style.visibility = "hidden";
            paging = false;
        }
    }

    function setup() {
        if (Reveal.getConfig().audioPrefix) prefix = Reveal.getConfig().audioPrefix;
        if (Reveal.getConfig().audioSuffix) suffix = Reveal.getConfig().audioSuffix;
        if (Reveal.getConfig().audioTextToSpeechURL) textToSpeechURL = Reveal.getConfig().audioTextToSpeechURL;
        if (Reveal.getConfig().audioDefaultDuration) defaultDuration = Reveal.getConfig().audioDefaultDuration;
        if (Reveal.getConfig().audioPlayerOpacity) playerOpacity = Reveal.getConfig().audioPlayerOpacity;
        if (Reveal.getConfig().separator) separator = Reveal.getConfig().separator;
        if (Reveal.getConfig().dragRegion) dragRegion = Reveal.getConfig().dragRegion;
        if (Reveal.getConfig().autoDownLoadAudio != undefined) autoDownLoadAudio = Reveal.getConfig().autoDownLoadAudio;
        if ('ontouchstart' in window || navigator.msMaxTouchPoints) {
            opacity = 1;
        }
        if (Reveal.getConfig().audioStartAtFragment) startAtFragment = Reveal.getConfig().audioStartAtFragment;
        // set style so that audio controls are shown on hover 
        var css = '.audio-controls>audio { opacity:' + playerOpacity + ';} .audio-controls:hover>audio { opacity:1;} .subTitleIcon{opacity:' + playerOpacity + ';} .subTitleIcon:hover {opacity:1;}';
        //var subTitleCss = '.subTitleContent { opacity:' + playerOpacity + ';} .subTitleContent:hover { opacity:1;}';
        var circleCss = '.cp-container { opacity:' + playerOpacity + ';} .cp-container:hover { opacity:1;}';
        hoverStyle = css + circleCss /*+ subTitleCss*/ ;
        hoverResizeStyle = css + circleCss;
        //css = css + circleCss + subTitleCss;
        style = document.createElement('style');
        style.id = "hover-style";
        if (style.styleSheet) {
            style.styleSheet.cssText = hoverStyle;
        } else {
            var text = document.createTextNode(hoverStyle);
            text.id = "hover-style-text"
            style.appendChild(text);
        }
        document.getElementsByTagName('head')[0].appendChild(style);

        silence = new SilentAudio(defaultDuration); // create the wave file

        var divElement = document.createElement('div');
        divElement.className = "audio-controls";
        divElement.setAttribute('style', "width: 50%; height:75px; position: fixed; left: 25%; bottom: 4px;z-index: 10;");
        document.querySelector(".reveal").appendChild(divElement);

        // create audio players for all slides
        var horizontalSlides = document.querySelectorAll('.reveal .slides>section');
        document.querySelector(".reveal").setAttribute('style', "width:100%; left : 0px; height:" + (1 - subTitleRegionProportion) * 100 + "%;");
        var subTitleRegion = document.getElementById("subTitleRegion");
        if (subTitleRegion == null) {
            subTitleRegion = document.createElement('div');
            subTitleRegion.id = "subTitleRegion";
            subTitleRegion.setAttribute('style', "position: fixed;  z-index: 10;top:" + (1 - subTitleRegionProportion) * 100 + "%;bottom:0px; left:0px; right:0px;");
        }
        document.body.appendChild(subTitleRegion);
        for (var h = 0, len1 = horizontalSlides.length; h < len1; h++) {
            var verticalSlides = horizontalSlides[h].querySelectorAll('section');
            if (!verticalSlides.length) {
                setupAllAudioElements(divElement, h, 0, horizontalSlides[h]);
            } else {
                for (var v = 0, len2 = verticalSlides.length; v < len2; v++) {
                    setupAllAudioElements(divElement, h, v, verticalSlides[v]);
                }
            }
        }
    }

    function setupAllAudioElements(container, h, v, slide) {
        setupAudioElement(container, h + '.' + v + ".0", slide.getAttribute('data-audio-src'), slide.getAttribute('data-audio-text'), slide.querySelector(':not(.fragment) > video[data-audio-controls]'), slide.getAttribute('data-audio-subtitle'));
        var fragments = slide.querySelectorAll('.fragment');
        for (var f = 0, len = fragments.length; f < len; f++) {
            setupAudioElement(container, h + '.' + v + '.' + (parseInt(fragments[f].getAttribute('data-fragment-index')) + 1), fragments[f].getAttribute('data-audio-src'), fragments[f].getAttribute('data-audio-text'), fragments[f].querySelector('video[data-audio-controls]'), fragments[f].getAttribute('data-audio-subtitle'));
        }

    }

    function linkVideoToAudioControls(audioElement, videoElement) {
        audioElement.addEventListener('playing', function(event) {
            videoElement.currentTime = audioElement.currentTime;
        });
        audioElement.addEventListener('play', function(event) {
            console.debug("play event");
            videoElement.currentTime = audioElement.currentTime;
            if (videoElement.paused) videoElement.play();
        });
        audioElement.addEventListener('pause', function(event) {
            videoElement.currentTime = audioElement.currentTime;
            if (!videoElement.paused) videoElement.pause();
        });
        audioElement.addEventListener('volumechange', function(event) {
            videoElement.volume = audioElement.volume;
            videoElement.muted = audioElement.muted;
        });
        audioElement.addEventListener('seeked', function(event) {
            videoElement.currentTime = audioElement.currentTime;
        });
        var sourceOfSilence = document.createElement('source');
        if (videoElement.duration > defaultDuration) {
            // increase duration of silence	to duration of video
            var videoSilence = new SilentAudio(videoElement.duration); // create the wave file
            sourceOfSilence.src = videoSilence.dataURI;
        } else {
            sourceOfSilence.src = silence.dataURI;
        }
        audioElement.appendChild(sourceOfSilence); // use this if audio file does not exist
    }


    function setupAudioElement(container, indices, audioFile, text, videoElement, subtitle) {
        var subTitleRegion = document.getElementById("subTitleRegion");
        textArray = text.split(separator);
        if (subtitle == null) {
            subtitleArray = [];
        } else {
            subtitleArray = subtitle.split(separator);
        }
        //textArray.splice(textArray.length - 1, 1);
        //console.log(textArray);
        for (var i = 0; i < textArray.length; i++) {
            var audioElement = document.createElement('audio');
            audioElement.setAttribute('style', "position: relative; to p: 20px; left: 10%; width: 80%;");
            audioElement.id = "audioplayer-" + indices + "." + i;
            audioElement.style.display = "none";
            audioElement.setAttribute('controls', '');
            audioElement.setAttribute('preload', 'none');
            //audioElement.setAttribute( 'preload', 'auto' );

            var labelElement = document.createElement('div');
            //labelElement.setAttribute('style', "position: fixed; font-size:25px ; font-family: 'Times New Roman'; left:8%; right: 8%; height: " + subTitleRegion.offsetHeight + "px; width :" + subTitleRegion.offsetWidth * 0.84 + "px;");
            labelElement.setAttribute('style', "position: fixed; font-size:25px ; font-family: 'Times New Roman'; left:8%; right: 8%; height: " + subTitleRegion.offsetHeight + "px; width : 80%;");
            labelElement.id = "label-" + indices + "." + i;
            labelElement.className = "subTitleContent";
            labelElement.style.display = "none";
            labelElement.style.zIndex = "1000";
            labelElement.draggable = true;
            labelElement.setAttribute("name", "subtitleDiv");

            var leftUpResizer = document.createElement('div');
            leftUpResizer.setAttribute('style', "width: 10px; height: 10px; background: #DDDDDD; position:absolute; left: 0; top: 0; cursor: nw-resize; z-index = 1000");
            leftUpResizer.style.visibility = "hidden";
            var rightUpResizer = document.createElement('div');
            rightUpResizer.setAttribute('style', "width: 10px; height: 10px; background: #DDDDDD; position:absolute; right: 0; top: 0; cursor: ne-resize; z-index = 1000");
            rightUpResizer.style.visibility = "hidden";
            var leftDownResizer = document.createElement('div');
            leftDownResizer.setAttribute('style', "width: 10px; height: 10px; background: #DDDDDD; position:absolute; left: 0; bottom: 0; cursor: sw-resize; z-index = 1000");
            leftDownResizer.style.visibility = "hidden";
            var rightDownResizer = document.createElement('div');
            rightDownResizer.setAttribute('style', "width: 10px; height: 10px; background: #DDDDDD; position:absolute; right: 0; bottom: 0; cursor: se-resize; z-index = 1000");
            rightDownResizer.style.visibility = "hidden";

            leftUpResizer.addEventListener('mousedown', function(event) {
                event.target.parentNode.draggable = false;
                var style = document.getElementById("hover-style");
                if (style.styleSheet) {
                    style.styleSheet.cssText = hoverResizeStyle;
                } else {
                    style.childNodes[0].nodeValue = hoverResizeStyle;
                }
                MouseStartX = event.screenX;
                MouseStartY = event.screenY;
                startHeight = event.target.parentNode.offsetHeight;
                startWidth = event.target.parentNode.offsetWidth;
                contentStartHeight = event.target.parentNode.childNodes[4].offsetHeight;
                contentStartWidth = event.target.parentNode.childNodes[4].offsetWidth;
                document.documentElement.addEventListener('mousemove', movelu);
                document.documentElement.addEventListener('mouseup', removelu);
                for (var i = 0; i < window.frames["svg-fragment-iframe"].length; i++) {
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.addEventListener('mousemove', moveInIframelu);
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.addEventListener('mouseup', removelu);
                }
            });

            function movelu(e) {
                currentLabel.childNodes[4].style.height = MouseStartY - e.screenY + contentStartHeight + "px";
                currentLabel.childNodes[4].style.width = MouseStartX - e.screenX + contentStartWidth + "px";
                currentLabel.style.height = MouseStartY - e.screenY + startHeight + "px";
                currentLabel.style.width = MouseStartX - e.screenX + startWidth + "px";
                currentLabel.style.left = e.screenX - window.screenLeft + "px";
                currentLabel.style.top = e.screenY - window.screenTop - (window.outerHeight - window.innerHeight) + "px";
            }

            function moveInIframelu(e) {
                e.stopPropagation();
                currentLabel.childNodes[4].style.height = MouseStartY - e.screenY + contentStartHeight + "px";
                currentLabel.childNodes[4].style.width = MouseStartX - e.screenX + contentStartWidth + "px";
                currentLabel.style.height = MouseStartY - e.screenY + startHeight + "px";
                currentLabel.style.width = MouseStartX - e.screenX + startWidth + "px";
                currentLabel.style.left = e.screenX - window.screenLeft + "px";
                currentLabel.style.top = e.screenY - window.screenTop - (window.outerHeight - window.innerHeight) + "px";
            }

            function removelu(e) {
                var style = document.getElementById("hover-style");
                if (style.styleSheet) {
                    style.styleSheet.cssText = hoverStyle;
                } else {
                    style.childNodes[0].nodeValue = hoverStyle;
                }

                document.documentElement.removeEventListener('mousemove', movelu);
                document.documentElement.removeEventListener('mouseup', removelu);
                for (var i = 0; i < window.frames["svg-fragment-iframe"].length; i++) {
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.removeEventListener('mousemove', moveInIframelu);
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.removeEventListener('mouseup', removelu);
                }
                currentLabel.draggable = true;
            }

            rightUpResizer.addEventListener('mousedown', function(event) {
                //console.log(event);
                var style = document.getElementById("hover-style");
                if (style.styleSheet) {
                    style.styleSheet.cssText = hoverResizeStyle;
                } else {
                    style.childNodes[0].nodeValue = hoverResizeStyle;
                }
                event.target.parentNode.draggable = false;
                MouseStartX = event.screenX;
                MouseStartY = event.screenY;
                startHeight = event.target.parentNode.offsetHeight;
                startWidth = event.target.parentNode.offsetWidth;
                contentStartHeight = event.target.parentNode.childNodes[4].offsetHeight;
                contentStartWidth = event.target.parentNode.childNodes[4].offsetWidth;
                document.documentElement.addEventListener('mousemove', moveru);
                document.documentElement.addEventListener('mouseup', removeru);
                for (var i = 0; i < window.frames["svg-fragment-iframe"].length; i++) {
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.addEventListener('mousemove', moveInIframeru);
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.addEventListener('mouseup', removeru);
                }
            });



            function moveru(e) {
                currentLabel.childNodes[4].style.height = MouseStartY - e.screenY + contentStartHeight + "px";
                currentLabel.childNodes[4].style.width = e.screenX - MouseStartX + contentStartWidth + "px";
                currentLabel.style.height = MouseStartY - e.screenY + startHeight + "px";
                currentLabel.style.width = e.screenX - MouseStartX + startWidth + "px";
                currentLabel.style.left = e.screenX - window.screenLeft - currentLabel.offsetWidth + "px";
                currentLabel.style.top = e.screenY - window.screenTop - (window.outerHeight - window.innerHeight) + "px";
            }

            function moveInIframeru(e) {
                e.stopPropagation();
                currentLabel.childNodes[4].style.height = MouseStartY - e.screenY + contentStartHeight + "px";
                currentLabel.childNodes[4].style.width = e.screenX - MouseStartX + contentStartWidth + "px";
                currentLabel.style.height = MouseStartY - e.screenY + startHeight + "px";
                currentLabel.style.width = e.screenX - MouseStartX + startWidth + "px";
                currentLabel.style.left = e.screenX - window.screenLeft - currentLabel.offsetWidth + "px";
                currentLabel.style.top = e.screenY - window.screenTop - (window.outerHeight - window.innerHeight) + "px";
            }

            function removeru(e) {
                var style = document.getElementById("hover-style");
                if (style.styleSheet) {
                    style.styleSheet.cssText = hoverStyle;
                } else {
                    style.childNodes[0].nodeValue = hoverStyle;
                    //style.appendChild(document.createTextNode(hoverStyle));
                }
                document.documentElement.removeEventListener('mousemove', moveru);
                document.documentElement.removeEventListener('mouseup', removeru);
                for (var i = 0; i < window.frames["svg-fragment-iframe"].length; i++) {
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.removeEventListener('mousemove', moveInIframeru);
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.removeEventListener('mouseup', removeru);
                }
                currentLabel.draggable = true;

            }

            leftDownResizer.addEventListener('mousedown', function(event) {
                //console.log(event);
                var style = document.getElementById("hover-style");
                if (style.styleSheet) {
                    style.styleSheet.cssText = hoverResizeStyle;
                } else {
                    style.childNodes[0].nodeValue = hoverResizeStyle;
                    //style.appendChild(document.createTextNode(hoverResizeStyle));
                }
                event.target.parentNode.draggable = false;

                MouseStartX = event.screenX;
                MouseStartY = event.screenY;
                startHeight = event.target.parentNode.offsetHeight;
                startWidth = event.target.parentNode.offsetWidth;
                contentStartHeight = event.target.parentNode.childNodes[4].offsetHeight;
                contentStartWidth = event.target.parentNode.childNodes[4].offsetWidth;
                document.documentElement.addEventListener('mousemove', moveld);
                document.documentElement.addEventListener('mouseup', removeld);
                for (var i = 0; i < window.frames["svg-fragment-iframe"].length; i++) {
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.addEventListener('mousemove', moveInIframeld);
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.addEventListener('mouseup', removeld);
                }
            });



            function moveld(e) {
                currentLabel.childNodes[4].style.height = e.screenY - MouseStartY + contentStartHeight + "px";
                currentLabel.childNodes[4].style.width = MouseStartX - e.screenX + contentStartWidth + "px";
                currentLabel.style.height = e.screenY - MouseStartY + startHeight + "px";
                currentLabel.style.width = MouseStartX - e.screenX + startWidth + "px";
                currentLabel.style.left = e.screenX - window.screenLeft + "px";
                currentLabel.style.top = e.screenY - window.screenTop - (window.outerHeight - window.innerHeight) - currentLabel.offsetHeight + "px";
            }

            function moveInIframeld(e) {
                e.stopPropagation();
                currentLabel.childNodes[4].style.height = e.screenY - MouseStartY + contentStartHeight + "px";
                currentLabel.childNodes[4].style.width = MouseStartX - e.screenX + contentStartWidth + "px";
                currentLabel.style.height = e.screenY - MouseStartY + startHeight + "px";
                currentLabel.style.width = MouseStartX - e.screenX + startWidth + "px";
                currentLabel.style.left = e.screenX - window.screenLeft + "px";
                currentLabel.style.top = e.screenY - window.screenTop - (window.outerHeight - window.innerHeight) - currentLabel.offsetHeight + "px";
            }

            function removeld(e) {
                var style = document.getElementById("hover-style");
                if (style.styleSheet) {
                    style.styleSheet.cssText = hoverStyle;
                } else {
                    style.childNodes[0].nodeValue = hoverStyle;
                    //style.appendChild(document.createTextNode(hoverStyle));
                }
                document.documentElement.removeEventListener('mousemove', moveld);
                document.documentElement.removeEventListener('mouseup', removeld);
                for (var i = 0; i < window.frames["svg-fragment-iframe"].length; i++) {
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.removeEventListener('mousemove', moveInIframeld);
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.removeEventListener('mouseup', removeld);
                }
                currentLabel.draggable = true;
            }

            rightDownResizer.addEventListener('mousedown', function(event) {
                var style = document.getElementById("hover-style");
                if (style.styleSheet) {
                    style.styleSheet.cssText = hoverResizeStyle;
                } else {
                    style.childNodes[0].nodeValue = hoverResizeStyle;
                    //style.appendChild(document.createTextNode(hoverResizeStyle));
                }
                event.target.parentNode.draggable = false;

                MouseStartX = event.screenX;
                MouseStartY = event.screenY;
                startHeight = event.target.parentNode.offsetHeight;
                startWidth = event.target.parentNode.offsetWidth;
                contentStartHeight = event.target.parentNode.childNodes[4].offsetHeight;
                contentStartWidth = event.target.parentNode.childNodes[4].offsetWidth;
                document.documentElement.addEventListener('mousemove', move);
                document.documentElement.addEventListener('mouseup', remove);
                for (var i = 0; i < window.frames["svg-fragment-iframe"].length; i++) {
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.addEventListener('mousemove', moveInIframe);
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.addEventListener('mouseup', remove);
                }
            });



            function move(e) {
                currentLabel.childNodes[4].style.height = 0 - MouseStartY + e.screenY + contentStartHeight + "px";
                currentLabel.childNodes[4].style.width = 0 - MouseStartX + e.screenX + contentStartWidth + "px";
                currentLabel.style.height = 0 - MouseStartY + e.screenY + startHeight + "px";
                currentLabel.style.width = 0 - MouseStartX + e.screenX + startWidth + "px";
            }

            function moveInIframe(e) {
                e.stopPropagation();
                //var iframepos = jQuery("#svg-fragment-iframe").position();
                currentLabel.childNodes[4].style.height = 0 - MouseStartY + e.screenY + contentStartHeight + "px";
                currentLabel.childNodes[4].style.width = 0 - MouseStartX + e.screenX + contentStartWidth + "px";
                currentLabel.style.height = 0 - MouseStartY + e.screenY + startHeight + "px";
                currentLabel.style.width = 0 - MouseStartX + e.screenX + startWidth + "px";
            }

            function remove(e) {
                var style = document.getElementById("hover-style");
                if (style.styleSheet) {
                    style.styleSheet.cssText = hoverStyle;
                } else {
                    style.childNodes[0].nodeValue = hoverStyle;
                    // style.appendChild(document.createTextNode(hoverStyle));
                }
                document.documentElement.removeEventListener('mousemove', move);
                document.documentElement.removeEventListener('mouseup', remove);
                for (var i = 0; i < window.frames["svg-fragment-iframe"].length; i++) {
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.removeEventListener('mousemove', moveInIframe);
                    window.frames["svg-fragment-iframe"][i].contentWindow.document.removeEventListener('mouseup', remove);
                }
                currentLabel.draggable = true;

            }

            var labelContent = document.createElement('div');
            labelContent.name = "content";
            //labelContent.setAttribute('style', "position: relative ; z-index = 1000; left: 10px; top : 10px; overflow: auto; height: " + (subTitleRegion.offsetHeight - 20) + "px; width :" + (subTitleRegion.offsetWidth * 0.84 - 20) + "px;");
            labelContent.setAttribute('style', "position: relative ; z-index = 1000; left: 10px; top : 10px; overflow: auto; height: " + (subTitleRegion.offsetHeight - 20) + "px; width : 100%");
            if (i < subtitleArray.length) {
                if (subtitleArray[i].trim() == "") {
                    //labelElement.innerText = textArray[i].trim().split(" ")[0];
                    labelContent.innerText = textArray[i].trim();
                } else {
                    labelContent.innerText = subtitleArray[i].trim();
                }

            } else {
                //labelElement.innerText = textArray[i].trim().split(" ")[0];
                labelContent.innerText = textArray[i].trim();
            }
            labelElement.appendChild(leftUpResizer);
            labelElement.appendChild(rightUpResizer);
            labelElement.appendChild(leftDownResizer);
            labelElement.appendChild(rightDownResizer);
            labelElement.appendChild(labelContent);

            labelElement.addEventListener('dragstart', (function(id) {
                return function(event) {
                    if (!dragRegion) { return; }
                    document.getElementById(id).childNodes[4].style.overflow = "hidden";
					event.dataTransfer.setData('text/plain', null);
                    var dataTransfer = event.dataTransfer;
                    dataTransfer.effectAllowed = "all";
                    dataTransferx = document.getElementById(id).offsetLeft;
                    dataTransfery = document.getElementById(id).offsetTop;
                    var e = event || window.event;
                    dataTransferMouseX = e.screenX;
                    dataTransferMouseY = e.screenY;
					console.log(dataTransfer);
                }
            })(labelElement.id));

            labelElement.addEventListener('dragend', (function(id) {
                return function(event) {
                    if (!dragRegion) { return; }
                    document.getElementById(id).childNodes[4].style.overflow = "auto";
                    event.preventDefault();
                    var dataTransfer = event.dataTransfer;
                    dataTransfer.dropEffect = "move";
                    var e = event || window.event;
                    Px = dataTransferx - (dataTransferMouseX - e.screenX);
                    Py = dataTransfery - (dataTransferMouseY - e.screenY);
					console.log(dataTransfer);
                    subTitlePosition(Px, Py, id);
                }

            })(labelElement.id));

            if (videoElement) {
                // connect play, pause, volumechange, mute, timeupdate events to video
                if (videoElement.duration) {
                    linkVideoToAudioControls(audioElement, videoElement);
                } else {
                    videoElement.onloadedmetadata = function() {
                        linkVideoToAudioControls(audioElement, videoElement);
                    };
                }
            }

            audioElement.addEventListener('ended', (function(i, length) {
                return function(event) {
                    if (typeof Recorder == 'undefined' || !Recorder.isRecording) {
                        var previousAudio = currentAudio;
                        if (i + 1 > length - 1) {
                            Reveal.next();
                            selectAudio(previousAudio, 0);
                            selectLabel(0);
                        } else {
                            selectAudio(previousAudio, i + 1);
                            selectLabel(i + 1);
                        }

                    }
                }
            })(i, textArray.length));

            audioElement.addEventListener('play', (function(i, name, text) {
                return function(event) {
                    // preload next audio element so that it is available after slide change
                    var indices = Reveal.getIndices();
                    var nextId = "audioplayer-" + indices.h + '.' + indices.v;
                    //console.log(indices.f);			
                    if (indices.f != undefined && indices.f >= 0) {
                        nextId = nextId + '.' + (indices.f + 2) + ".0";
                    } else {
                        nextId = nextId + '.1.0';
                    }
                    var nextAudio = document.getElementById(nextId);
                    if (!nextAudio) {
                        nextId = "audioplayer-" + indices.h + '.' + (indices.v + 1) + ".0.0";
                        nextAudio = document.getElementById(nextId);
                        if (!nextAudio) {
                            nextId = "audioplayer-" + (indices.h + 1) + '.0.0.0';
                            nextAudio = document.getElementById(nextId);
                        }
                    }
                    //console.log(nextAudio);
                    if (nextAudio) {
                        //console.debug( "Preload: " + nextAudio.id );
                        nextAudio.load();
                    }


                    /*if (textToSpeechURL != null && text != null && autoDownLoadAudio) {
						
                        var content = textToSpeechURL + encodeURIComponent(text);
                        var aLink = document.createElement('a');
                        var blob = new Blob([content]);
                        var evt = document.createEvent("HTMLEvents");
                        evt.initEvent("click");
                        aLink.href = URL.createObjectURL(blob);
                        aLink.download = name + "." + i + ".ogg";
                        //aLink.dispatchEvent(evt);
						aLink.click();
                    }*/

                }
            })(i, indices, textArray[i]));


            if (textToSpeechURL != null && text != null) {
                var audioSource = document.createElement('source');
                audioSource.src = textToSpeechURL + encodeURIComponent(textArray[i]);
                audioSource.name = "audio-src-online";
                audioElement.insertBefore(audioSource, audioElement.firstChild);
            }

            if (audioFile != null) {
                // Support comma separated lists of audio sources
                audioFile.split(',').forEach(function(source) {
                    var audioSource = document.createElement('source');
                    audioSource.src = source;
                    audioElement.insertBefore(audioSource, audioElement.firstChild);
                });
            } else {
                var audioSource = document.createElement('source');
                audioSource.src = prefix + indices + "." + i + suffix;
                //console.debug(audioSource.src);
                audioElement.insertBefore(audioSource, audioElement.firstChild);
            }
            if (!videoElement) {
                // only add silence if no videoElement defines the minimum duration
                var sourceOfSilence = document.createElement('source');
                sourceOfSilence.src = silence.dataURI;
                audioElement.appendChild(sourceOfSilence); // use this if audio file does not exist
            }


            container.appendChild(audioElement);
            //document.querySelector(".reveal").appendChild(labelElement);
            //document.querySelector(".reveal").appendChild(icon);
            subTitleRegion.appendChild(labelElement);
            //subTitleRegion.appendChild(icon);
            subTitleRegion.style.display = "block";
        }
    }


    var jpPlayer = document.createElement('div');
    jpPlayer.id = "jquery_jplayer_1";
    jpPlayer.className = "cp-jplayer";
    document.body.appendChild(jpPlayer);

    var audioDiv = document.createElement('div');
    audioDiv.id = "cp_container_1";
    audioDiv.className = "cp-container";
    audioDiv.setAttribute('style', "position: absolute; left: 4%; bottom: 5px; height: 100px; width: 200px;z-index:500;");
    audioDiv.classList.remove("reveal");

    var cpBuffer = document.createElement('div');
    cpBuffer.className = "cp-buffer-holder";
    cpBuffer.classList.remove("reveal");

    var buffer1 = document.createElement('div');
    buffer1.className = "cp-buffer-1";
    buffer1.classList.remove("reveal");

    var buffer2 = document.createElement('div');
    buffer2.className = "cp-buffer-2";
    buffer2.classList.remove("reveal");

    cpBuffer.appendChild(buffer1);
    cpBuffer.appendChild(buffer2);

    var cpProgress = document.createElement('div');
    cpProgress.className = "cp-progress-holder";
    cpProgress.classList.remove("reveal");

    var progress1 = document.createElement('div');
    progress1.className = "cp-progress-1";
    progress1.classList.remove("reveal");

    var progress2 = document.createElement('div');
    progress2.className = "cp-progress-2";
    progress2.classList.remove("reveal");

    cpProgress.appendChild(progress1);
    cpProgress.appendChild(progress2);


    var cpCircle = document.createElement('div');
    cpCircle.className = "cp-circle-control";
    cpCircle.classList.remove("reveal");

    var cpControl = document.createElement('ul');
    cpControl.className = "cp-controls";
    cpControl.classList.remove("reveal");

    var cpPlay = document.createElement('li');
    var palyClick = document.createElement('a');
    palyClick.className = "cp-play";
    palyClick.setAttribute('tabindex', "1");
    palyClick.innerText = "play";
    palyClick.id = "playAudio";
    cpPlay.appendChild(palyClick);
    cpPlay.classList.remove("reveal");
    palyClick.classList.remove("reveal");

    var cpPause = document.createElement('li');
    var pauseClick = document.createElement('a');
    pauseClick.className = "cp-pause";
    pauseClick.setAttribute('style', "display:none;");
    pauseClick.setAttribute('tabindex', "1");
    pauseClick.innerText = "pause";
    pauseClick.id = "pauseAudio"
    cpPause.appendChild(pauseClick);
    cpPause.classList.remove("reveal");
    pauseClick.classList.remove("reveal");

    cpControl.appendChild(cpPlay);
    cpControl.appendChild(cpPause);

    audioDiv.appendChild(cpBuffer);
    audioDiv.appendChild(cpProgress);
    audioDiv.appendChild(cpCircle);
    audioDiv.appendChild(cpControl);

    var volumeControl = document.createElement('div');
    volumeControl.className = "jp-volume-controls";
    volumeControl.classList.remove("reveal");

    var volumeDiv = document.createElement('div');
    volumeDiv.className = "jp-volume-bar";
    volumeDiv.classList.remove("reveal");

    var volumeBar = document.createElement('div');
    volumeBar.className = "jp-volume-bar-value";
    volumeBar.classList.remove("reveal");

    var muteButton = document.createElement('button');
    muteButton.className = "jp-mute";
    muteButton.role = "button";
    muteButton.tabindex = "0";
    muteButton.innerText = "mute";

    var maxButton = document.createElement('button');
    maxButton.className = "jp-volume-max";
    maxButton.role = "button";
    maxButton.tabindex = "0";
    maxButton.innerText = "max volume";

    var printButton = document.createElement('i');
    printButton.className = "fa fa-print printButton";
    printButton.setAttribute('aria-hidden', "true");
    printButton.setAttribute('style', "font-size:15px");
    printButton.addEventListener('click', function(event) {
		var url = window.location.href;
		var url_array = url.split("#");
		var print_str = "?print-pdf";
		var new_url = url_array[0]+print_str;
		window.location.href = new_url;
    });

//    var showNotes = document.createElement('label');
//    showNotes.className = "switch";
//    showNotes.setAttribute("style", "top:12%");
//    showNotes.style.zIndex = "1000";
//    var showNotesInput = document.createElement('input');
//    showNotesInput.type = "checkbox"
//    showNotesInput.checked = true;
//    showNotesInput.style.zIndex = "1000";
//    var showNotesDiv = document.createElement('div');
//    showNotesDiv.className = "slider round";
//	showNotesDiv.id = "show_notes_div";
//    showNotesDiv.style.zIndex = "1000";
//    showNotes.appendChild(showNotesInput);
//    showNotes.appendChild(showNotesDiv);
//    document.querySelector(".reveal").appendChild(showNotes);
//    jQuery('.switch').bind("transitionend", transition);

//    function transition(e) {
//        if (e.originalEvent.propertyName == "transform") {
//            show = !show;
//            if (!show) {
//				if(paging){
//					document.querySelector(".reveal").setAttribute('style', "width:100%; left : 0px; height: 100%;");
//					var subTitleRegion = document.getElementById("subTitleRegion");
//					subTitleRegion.style.visibility = "hidden";
//					currentLabel.style.visibility  = "hidden";
//				}
//				else{
//					currentLabel.style.visibility  = "hidden";
//				}
//
//           } else {
//				if(paging){
//						document.querySelector(".reveal").setAttribute('style', "width:100%; left : 0px; height: " + 100 * (1 - subTitleRegionProportion) + "%;");
//						var subTitleRegion = document.getElementById("subTitleRegion");
//						subTitleRegion.style.visibility = "visible";
//						currentLabel.style.visibility = "visible";
//				}
//				else{
//					currentLabel.style.visibility = "visible";
//				}
//
//            }
//        }
//    }

    volumeDiv.appendChild(volumeBar);
    volumeControl.appendChild(volumeDiv);
    volumeControl.appendChild(muteButton);
    volumeControl.appendChild(maxButton);
    //volumeControl.appendChild(printButton);
    audioDiv.appendChild(volumeControl);


    document.querySelector(".reveal").appendChild(audioDiv);
	
    if(window.orientation==0){  
		//alert("gg");
       //document.body.setAttribute("orient","portrait");  
	   document.querySelector(".reveal").setAttribute('style', "-webkit-transform: rotate(90deg); -ms-transform: rotate(90deg);transform: rotate(90deg);");
    }else{  
       //document.body.setAttribute("orient","landscape");  
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

var FastBase64 = {
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encLookup: [],
    Init: function() {
        for (var e = 0; 4096 > e; e++) this.encLookup[e] = this.chars[e >> 6] + this.chars[63 & e]
    },
    Encode: function(e) {
        for (var h = e.length, a = "", t = 0; h > 2;) n = e[t] << 16 | e[t + 1] << 8 | e[t + 2], a += this.encLookup[n >> 12] + this.encLookup[4095 & n], h -= 3, t += 3;
        if (h > 0) {
            var s = (252 & e[t]) >> 2,
                i = (3 & e[t]) << 4;
            if (h > 1 && (i |= (240 & e[++t]) >> 4), a += this.chars[s], a += this.chars[i], 2 == h) {
                var r = (15 & e[t++]) << 2;
                r |= (192 & e[t]) >> 6, a += this.chars[r]
            }
            1 == h && (a += "="), a += "="
        }
        return a
    }
};
FastBase64.Init();
var SilentAudio = function(e) {
    function h(e) {
        return [255 & e, e >> 8 & 255, e >> 16 & 255, e >> 24 & 255]
    }

    function a(e) {
        return [255 & e, e >> 8 & 255]
    }

    function t(e) {
        for (var h = [], a = 0, t = e.length, s = 0; t > s; s++) h[a++] = 255 & e[s], h[a++] = e[s] >> 8 & 255;
        return h
    }
    this.data = [], this.wav = [], this.dataURI = "", this.header = {
        chunkId: [82, 73, 70, 70],
        chunkSize: 0,
        format: [87, 65, 86, 69],
        subChunk1Id: [102, 109, 116, 32],
        subChunk1Size: 16,
        audioFormat: 1,
        numChannels: 1,
        sampleRate: 8e3,
        byteRate: 0,
        blockAlign: 0,
        bitsPerSample: 8,
        subChunk2Id: [100, 97, 116, 97],
        subChunk2Size: 0
    }, this.Make = function(e) {
        for (var s = 0; s < e * this.header.sampleRate; s++) this.data[s] = 127;
        this.header.blockAlign = this.header.numChannels * this.header.bitsPerSample >> 3, this.header.byteRate = this.header.blockAlign * this.sampleRate, this.header.subChunk2Size = this.data.length * (this.header.bitsPerSample >> 3), this.header.chunkSize = 36 + this.header.subChunk2Size, this.wav = this.header.chunkId.concat(h(this.header.chunkSize), this.header.format, this.header.subChunk1Id, h(this.header.subChunk1Size), a(this.header.audioFormat), a(this.header.numChannels), h(this.header.sampleRate), h(this.header.byteRate), a(this.header.blockAlign), a(this.header.bitsPerSample), this.header.subChunk2Id, h(this.header.subChunk2Size), 16 == this.header.bitsPerSample ? t(this.data) : this.data), this.dataURI = "data:audio/wav;base64," + FastBase64.Encode(this.wav)
    }, this.Make(e)
};
