const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator, IamTokenManager } = require('ibm-watson/auth');
const config = require('../config');

const watsonAssistant = new AssistantV2({
  version: config.watson.assistant.version,
  authenticator: new IamAuthenticator({
    apikey: config.watson.assistant.iam_apikey
  }),
  url: config.watson.assistant.url
});

let assistantSessionId = null;

exports.getIndex = (req, res, next) => {
  watsonAssistant.createSession({
    assistantId: config.watson.assistant.assistantId
  })
  .then(result => {
    assistantSessionId = result.result.session_id,
    res.render('index');
  })
  .catch(err => {  
      res.status(404).json(err);
  })
}

const sttAuthenticator = new IamTokenManager({
  apikey: config.watson.speechToText.iam_apikey
});

const ttsAuthenticator = new IamTokenManager({
  apikey: config.watson.textToSpeech.iam_apikey
});

exports.postMessage = (req, res, next) => {
  let text = "";
  if (req.body.input) {
    text = req.body.input.text;
  }
  watsonAssistant.message({
    assistantId: config.watson.assistant.assistantId,
    sessionId: assistantSessionId,
    input: {
      'message_type': 'text',
      'text': text
    }
  })
  .then(assistantResult => {
     if (text === "") {
    return res.json(assistantResult);
  }
  console.log("Detected input: " + text);
  if (assistantResult.result.output.intents.length > 0) {
    var intent = assistantResult.result.output.intents[0];
    console.log("Detected intent: " + intent.intent);
    console.log("Confidence: " + intent.confidence);
  }
  if (assistantResult.result.output.entities.length > 0) {
    var entity = assistantResult.result.output.entities[0];
    console.log("Detected entity: " + entity.entity);
    console.log("Value: " + entity.value);
    if ((entity.entity === 'help') && (entity.value === 'time')) {
      var msg = 'The current time is ' + new Date().toLocaleTimeString();
      console.log(msg);
      assistantResult.result.output.generic[0].text = msg;
    }
  } 
  //console.log(JSON.stringify(assistantResult, null, 2));
    res.json(assistantResult);  // just returns what is received from assistant
  })
  .catch(err => {   // after 5 minutes of inactivity the session is expired
      res.status(404).json(err);
  })
}

exports.getSttToken = (req, res, next) => {
  return sttAuthenticator
    .requestToken()
    .then(({ result }) => {
      res.json({ accessToken: result.access_token, url: config.watson.speechToText.url });
    })
    .catch(console.error);
}

exports.getTtsToken = (req, res, next) => {
  return ttsAuthenticator
    .requestToken()
    .then(({ result }) => {
      res.json({ accessToken: result.access_token, url: config.watson.textToSpeech.url });
    })
    .catch(console.error);
}