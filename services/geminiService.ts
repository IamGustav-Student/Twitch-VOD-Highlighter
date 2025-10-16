import { GoogleGenAI, Type } from "@google/genai";
import type { Highlight } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const highlightSchema = {
    type: Type.OBJECT,
    properties: {
        timestamp: {
            type: Type.STRING,
            description: "The exact timestamp of the highlight in HH:MM:SS format.",
        },
        title: {
            type: Type.STRING,
            description: "A short, catchy title for the highlight (3-6 words).",
        },
        description: {
            type: Type.STRING,
            description: "A brief, one-sentence summary of what happened during the highlight.",
        },
    },
    required: ["timestamp", "title", "description"],
};

export const findVODHighlights = async (
    vodUrl: string, 
    query?: string,
    likedExamples: string[] = [],
    dislikedExamples: string[] = []
): Promise<Highlight[]> => {
    // Note: The model doesn't access the URL. It simulates an analysis based on the prompt.
    
    const basePrompt = `
        Analyze the following Twitch VOD and identify 8 to 10 key highlights.
        The VOD is a long gameplay session.
    `;

    const queryPrompt = query
        ? `Focus specifically on moments that can be described as: "${query}".`
        : `Look for moments of high skill, funny interactions, major game events, or intense team fights.`;

    let feedbackPrompt = '';
    if (likedExamples.length > 0) {
        feedbackPrompt += `\nThe user has previously LIKED highlights like these. Try to find more moments with a similar vibe:\n- ${likedExamples.join('\n- ')}\n`;
    }
    if (dislikedExamples.length > 0) {
        feedbackPrompt += `\nThe user has previously DISLIKED highlights like these. Try to AVOID moments with a similar vibe:\n- ${dislikedExamples.join('\n- ')}\n`;
    }

    const fullPrompt = `
        ${basePrompt}
        ${queryPrompt}
        ${feedbackPrompt}
        
        VOD URL: ${vodUrl}
        
        For each highlight, provide a precise timestamp, a catchy title, and a short description.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: highlightSchema,
                },
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        const highlights: Highlight[] = JSON.parse(jsonText);
        return highlights;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get highlights from Gemini API.");
    }
};