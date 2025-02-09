import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");

export async function POST(request) {
    try {
        const { message} = await request.json();
        if (!message) {
            
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


        const prompt = `the following is the data of prople who are tracking shared expenses give summary and tips and observationa about their expendeture. the data will usually be very limited , just give some fun suggestions dont take it too seriously. give the response in plain paragraph no headings or tables ${message}`;

        const result = await model.generateContent(prompt);
        let aiResponse = result.response.text().trim();

        console.log(aiResponse);

        return NextResponse.json({ aiResponse }, { status: 200 });
    } catch (error) {
        console.error("Gemini API Error:", error.response?.data || error.message);
        return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
    }
}