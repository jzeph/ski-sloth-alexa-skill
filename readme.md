# Ski Sloth Alexa skill
This skill provides the current conditions for the Loppet Foundation cross-country ski trails in Minneapolis, MN.

## Devpost Amazon Alexa Skills Challenge
This project is my entry to the Devpost Alexa Multimodal Hackathon.  #AmazonAlexaMultimodalChallenge  
Devpost entry video is at https://youtu.be/fUJPJYfwNNo  

## Why Ski Sloth?
People in Minneapolis, Minnesota love to embrace winter.  #boldnorth!

Unfortunately, the effects of climate change can have a negative impact on our winter activities. This year, snowfall has been minimal, making it hard to just look out the window to check snow conditions. However, even if there is no snow in a skier's backyard, we are lucky enough to have snow-making operations at local parks, making it possible to cross-country ski.

This Alexa skill makes it easy to get the latest conditions for the snow-making trails at Theodore Wirth Park. In addition, this skill uses Alexa Presentation Language to display the current trail webcam image, allowing the latest trail conditions to be shown on many different devices.

## Code
My skill is hosted on AWS Lambda. I use the Axios javascript library to scrape the Minneapolis Park and Rec website to get the trail conditions. Then I use the Cheerio javascript library to parse out the trail details, including the date of the last status update. I let the user indicate the level of detail they'd like and also use Alexa Presentation Language to display the current trail webcam image to users who have an Alexa device with a screen.


### Disclaimer
I built the Ski Sloth project myself as a volunteer and this project is not associated with the Loppet Foundation nor the Minneapolis Park and Recreation Board.