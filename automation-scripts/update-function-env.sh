read -p 'function Name: ' functionName
aws lambda update-function-configuration --function-name $functionName --environment fileb://env/$functionName.json