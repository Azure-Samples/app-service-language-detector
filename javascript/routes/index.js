var express = require('express');
var router = express.Router();

const TextAnalytics = require("@azure/ai-text-analytics");
const azureCognitiveServicesKey = process.env.CS_ACCOUNT_KEY;
const azureCognitiveServicesName = process.env.CS_ACCOUNT_NAME;

// Example method for detecting the language of text
async function languageDetection(text) {

  if(!text) return {};

  const textAnalyticsClient = new TextAnalytics.TextAnalyticsClient(
    `https://${azureCognitiveServicesName}.cognitiveservices.azure.com`, new TextAnalytics.AzureKeyCredential(azureCognitiveServicesKey));

  // wrap text in array
  const languageResult = await textAnalyticsClient.detectLanguage([text]);

  // return first and only element
  const firstDetection = languageResult["0"];

  return firstDetection;
}

/* GET home page. */
router.get('/', async function (req, res, next) {


  try {

    let text = "";
    let scoreText = "";
    let language = "";
    let confidenceScore = 0;

    if (req.query.text) {

      if (!azureCognitiveServicesKey || !azureCognitiveServicesName) {
        return res.render('./index.ejs', {
          language: null,
          text: "",
          error: "Required key and service name are missing"
        });
      }

      // get Cognitive Services key from Key Vault
      const results = await languageDetection(req.query.text);

      if(results && results.primaryLanguage){
        language = results.primaryLanguage.name;
        confidenceScore = results.primaryLanguage.confidenceScore;

        if (confidenceScore > 0.9) {
          scoreText = "very confident";
        } else if (0 > confidenceScore < 0.3) {
          scoreText = "not confident";
        } else if (0.9 > confidenceScore > 0.3) {
          scoreText = "somewhat confident - need more text in this language"
        } else if (confidenceScore === 0) {
          scoreText = "no confidence"
        } else {
          scoreText = "--"
        }
        return res.render('./index.ejs', {
          language: language,
          score: confidenceScore,
          scoreText,
          text: req.query.text,
          error: null
        });
      }
    } 

    return res.render('./index.ejs',{text: "", language: null, error: null});
  } catch (err) {
    return res.render('./error.ejs',{message: err.message, error: err});
  }


});

module.exports = router;
