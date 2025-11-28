import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { phase, day, symptoms, moods } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
      You are a helpful women's health assistant.
      The user is in the ${phase} phase (Day ${day} of cycle).
      Recent symptoms: ${symptoms?.join(', ') || 'None'}.
      Recent moods: ${moods?.join(', ') || 'None'}.
      
      Provide 3 short, actionable, and friendly tips for:
      1. Diet/Nutrition
      2. Exercise/Movement
      3. Lifestyle/Self-care
      
      Keep it concise (max 2 sentences per tip). 
      Format the response as a JSON object with keys: "diet", "exercise", "lifestyle".
      Do not include markdown formatting in the JSON keys or values.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks from the response
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const insights = JSON.parse(jsonStr);

        return new Response(JSON.stringify(insights), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('AI Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate insights' }), { status: 500 });
    }
}
