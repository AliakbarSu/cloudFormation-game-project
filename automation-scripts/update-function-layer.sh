read -p 'function Name: ' functionName 
read -p 'layer arn: ' layerARN
aws lambda update-function-configuration --function-name $functionName --layers $layerARN