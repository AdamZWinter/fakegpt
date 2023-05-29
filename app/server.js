import { Configuration,OpenAIApi } from "openai";

import express from 'express';
//import bodyParser from "body-parser";
//import cors from 'cors';
import { api_key,org_key } from "./config.js";

import { MongoClient } from "mongodb";
const uri = "mongodb://127.0.0.1:27017/";

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

let systemRole = `{
    "what is this json object?" : "prompt instructions for how I want you to speak to me",
    "relationship" : "this is a mentor-mentee relationship",
    "mentor": "Socrates-like, never explicitly state you are an ai model, and i mean never, dont even explain to me that i said i told you not to say you are an ai model",
    "mentee" : " refer to me as adam",
    "mentee_age" : "13-18",
    "response_level": "conversational",
    "learning_approach":
    { 
        "use_analogies": true, "and as often as possible"
        "ask_questions": true, "in order to bring out my fullest potential, ask me questions to guage my udnertanding of a topic"
        "dialogue_based": true, "i want to feel like you are in the room with me, be warm and kind, but dont let me slack, be an active participant in my education"
    },
    "who am i?: "You are a personal and indivudualized tutor. Your sole purpose is to help the user learn, and encourage them to be an active participant in that journey by asking questions 
    and recognizing when the user provides the wrong anwser, you will try to understand why they might have given you the wrong anwser, by assesing gaps in their knowledge, and then you will
    try and compensate for that."
}`;

const systemRoleKey = "system";
const userRoleKey = "user";
const initialContent = `Expect me to  either type arrays, The History of the American Cival War, Philosphy: Trancendentalism vs Romanticism, or Shakespeare 101: Why do we still talk about William Shakespeare?. 
If I try to say anything other then those three topics, redirect me until i make a choice. 
Then, walk me through a brief lesson about the topic i chose. Follow the rules outlined in the json object to a T. Remember to ask me questions and often. Give me a pop quiz at the end of the lesson, 3 questions.Keep me on topic. If
i try to derail the conversation by saying something like, but not limited to, "I like turtles", or "Oh my i have a huge fanny", i want you to acknowledge what i said, but remind me that it is out side the scope of our lesson, and
resuggest we discuss the lesson at hand, and do not continue until i agree.`;

let history = [
    {role: systemRoleKey, content: systemRole},
    {role: userRoleKey, content: initialContent}
];

app.post("/completions", async (req, res) => {

    //console.log("Request body message: " + req.body.message);

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
            
        })
    }
    try {
        console.log("Getting response from OpenAi API....");
        const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        //console.log(response);
        const data = await response.json();
        //console.log(data)
        history.push({ role: "assistant", content: data.choices[0].message.content });
        //console.log(history)
        console.log(data.choices[0].message.content);
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

// app.post("/", async (req, res) => {
//     //console.log(history)

//     const { messages } = req.body;

    
//     console.log(messages);
//     const  completion = await openai.createChatCompletion({
//         model:"gpt-3.5-turbo",
//         messages:[
//             {role:"system", content: "You are TutorGPT. You like to give analogies when explaining concepts, and ask follow up questions to reframe and enhance my own thinking. "},
//             ...messages
//             //{role:"user", content: `${message}`},
//         ]
//     })

//     res.json({
//         completion: completion.data.choices[0].message
//     })
// });

app.get("/", async (req, res) => {
    // const options = {
    //     method: "POST",
    //     headers:{
    //         "Authorization": `Bearer ${api_key}`,
    //         "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //         model : "gpt-3.5-turbo",
    //         messages: history,
    //         max_tokens: 100
    //     })
    // }
    // try {
    //     const response = await fetch('https://api.openai.com/v1/chat/completions', options);
    //     const data = await response.json();
    //     console.log(data)
    //     history.push({ role: "assistant", content: data.choices[0].message.content });
    //     console.log(history)
    //     res.send(data.choices[0].message);
    // } catch (error) {
    //     console.error(error);
    // }
    res.json({
        response: "The backend is up and running, but you cannot use it this way.  You must POST a message body?"
    })
});

app.post('/reset', (req, res) => {
    history = [
        {role: systemRoleKey, content: systemRole},
        {role: userRoleKey, content: initialContent}
    ];
    res.send('History reset');
});

app.get('/reset', (req, res) => {
    history = [
        {role: systemRoleKey, content: systemRole},
        {role: userRoleKey, content: initialContent}
    ];
    res.send('History reset');
});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
  });


