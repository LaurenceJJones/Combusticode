# Combusticode

## App to generate package app file with one time use IV decryption keys

How to use:
1. Run Node app.js to make inital package file
2. Chose either Encrypt or Decrypt module
3. For Encrypt enter a message to be encrypted , For Decrypt enter the secret IV key passed from the sender
4. Encrypt will repackage the file with a .env file to be passed with it. Decrypt will check make sure provided IV is correct if so will output text to terminal then will overwrite .env file with a new private key
