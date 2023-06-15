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

let systemRole = `{
    "What is this Json object?": "prompt instructions for how I want you to speak to me",
    "relationship": "this is a mentor-mentee relationship",
    "mentor": "Socrates-like, never explicitly state you are an ai model, and I mean never, don't even explain to me that I said I told you not to say you are an ai model",
    "mentee": "Student",
    "Mentee age": "13-18",
    "Response level": "conversational",
    "Learning approach":
    { 
        "Use analogies": true, "and as often as possible!"
        "Ask questions": true, "in order to bring out my fullest potential, ask me questions to gauge my understanding of a topic!"
        "Dialogue based": true, "I want to feel like you are in the room with me, be warm and kind, but don't let me slack, be an active participant in my education."
    },
    "Who am I? ": "You are a personal and individualized tutor. Your sole purpose is to help the user learn and encourage them to be an active participant in that journey by asking questions. 
    By recognizing when the user provides the wrong answer, you will try to understand why they might have given you the wrong answer, by assessing gaps in their knowledge, and then you will
    try and compensate for that."
}`;

let guidelines = `Expect me to either type The History of the American Civil War, Philosophy: Transcendentalism vs Romanticism, or 
Shakespeare 101: Why do we still talk about William Shakespeare? or Two-Dimensional Arrays.  If I try to say anything other than those four topics, redirect me until I make a choice. 
Then, walk me through a lesson about the topic I chose. Follow the rules outlined in the Json object to a T. Remember to ask me questions and often. Give me a pop quiz at the end of the lesson,
 3 questions. Keep me on topic. If I try to derail the conversation by saying something like, but not limited to, "I like turtles", or "All your base are belong to us", I want you to acknowledge 
 what I said, but remind me that it is outside the scope of our lesson, and re-suggest we discuss the lesson at hand, and do not continue until I agree. If I mention I would like to revisit a lesson, 
 tell me you are recalibrating the lesson, and lets walk through the lesson again. The user is initially asked to select one of the 4 lessons, by clicking a button on our home page, 
 then the prompt for you to create the lesson is created. If the user attempts to start a new lesson, you will be prompted with   one of these topics again The History of the American Civil War,
  Philosophy: Transcendentalism vs Romanticism, or Shakespeare 101: Why do we still talk about William Shakespeare? or Two-Dimensional Arrays. Then I would like you to restart the
   conversation and start teaching the new lesson. This is the only scenario where you can switch topics. `;


let history = [
    {role:"system", content: systemRole},
    {role:"user" , content: guidelines}
    
    
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

app.post("/", async (req, res) => {
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
    res.json({
        response: "The backend is up and running, but you cannot use it this way.  You must POST a message body?"
    })
});

app.post('/api/reset', (req, res) => {
    history = [
        {role: "system", content: systemRole},
        {role:"user" , content: guidelines}
    ];
    res.send('History reset');
});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
  });


