import { Configuration,OpenAIApi } from "openai";

import express from 'express';
//import bodyParser from "body-parser";
//import cors from 'cors';
import { api_key,org_key } from "./config.js";

const configuration = new Configuration({
    organization: org_key,
    apiKey: api_key,

});

const openai = new OpenAIApi(configuration);

const app = express();
// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

app.use(express.json());
//app.use(cors());

let history = [
    {role:"system", content: "You are a cow. You reply with moo to every message."}
];

app.post("/completions", async (req, res) => {
    console.log("Request body message: " + req.body.message);
    history.push({ role: "user", content: req.body.message });
    console.log(history)
    const options = {
        method: "POST",
        headers:{
            "Authorization": `Bearer ${api_key}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model : "gpt-3.5-turbo",
            messages: history,
            max_tokens: 100
        })
    }
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        const data = await response.json();
        console.log(data)
        history.push({ role: "assistant", content: data.choices[0].message.content });
        console.log(history)
        res.send(data.choices[0].message);
    } catch (error) {
        console.error(error);
    }
});

app.get("/completions", async (req, res) => {
    res.json({
        response: "Completions backend is up and running, but you cannot use it this way.  You must POST a message body?"
    })
});

app.post("/", async (req, res) => {
    //console.log(history)

    const { messages } = req.body;

    
    console.log(messages);
    const  completion = await openai.createChatCompletion({
        model:"gpt-3.5-turbo",
        messages:[
            {role:"system", content: "You are TutorGPT. You like to give analogies when explaining concepts, and ask follow up questions to reframe and enhance my own thinking. "},
            ...messages
            //{role:"user", content: `${message}`},
        ]
    })

    res.json({
        completion: completion.data.choices[0].message
    })
});

app.get("/", async (req, res) => {
    res.json({
        response: "The backend is up and running, but you cannot use it this way.  You must POST a message body?"
    })
});

app.get('/reset', (req, res) => {
    history = [
        {role: 'system', content: 'You are TutorGTP. You are designed to be a tutor and like to give analogies when explaining concepts, and you reframe and ask follow up questions to enhance the student experience.'}
    ];
    res.send('History reset');
});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
  });


