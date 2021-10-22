using System;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Azure;
using Azure.AI.TextAnalytics;
using Microsoft.Extensions.Configuration;

namespace LanguageDetectorApp.Pages
{
    public class IndexModel : PageModel
    {
        public DetectedLanguage? _detectedLanguage;
        private readonly AzureKeyCredential _credentials;
        private readonly Uri _endpoint;

        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ILogger<IndexModel> logger, IConfiguration configuration)
        {
            _logger = logger;
            _credentials = new AzureKeyCredential(configuration["CS_ACCOUNT_KEY"]);
            _endpoint = new Uri(String.Format("https://{0}.cognitiveservices.azure.com/", configuration["CS_ACCOUNT_NAME"]));
        }

        public void OnPost()
        {
            var text = Request.Form["text"];
            var client = new TextAnalyticsClient(_endpoint, _credentials);

            _detectedLanguage = client.DetectLanguage(text);
        }
    }
}
