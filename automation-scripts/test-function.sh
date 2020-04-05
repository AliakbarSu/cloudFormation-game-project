read -p 'Name of function to test: ' functionName
TEST_FUNCTION_NAME=$functionName DEV=true node ./function-tests/tests.js