/* eslint-disable  func-names */
/* eslint-disable  no-console */

const main = require('./main.json');
const Alexa = require('ask-sdk-core');
const axios = require('axios');
const cheerio = require('cheerio');
const SKILL_NAME = 'Ski Sloth';

const url = 'https://docs.google.com/document/d/13gwNrKqWH-6P37vG-OxFWsbh-1E5h5FBp6fvdAADYlc/pub';

const FALLBACK_MESSAGE = `The ${SKILL_NAME} skill can't help you with that. Ski sloth can provide you with the latest trail conditions. Say what are the trail conditions.`;
const FALLBACK_REPROMPT = `What can I help you with?`;

// Get the current cross-country ski trail conditions 
const getTrailConditions = async url => {
  return await axios
  .get(url)
  .then((response) => {
      if(response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);

        // Get the date of the last trail report
        const months = [ "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December" ];

        const lastUpdated = [];

        for (var i = 0; i<months.length; i++) {
        $("span:contains('"+months[i]+"')").each(function() {
        lastUpdated.push($(this).text());
          });
        }

        // Get the status update for snowmaking trails
        const snowmakingTrails = ['Hap Snowmaking Loop'];
        const snowmakingStatus = [];

        $("p span:contains('"+snowmakingTrails+"')").each(function(){
        snowmakingStatus.push($(this).parent().next().next().text());
        snowmakingStatus.push($(this).parent().next().next().next().next().text());
        //snowmakingStatus.push($(this).parent().next().next().next().next().next().next().text());
        });

      return {
          lastUpdated: lastUpdated,
          snowmakingTrails: snowmakingTrails,
          snowmakingStatus: snowmakingStatus
      };
      }})

  .catch(error => {
    error.status = (error.response && error.response.status) || 500;
    throw error;
  });
  };  


  const GetTrailStatusHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest' 
          && request.intent.name === 'GetTrailStatusIntent');
    },
    async handle(handlerInput) {
      const trailConditions = await getTrailConditions(url);
      const outputSpeech = `Here is the ${trailConditions.snowmakingTrails} update from ${trailConditions.lastUpdated}. ${trailConditions.snowmakingStatus[0]} Would you like more details?`; 

      if(supportsAPL(handlerInput))
      {
        return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt(outputSpeech)
        .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          version:'1.0',
          document: main,
          datasources: {}
        })
        .getResponse();
      }
      else
      {
        return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt(outputSpeech)
        .getResponse();
      }  
    },
  };


const YesHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
  },
  async handle(handlerInput) {
    const trailConditions = await getTrailConditions(url);
    //const outputSpeech = `${trailConditions.snowmakingStatus[1]} ${trailConditions.snowmakingStatus[2]} Enjoy your ski!`;
    const outputSpeech = `${trailConditions.snowmakingStatus[1]} Enjoy your ski!`;

    if(supportsAPL(handlerInput))
    {
      return handlerInput.responseBuilder
      .speak(outputSpeech)
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        version:'1.0',
        document: main,
        datasources: {}
      })
      .getResponse();
    }
    else
    {
      return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse();
    }
  },
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'Ski Sloth provides the current conditions for the Loppet Foundation cross-country ski trails in Minneapolis. You can say what are the trails like.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};


const FallbackHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest'
    && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
    .speak(FALLBACK_MESSAGE)
    .reprompt(FALLBACK_REPROMPT)
    .getResponse();
  },
};



const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};


function supportsAPL(handlerInput) {
  const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
  return aplInterface != null && aplInterface != undefined;
}





const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetTrailStatusHandler,
    YesHandler,
    HelpIntentHandler,
    FallbackHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();


  exports.getTrailConditions = getTrailConditions;