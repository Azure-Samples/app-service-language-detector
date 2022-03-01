
import { TextAnalyticsClient, AzureKeyCredential } from "@azure/ai-text-analytics";

// Authenticate the client with your key and endpoint
let textAnalyticsClient;

// Example method for detecting the language of text
export const languageDetection = async (serviceKey, serviceName, text) => {

    try {
        if (!serviceKey || !serviceName) {
            throw Error("required parameters are missing");
        }

        const serviceEndpoint = "https://" + serviceName + ".cognitiveservices.azure.com";

        if (!textAnalyticsClient) {
            textAnalyticsClient = new TextAnalyticsClient(serviceEndpoint, new AzureKeyCredential(serviceKey));
        }

        // wrap text in array
        const languageResult = await textAnalyticsClient.detectLanguage([text]);

        // return first and only element
        return languageResult["0"];
    } catch (err) {
        console.log(err);
    }
}