import 'dotenv/config';
import express from 'express';
import * as ejs from 'ejs';
import { languageDetection } from './azure-language-detection.js';

// Create express app
const app = express();

// Establish port
const port = process.env.PORT || 8080;

// Cognitive Services key and app name
const azureCognitiveServicesKey = process.env.CS_ACCOUNT_KEY;
const azureCognitiveServicesName = process.env.CS_ACCOUNT_NAME;

if (!azureCognitiveServicesKey || !azureCognitiveServicesName) throw Error("can't find required environment variables");

// Configure view engine to return HTML
app.set('views', './');
app.set('view engine', 'html');
app.engine('.html', ejs.__express);

// Route
app.get('/', async (req, res) => {

    console.log("home route");

    let text = "";
    let scoreText = "";
    let language = "";
    let confidenceScore = 0;

    if (req.query.text) {

        text = (req.query.text);
        console.log(text);

        // get Cognitive Services key from Key Vault
        const results = await languageDetection(azureCognitiveServicesKey, azureCognitiveServicesName, text);
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

    }
    res.render('./index.ejs', {
        language: language,
        score: confidenceScore,
        scoreText,
        text
    });



});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})