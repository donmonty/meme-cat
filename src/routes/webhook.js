const express = require("express");
const axios = require("axios");
const selectContent = require("../utils/selectContent");

const router = express.Router();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;


// Routes
router.post("/", (req, res) => {
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      const sender_psid = webhook_event.sender.id;
      console.log(`Sender PSID: ${sender_psid}`);

      // Check we are receiveng a message
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

router.get("/", (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQYXR5IiwibmFtZSI6Ik1hZ2ljIEphciIsImlhdCI6MTUxNjIzOTAyMn0.J6Z6dPuHD2mH1sfTR7nDv4ljwKe3jMBYFUTS6lgqaL0"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});


// Functions
function handleMessage(sender_psid, received_message) {
  let response;
  if (received_message.text) {
    // response = {
    //   "text": `Tu mensaje fue: ${received_message.text}`
    // }

    const content = selectContent();
    response = {
      text: content.url
    }
  }
  callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, postback) {
  return
}

async function callSendAPI(sender_psid, response) {
  const requestBody = {
    recipient: {
      id: sender_psid
    },
    message: response
  };

  try {
    await axios({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      method: "POST",
      params: {
        access_token: PAGE_ACCESS_TOKEN
      },
      data: requestBody
    })
  } catch (error) {
    console.log('Could not send message!')
  }

}

module.exports = router;