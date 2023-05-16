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

app.post("/completions", async (req, res) => {
    console.log("Request body message: " + req.body.message);
    const options = {
        method: "POST",
        headers:{
            "Authorization": `Bearer ${api_key}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model : "gpt-3.5-turbo",
            messages: [{ role: "user", content: req.body.message}],
            max_tokens: 100,
        })
    }
    try {
        //console.log(options);
        const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        const data = await response.json();
        res.send(data);
        //res.send(JSON.stringify({backendSays: "front end sent the following", respnose: req.body.message}));
    } catch (error) {
        console.error(error);
        //console.log(options);
    }

});

app.get("/completions", async (req, res) => {
    res.json({
        response: "Completions backend is up and running, but you cannot use it this way.  You must POST a message body?"
    })
});

app.post("/", async (req, res) => {

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




app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
  });


