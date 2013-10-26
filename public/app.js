$(document).ready(function(){
 // setup
 var connection = new RTCMultiConnection();
 var streamid = null
 var recording = false;
 var playing = false;
 var formData = null;

 // configure session
 connection.session = {
     audio: true,
     video: {
       width: 640,
       height: 360
     }
 };

 // after opening the stream show the recorder
 connection.onstream = function(e) {
   // add the recorder UI
   video = e.mediaElement;
   video.removeAttribute("controls");
   video.id = 'recorder';
   $("#players").append(video);

   // update UI
   $("#record_button").show();

   // keep track of stream ID
   streamid = e.streamid;
 };

 // open the streams
 connection.open();

 // start recording
 var startRecording = function() {
   // prepare the streams
   connection.streams[streamid].startRecording({
     audio: true,
     bufferSize: 16384,
     video: {
       width: 640,
       height: 360
     },
     canvas: {
       width: 640,
       height: 360
     }
   });

   // update the UI
   $("#play_button").hide();
   $("#upload_button").hide();
   $("#recorder").show();
   $("#video-player").remove();
   $("#audio-player").remove();
   $("#record_button").text("Stop recording");

   // toggle boolean
   recording = true;
 }

 // stop recording
 var stopRecording = function() {
   // init form data
   formData = new FormData();
   // handle both players
   connection.streams[streamid].stopRecording(function (blob) {
     // add player
     var element = document.createElement(blob.recordingType);
     element.id = blob.recordingType + "-player";
     element.src = URL.createObjectURL(blob);
     $("#players").append(element);
     // store blob
     formData.append(blob.recordingType, blob);
   });

   // update UI
   $("#recorder").hide();
   $("#play_button").show();
   $("#upload_button").show();
   $("#record_button").text("Start recording");

   // toggle boolean
   recording = false;
 }

 // handle recording
 $("#record_button").click(function(){
   if (recording) {
     stopRecording();
   } else {
     startRecording();
   }
 });

 // stop playback
 var stopPlayback = function() {
   // controlling
   video = $("#video-player")[0];
   video.pause();
   video.currentTime = 0;
   audio = $("#audio-player")[0];
   audio.pause();
   audio.currentTime = 0;

   // update ui
   $("#play_button").text("Play");

   // toggle boolean
   playing = false;
 }

 // start playback
 var startPlayback = function() {
   // video controlling
   video = $("#video-player")[0];
   video.play();
   audio = $("#audio-player")[0];
   audio.play();
   $("#video-player").bind("ended", stopPlayback);

   // Update UI
   $("#play_button").text("Stop");

   // toggle boolean
   playing = true;
 }

 // handle playback
 $("#play_button").click(function(){
   if (playing) {
     stopPlayback();
   } else {
     startPlayback();
   }
 });

 // Upload button
 $("#upload_button").click(function(){
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200) {
      window.location.href = "/video/"+request.responseText;
    }
  };

   request.open('POST', "/upload");
   request.send(formData);
 });

});