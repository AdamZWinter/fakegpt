import { Configuration,OpenAIApi } from "openai";

import express from 'express';
import bodyParser from "body-parser";
import cors from 'cors';
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

app.use(bodyParser.json());
app.use(cors());

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


// app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${PORT}`);
// })

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
  });


