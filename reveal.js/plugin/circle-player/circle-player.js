	var path = "../reveal.js/plugin/circle-player/";

	var js = document.createElement("link");
    js.rel = "stylesheet";
    js.href = path + "lib/css/not.the.skin.css";
    document.head.appendChild(js);

    var js = document.createElement("link");
    js.rel = "stylesheet";
    js.href = path + "lib/css/circle.skin/circle.player.css";
    document.head.appendChild(js);

    var js = document.createElement("link");
    js.rel = "stylesheet";
    js.href = path + "lib/css/skin/blue.monday/css/jplayer.blue.monday.css";
    document.head.appendChild(js);

    // var js = document.createElement("script");
    // js.type = "text/javascript";
    // js.src = path + "lib/js/jquery-1.6.min.js";
    // document.head.appendChild(js);

    var js = document.createElement("script");
    js.type = "text/javascript";
    js.src = path + "lib/js/jquery.transform2d.js";
    document.head.appendChild(js);

    var js = document.createElement("script");
    js.type = "text/javascript";
    js.src = path + "lib/js/jquery.grab.js";
    document.head.appendChild(js);

    var js = document.createElement("script");
    js.type = "text/javascript";
    js.src = path + "lib/js/jquery.jplayer.js";
    document.head.appendChild(js);

    var js = document.createElement("script");
    js.type = "text/javascript";
    js.src = path + "lib/js/mod.csstransforms.min.js";
    document.head.appendChild(js);

    var js = document.createElement("script");
    js.type = "text/javascript";
    js.src = path + "lib/js/circle.player.js";
    document.head.appendChild(js);

    var hidden_circle = document.createElement("div");
    hidden_circle.setAttribute("circle-player","");
    document.body.appendChild(hidden_circle);


//var FastBase64={chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encLookup:[],Init:function(){for(var e=0;4096>e;e++)this.encLookup[e]=this.chars[e>>6]+this.chars[63&e]},Encode:function(e){for(var h=e.length,a="",t=0;h>2;)n=e[t]<<16|e[t+1]<<8|e[t+2],a+=this.encLookup[n>>12]+this.encLookup[4095&n],h-=3,t+=3;if(h>0){var s=(252&e[t])>>2,i=(3&e[t])<<4;if(h>1&&(i|=(240&e[++t])>>4),a+=this.chars[s],a+=this.chars[i],2==h){var r=(15&e[t++])<<2;r|=(192&e[t])>>6,a+=this.chars[r]}1==h&&(a+="="),a+="="}return a}};FastBase64.Init();var SilentAudio=function(e){function h(e){return[255&e,e>>8&255,e>>16&255,e>>24&255]}function a(e){return[255&e,e>>8&255]}function t(e){for(var h=[],a=0,t=e.length,s=0;t>s;s++)h[a++]=255&e[s],h[a++]=e[s]>>8&255;return h}this.data=[],this.wav=[],this.dataURI="",this.header={chunkId:[82,73,70,70],chunkSize:0,format:[87,65,86,69],subChunk1Id:[102,109,116,32],subChunk1Size:16,audioFormat:1,numChannels:1,sampleRate:8e3,byteRate:0,blockAlign:0,bitsPerSample:8,subChunk2Id:[100,97,116,97],subChunk2Size:0},this.Make=function(e){for(var s=0;s<e*this.header.sampleRate;s++)this.data[s]=127;this.header.blockAlign=this.header.numChannels*this.header.bitsPerSample>>3,this.header.byteRate=this.header.blockAlign*this.sampleRate,this.header.subChunk2Size=this.data.length*(this.header.bitsPerSample>>3),this.header.chunkSize=36+this.header.subChunk2Size,this.wav=this.header.chunkId.concat(h(this.header.chunkSize),this.header.format,this.header.subChunk1Id,h(this.header.subChunk1Size),a(this.header.audioFormat),a(this.header.numChannels),h(this.header.sampleRate),h(this.header.byteRate),a(this.header.blockAlign),a(this.header.bitsPerSample),this.header.subChunk2Id,h(this.header.subChunk2Size),16==this.header.bitsPerSample?t(this.data):this.data),this.dataURI="data:audio/wav;base64,"+FastBase64.Encode(this.wav)},this.Make(e)};
