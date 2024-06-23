const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = 'EABqGzZBCrF6UBO4eZBaI4ADWzWM0ycxV7RADMEDI9ebSK0BHPREfQufbxohzML7k29AQZCx6DSgkZCRP42iu7oycMWjfaB2OnHNyr3uTZBLqlRH6ZCrGhntSFgw7OGTJTbSGxEmUeW1WSegJmWlrB4nHD55uIAZAR7M6VpuGb8knezC60e44lVJ0vZCU6P7zJywhqgZDZD';
const VERIFY_TOKEN = '97796660689942706921447923532971';

// Webhook verification
app.get('/webhook', (req, res) => {
    console.log('hello')
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook verified');
            return res.status(200).send(challenge);
        } else {
           return  res.sendStatus(403);
        }
    }
    res.sendStatus(403)
});
app.get('/hello', (req, res) => {
    res.json({code:200,status:'success',data:'hello world'})
});

// Handling incoming messages
app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            const webhookEvent = entry.messaging[0];
            const senderPsid = webhookEvent.sender.id;

            if (webhookEvent.message && webhookEvent.message.text) {
                handleMessage(senderPsid, webhookEvent.message);
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

function handleMessage(senderPsid, receivedMessage) {
    let response;

    if (receivedMessage.text) {
        const productId = receivedMessage.text;
        response = getVariants(productId);
    }

    callSendAPI(senderPsid, response);
}

function getVariants(productId) {
    const variants = [
        { title: "Variant 1", payload: "VARIANT_1" },
        { title: "Variant 2", payload: "VARIANT_2" }
    ];

    return {
        text: "Please choose a variant:",
        quick_replies: variants.map(variant => ({
            content_type: "text",
            title: variant.title,
            payload: variant.payload
        }))
    };
}

function callSendAPI(senderPsid, response) {
    const requestBody = {
        recipient: { id: senderPsid },
        message: response
    };

    request({
        uri: 'https://graph.facebook.com/v12.0/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: requestBody
    }, (err, res, body) => {
        if (!err) {
            console.log('Message sent!');
        } else {
            console.error('Unable to send message:' + err);
        }
    });
}

app.listen( 5000, () => console.log('Webhook is listening'));
