'use strict';

var _ = require("lodash");
var ejs = require("ejs");
// var fs = require('fs');
const aws = require('aws-sdk');
aws.config.update({region:'eu-west-1'});

const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const ses = new aws.SES({ apiVersion: '2010-12-01'});

var getDate = (day) => {
  var today = new Date();
  var anotherDay = new Date();
  var day = day || 0
  anotherDay.setDate(today.getDate() + day);
  return anotherDay.toLocaleDateString('en-GB');
}

var isAday = (date, day) => {
  var today = new Date();
  var anotherDay = new Date();
  var day = day || 0
  anotherDay.setDate(today.getDate() + day);
  return date.toLocaleDateString('en-GB') === anotherDay.toLocaleDateString('en-GB')
}


exports.handler = (event, context, callback) => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };
    s3.getObject(params, (err, data) => {
        if (err) {
            callback("Error getting object: " + params + ", with error: "+ err);
        } else {
          const indexHtml = data.Body.toString('utf-8');

          const emailParams = {
                Destination: {
                    ToAddresses: ["uncini.michel@gmail.com"]
                },
                Message: {
                    Body: {
                        Html: {
                            Data: indexHtml
                        }
                    },
                    Subject: {
                        Data: "Surfing email!!!!!"
                    }
                },
                Source: "uncini.michel@gmail.com"
            };
              console.log('===SENDING EMAIL===');
              var email = ses.sendEmail(emailParams, (err, data) => {
                  if(err) {
                    console.log("Error during sending email", err);
                  }
                  callback(null, data);
                  console.log('EMAIL: sent');
              });
        }
    });
};

//Test:
const p  = require("./index.js")
const event = {
  Records : [{
    s3:{
      bucket:{
        name: "com.surfing.website"
      },
      object: {
        key: "index.html"
      }
    }
  }]
}

p.handler(event, null, (err) => console.log(err))
