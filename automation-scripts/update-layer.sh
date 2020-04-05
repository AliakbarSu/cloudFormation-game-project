read -p 'layer name: ' layerName
mkdir nodejs
cp -r node_modules ./nodejs
cp -r ./opt/nodejs/* ./nodejs
zip -r nodejs.zip ./nodejs/**
rm -r ./nodejs
aws lambda publish-layer-version --layer-name $layerName --zip-file fileb://nodejs.zip
rm nodejs.zip