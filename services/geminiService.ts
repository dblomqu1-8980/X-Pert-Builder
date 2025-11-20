import { GoogleGenAI, Type } from "@google/genai";
import { TweetStyle, PostType, GeneratedResult, TweetOption } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTweets = async (
  request: { topic: string; style: TweetStyle; type: PostType; useSearch: boolean }
): Promise<GeneratedResult> => {
  
  const isThread = request.type === PostType.THREAD;
  
  const systemInstruction = `
    You are a world-class social media manager specializing in building "AI Expert" personal brands on X (Twitter).
    Your goal is to create high-engagement content that makes the user look knowledgeable, ahead of the curve, and articulate.
    
    STRICT RULES:
    1. No hashtags unless explicitly relevant (max 1).
    2. Keep single tweets under 280 characters.
    3. For threads, ensure the first tweet is a "hook" and subsequent tweets flow logically.
    4. Adopt the requested persona strictly.
    5. Do not use emojis excessively. Use them strategically.
  `;

  const prompt = `
    Topic: "${request.topic}"
    Style: ${request.style}
    Format: ${request.type}

    Create 3 distinct variations of content based on this topic.
    ${isThread ? 'Each variation should be a thread of 3-5 tweets.' : 'Each variation should be a single tweet.'}
    
    Explain briefly why you chose this angle for each variation.
  `;

  // MODE 1: Search Enabled (Grounding)
  // Constraint: When using tools: [googleSearch], we CANNOT use responseMimeType: 'application/json'
  if (request.useSearch) {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt + `
        \nSince you cannot return JSON, please format your response strictly as follows:
        
        VARIATION_START
        CONTENT_START
        [Tweet 1 text]
        [Tweet 2 text if thread...]
        CONTENT_END
        REASONING: [Brief explanation]
        VARIATION_END
        
        Repeat for 3 variations. Do not add markdown code blocks.
      `,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web !== undefined) || [];

    // Manual parsing of the text response because we couldn't use JSON schema with search
    const options: TweetOption[] = [];
    const variations = text.split("VARIATION_START");

    for (const v of variations) {
      if (!v.trim()) continue;
      
      const contentPart = v.split("CONTENT_START")[1]?.split("CONTENT_END")[0];
      const reasoningPart = v.split("REASONING:")[1]?.split("VARIATION_END")[0];

      if (contentPart) {
        const tweets = contentPart
          .split("\n")
          .map(t => t.trim())
          .filter(t => t.length > 0 && !t.startsWith("[") && !t.startsWith("]")); // Basic cleanup

        options.push({
          content: tweets,
          reasoning: reasoningPart ? reasoningPart.trim() : "Generated based on search results."
        });
      }
    }

    return { options, sources };
  } 
  
  // MODE 2: No Search (Pure Creative/JSON)
  // We can use responseSchema here for perfect structure
  else {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  content: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Array of strings. If single tweet, only 1 item. If thread, multiple items."
                  },
                  reasoning: { type: Type.STRING }
                },
                required: ["content", "reasoning"]
              }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "{\"variations\": []}");
    return {
      options: json.variations,
      sources: []
    };
  }
};