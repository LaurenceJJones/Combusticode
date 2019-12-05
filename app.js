require('dotenv').config();
const fs = require('fs');
const { exec } = require('pkg')
const inquirer = require('inquirer');
const crypto = require('crypto');
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

inquirer
  .prompt([
      {name : 'crypt' , type : "list" , message : "Type?", choices : ['Encrypt' , 'Decrypt']},
      {when : function(res){return res.crypt === 'Encrypt'}, name : 'text' , type : "input" , message : 'Message to encrypt'},
      {when : function(res){return res.crypt === 'Decrypt' && fs.existsSync('./.env')}, name : 'iv' , type : "password" , message : 'Key', validate : function (input){return input.length === iv.toString('hex').length ? true : 'Enter Valid Key'}},
    ])
  .then(answers => {
      if (answers.crypt === 'Encrypt'){
        if (fs.existsSync('./app.js')){
          let en = encrypt(answers);
          console.log(en.iv);
          fs.writeFile(`./.env`, 
          `
          HASH=${JSON.stringify(en.encryptedData)}
          KEY=${JSON.stringify(key.toString('hex'))}
          `, 'utf8', err => {
            if (err) throw err;
        });
        (async () => {await exec([ 'app.js', '--target', 'host', '--output', 'app.exe' ])})()
        }else {
          console.log('Cannot encrypt module not downloaded')
        }
      }else {
        if (process.env.HASH){
          let de = decrypt(answers , process.env.HASH , process.env.KEY);
          if (de){
              console.log(de);
              fs.writeFile(`./.env`, 
              `
              HASH=${JSON.stringify(process.env.HASH)} 
              KEY=${JSON.stringify(key.toString('hex'))}
              `, 'utf8', err => {
              if (err) throw err;
              });
          }
        }else{
          console.log('Nothing to decrypt')
        }
      }
  });

function encrypt(payload) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(payload.text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
   }
   
   function decrypt(payload , hash , dekey) {
    let iv = Buffer.from(payload.iv, 'hex');
    let encryptedText = Buffer.from(hash, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(dekey , 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    try {
        decrypted = Buffer.concat([decrypted, decipher.final()]);
    }catch(error){
        console.log('Key is invalid')
    }
    return decrypted.toString();
   }