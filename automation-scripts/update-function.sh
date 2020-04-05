read -p 'function Name: ' functionName 
read -p 'filename: ' fileName
zip $fileName.zip $fileName.js
aws lambda update-function-code --function-name $functionName --zip-file fileb://$fileName.zip
aws lambda update-function-configuration --function-name $functionName --handler $fileName.handler
rm $fileName.zip