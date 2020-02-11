var config = { 
  watson: {
   assistant: { 
      iam_apikey: "<yourApiKey>", 
      version: "2019-02-28",
      url: "yourServiceUrl",
      assistantId: "<yourAssistantId>" 
    },
    discovery: {
      version: "2019-04-30",
      iam_apikey: "<yourApiKey>B",
      url: "<your service url>"
    },
    discoveryEnv: {
      collectionId: "<collectionId>",
      environmentId: "<environmentId>"
    },
    speechToText: {
      url: "<yourServiceUrl>",
      iam_apikey: "<yourApiKey>"
    },
    textToSpeech: {
      url: "<yourServiceUrl>",
      iam_apikey: "<yourApiKey>"
    }
  } 
}; 
module.exports = config;

/**** service with userid and password - deprecated
 * const config = { 
  watson: {
    assistant: { 
      username: "<yourServiceUsername>", 
      password: "<yourServicePassword>", 
      version: "2019-02-28",
      url: "yourServiceUrl",
      assistantId: "<yourAssistantId>" 
    } 
  } 
}; 
module.exports = config;
 */