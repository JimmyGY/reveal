var windowReady = false;
var voiceReady = false;

var defaultparams = {
    rate: 1,
    pitch: 1,
    volume: 1,
    text: 'The voice consists of sound made by a human being using the vocal folds for talking, reading, singing, laughing, crying, screaming etc. The human voice is specifically a part of human sound production in which the vocal folds (vocal cords) are the primary sound source.',
    voice: 'UK English Female'
};

$(window).load( function() {


    $('#rate').val(getUrlParameter('rate') || defaultparams.rate);
    $('#pitch').val(getUrlParameter('pitch') || defaultparams.pitch);
    $('#volume').val(getUrlParameter('volume') || defaultparams.volume);
    $('#text').val(getUrlParameter('text') || defaultparams.text);
    
    $('#rate_slider').on("change",function(){$('#rate').val($('#rate_slider').val());})
    $('#pitch_slider').on("change",function(){$('#pitch').val($('#pitch_slider').val());})
    $('#volume_slider').on("change",function(){$('#volume').val($('#volume_slider').val());})
    
    windowReady = true;

    $('#voicetestdiv').hide();
    $('#waitingdiv').show();

    playbutton.onclick = function() {

        var parameters = {
            rate: $('#rate').val(),
            pitch: $('#pitch').val(),
            volume: $('#volume').val()
        };
        
        responsiveVoice.speak($('#text').val(),$('#voiceselection').val(), parameters);

    };
    
    // btgeneratelink.onclick = function() {
        
    //     var urlparams = "";
        
    //     var params = {
    //         rate: $('#rate').val(),
    //         pitch: $('#pitch').val(),
    //         volume: $('#volume').val(),
    //         text: $('#text').val(),
    //         voice: $('#voiceselection').val()
    //     };        
        
    //     if (params.rate != defaultparams.rate)
    //         urlparams += (urlparams==""?'?':'&') + 'rate=' + params.rate;

    //     if (params.pitch != defaultparams.pitch)
    //         urlparams += (urlparams==""?'?':'&') + 'pitch=' + params.pitch;
        
    //     if (params.volume != defaultparams.volume)
    //         urlparams += (urlparams==""?'?':'&') + 'volume=' + params.volume;
        
    //     if (params.voice != defaultparams.voice)
    //         urlparams += (urlparams==""?'?':'&') + 'voice=' + params.voice;
        
    //     if (params.text != defaultparams.text)
    //         urlparams += (urlparams==""?'?':'&') + 'text=' + params.text;        
        
    //     var url = 'http://' + window.location.hostname + window.location.pathname + urlparams;
        
    //     $('#txtlink').html(encodeURI(url));
    // }

    stopbutton.onclick = function() {

        responsiveVoice.cancel();

    };	

    responsiveVoice.AddEventListener("OnLoad",function(){
        console.log("ResponsiveVoice Loaded Callback") ;
    });


    CheckLoading();


    
});

responsiveVoice.OnVoiceReady = function() {

    

    voiceReady = true;
    CheckLoading();
}


function CheckLoading() {
    
    if (voiceReady && windowReady) {

        //$('#voicetestdiv').fadeIn(0.5);
        //$('#waitingdiv').fadeOut(0.5);

        //Populate voice selection dropdown
        var voicelist = responsiveVoice.getVoices();

        var vselect = $("#voiceselection");
        vselect.html("");
        $.each(voicelist, function() {
                vselect.append($("<option />").val(this.name).text(this.name));
        });	      
        
            $('#voiceselection').val(getUrlParameter('voice') || defaultparams.voice);
        
        //getIframeWindow(document.getElementById('framelogo')).responsiveVoice = responsiveVoice;
        
    }
    
}

function getIframeWindow(iframe_object) {
  var doc;

  if (iframe_object.contentWindow) {
    return iframe_object.contentWindow;
  }

  if (iframe_object.window) {
    return iframe_object.window;
  } 

  if (!doc && iframe_object.contentDocument) {
    doc = iframe_object.contentDocument;
  } 

  if (!doc && iframe_object.document) {
    doc = iframe_object.document;
  }

  if (doc && doc.defaultView) {
   return doc.defaultView;
  }

  if (doc && doc.parentWindow) {
    return doc.parentWindow;
  }

  return undefined;
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
