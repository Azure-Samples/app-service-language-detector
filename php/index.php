<?php

$cs_key = getenv('CS_ACCOUNT_KEY');
$cs_name = getenv('CS_ACCOUNT_NAME');

if (substr($cs_key, 0, 20) === '@Microsoft.KeyVault(' or substr($cs_name, 0, 20) === '@Microsoft.KeyVault(')
{
    // Key Vault reference failed to resolve.
        header('HTTP/1.1 500 Internal Server Error');
        echo '<h1>HTTP/1.1 500: Error resolving Key Vault references!</h1>';
        exit;
}

if (!empty($_GET['text'])) {
    $text = urldecode($_GET['text']);
    $payload = [
        'documents' => array([
            'id' => '1',
            'text' => $text
        ])
    ];
    $json_payload = json_encode($payload);

    $options = array(
        'http'=>array(
          'method'=>"POST",
          'header'=>"Ocp-Apim-Subscription-Key: " . $cs_key . "\r\n" .
                    "Content-Type: application/json\r\n" .
                    "Accept: application/json\r\n" .
                    "Connection: close\r\n" .
                    "Content-length: " . strlen($json_payload) . "\r\n",
          'content'=>$json_payload
        )
      );

    $context = stream_context_create($options);
    $cs_text_api_url = 'https://' . $cs_name . '.cognitiveservices.azure.com/text/analytics/v3.0/languages';
    $detection_result = file_get_contents($cs_text_api_url, false, $context);

    if ($detection_result === false) {
        header('HTTP/1.1 500 Internal Server Error');
        echo '<h1>HTTP/1.1 500: Error accessing the Cognitive Services endpoint!</h1>';
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <title>Language detector</title>
</head>
<body>
<h3>Language detector</h3>
<form action="" method="get">
    <input type="text" name="text" value="<?php echo $text;?>"/>
    <button type="submit">Detect</button>
</form>
<br/>
<?php
    if (!empty($detection_result)) {
        $json_result = json_decode($detection_result);
        $detected_language = $json_result->documents[0]->detectedLanguage->name;
        $confidence_score = $json_result->documents[0]->detectedLanguage->confidenceScore;
        if ($confidence_score > 0.9) {
            echo '<div><strong>I am quite sure this is: ' . $detected_language . '</strong></div><br/>';
        } elseif ($confidence_score == 0) {
            echo '<div><strong>I have no clue - type in some more text</strong></div><br/>';
        } elseif ($confidence_score < 0.3) {
            echo '<div><strong>Here is a wild guess: ' . $detected_language . '</strong></div><br/>';
        } else
        {
            echo '<div><strong>I could be wrong, but it sounds a bit like: ' . $detected_language . '</strong></div><br/>';
        }

        echo '<span style="color:white">Raw: ' . $detection_result . '</span><br/>';
    }
?>
</body>
</html>
