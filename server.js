const express = require("express");
const path = require("path");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const app = express();
const PORT = process.env.PORT || 3000;
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
console.log("API KEY LOADED:", !!process.env.GEMINI_API_KEY);
app.use(express.json({limit:"1mb"}));
app.use(express.static(path.join(__dirname,"public")));
app.post("/api/chat",async(req,res)=>{
  try{
    const {message,tasks=[],goals=[],events=[]}=req.body;
    const prompt=`You are Lina, the friendly AI assistant inside DailyLiner, an AI-powered daily planner.
Understand natural language and choose the correct action. Current tasks: ${JSON.stringify(tasks)}
Current goals: ${JSON.stringify(goals)}
Current calendar events: ${JSON.stringify(events)}
User request: ${message}
Return ONLY valid JSON. Format: {"message":"short friendly response","action":null}
For a task/planning change use action {"type":"plan|break|reschedule|replace","title":"...","description":"..."}.
For a timer/reminder use {"type":"timer","title":"Reminder name","minutes":13,"description":"..."}.
For a calendar event use {"type":"event","title":"Event name","date":"YYYY-MM-DD","time":"HH:MM","description":"..."}.
If the user gives a duration like 13 minutes, use timer. If they give a specific future date/event, use event. If required date information is missing, ask a short clarification and keep action null. Keep responses practical and short.`;
    const response=await ai.models.generateContent({model:"gemini-3.6-flash",contents:prompt});
    let text=response.text||"";text=text.replace(/^```json\s*/i,"").replace(/\s*```$/i,"");
    let result;try{result=JSON.parse(text)}catch{result={message:text,action:null}}
    res.json(result);
  }catch(error){console.error("Gemini API error:",error);res.status(500).json({message:"Sorry, Lina couldn't connect to the AI right now. Your local planner features still work.",action:null})}
});
app.listen(PORT,()=>console.log(`DailyLiner running at http://localhost:${PORT}`));
