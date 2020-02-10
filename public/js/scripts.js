var context = {};
function updateChatLog(user, message) {
  if (message) { 
    var div = document.createElement("div");
    if (user === 'Watson') {
      div.className = 'assistant'; 
    } else {
      div.className = 'wa-user';
    } 
    div.innerHTML = "<b>" + user + ":</b> " + message + "<br/>";
    document.getElementById("history").appendChild(div); 
    document.getElementById("text").value = ""; 
  } 
}

function strip_html_tags(str) {
  if ((str===null) || (str===''))
    return false;
  else
   str = str.toString();
  return str.replace(/<[^>]*>/g, '');
}

function sendMessage() { 
  var text = document.getElementById("text").value; 
  updateChatLog("You", text); 
  var payload = {}; 
  if (text) { 
    payload.input = {"text": text};
  };
  if (context) {
    payload.context = context;
  }; 
  var xhr = new XMLHttpRequest(); 
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) { 
        var json = JSON.parse(xhr.responseText); 
        context = json.context;
        const genericRes = json.result.output.generic.filter(el => el.response_type === "text" || el.response_type === "search");
        if (genericRes[0].response_type === "text") {
          let plainText = strip_html_tags(genericRes[0].text).replace(/&.*;/, '');
          updateChatLog("Watson", plainText);
          console.log(plainText);
          if (document.getElementById('checkSpeech').checked)
            speak(plainText);
        } else {
          let title = "<b>" + json.result.output.generic[0].results[0].title + "</b><br/>";
          let passage = title.concat(json.result.output.generic[0].results[0].body.substring(0, 100)).concat(' ...');
          updateChatLog("Watson", passage);
          if (document.getElementById('checkSpeech').checked)
            speak(passage);
        }   
      } else {  // the session may be expired
        var json = JSON.parse(xhr.responseText);
        var errText = json.code + " - " + json.message + " - Reload page for new session (timeout 5 min)";
        updateChatLog("Watson",  errText);

      }
    }
  }
  xhr.open("POST", "./", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify(payload)); 
}

function init() {
  document.getElementById("text").addEventListener("keydown", function(e) {
    if (!e) {
      var e = window.event;
    }
    if (e.keyCode == 13) {
      sendMessage();
    } 
  }, false); 
  sendMessage(); 
} 

// Grab input from microphone and transform it to text
function getSpeech() {
  var btn = document.getElementById("btnSpeech");
  btn.className = 'btn btn-danger';
  fetch('/api/speech-to-text/token')
    .then(function(response) {
      return response.json();
    }).then(function (token) {
      var stream = WatsonSpeech.SpeechToText.recognizeMicrophone(Object.assign(token, {
        model: 'en-US_BroadbandModel',
        outputElement: '#text' // CSS selector or DOM Element
      }));

      stream.on('data', function(data) {
        if(data.results[0] && data.results[0].final) {
          stream.stop();
          btn.className = 'btn btn-primary';
          console.log('stop listening.');
        }
      });

      stream.on('error', function(err) {
        console.log(err);
      });

    }).catch(function(error) {
      console.log(error);
    });
}

// Automatically speek, when there is an result from Watson Assistant
function speak(message) {
  fetch('/api/text-to-speech/token')
    .then(function(response) {
      return response.json();
    })
    .then(function(token) {
      const audio = WatsonSpeech.TextToSpeech.synthesize(Object.assign(token, {
        text: message
      }));
      audio.onerror = function(err) {
        console.log('audio error: ', err);
      };
    });
}