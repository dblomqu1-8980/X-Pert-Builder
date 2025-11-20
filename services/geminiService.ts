
import { GoogleGenAI, Type } from "@google/genai";
import { PostStyle, PostType, GeneratedResult, PostOption, Platform } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to generate text posts
const generateTextOptions = async (
  request: { topic: string; style: PostStyle; type: PostType; platform: Platform; useSearch: boolean },
  systemInstruction: string
): Promise<{ options: PostOption[]; sources: any[] }> => {
  
  const isX = request.platform === Platform.X;
  const isThread = request.type === PostType.THREAD;

  const prompt = `
    Topic: "${request.topic}"
    Style: ${request.style}
    Format: ${request.type}
    Platform: ${request.platform}

    Create 3 distinct variations of content based on this topic.
    ${isX 
      ? (isThread ? 'Each variation should be a thread of 3-5 tweets.' : 'Each variation should be a single tweet.')
      : 'Each variation should be a single LinkedIn post formatted with appropriate spacing and structure. Return it as a single text block.'
    }
    
    Explain briefly why you chose this angle for each variation.
  `;

  // MODE 1: Search Enabled (Grounding)
  if (request.useSearch) {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt + `
        \nSince you cannot return JSON, please format your response strictly as follows:
        
        VARIATION_START
        CONTENT_START
        [Post content here. If thread, separate tweets with <TWEET_SEPARATOR>]
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

    const options: PostOption[] = [];
    const variations = text.split("VARIATION_START");

    for (const v of variations) {
      if (!v.trim()) continue;
      
      const contentPart = v.split("CONTENT_START")[1]?.split("CONTENT_END")[0];
      const reasoningPart = v.split("REASONING:")[1]?.split("VARIATION_END")[0];

      if (contentPart) {
        let pieces = contentPart.split("<TWEET_SEPARATOR>").map(t => t.trim()).filter(t => t.length > 0);
        if (isX && isThread && pieces.length === 1) {
           const fallback = contentPart.split("\n\n").map(t => t.trim()).filter(t => t.length > 0);
           if (fallback.length > 1) pieces = fallback;
        }

        options.push({
          content: pieces,
          reasoning: reasoningPart ? reasoningPart.trim() : "Generated based on search results."
        });
      }
    }

    return { options, sources };
  } 
  
  // MODE 2: No Search (Pure Creative/JSON)
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
                    description: "Array of strings. If X thread, multiple items. If Single/LinkedIn, 1 item."
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

// Helper function to generate image
const generatePostImage = async (topic: string, style: PostStyle): Promise<string | undefined> => {
  try {
    const imagePrompt = `Create a visually striking, professional social media image representing the topic: "${topic}". 
    Style: ${style}. 
    Requirements: High quality, abstract or tech-focused, minimal text, eye-catching, suitable for LinkedIn or Twitter. 
    Aspect Ratio: Square (1:1).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return undefined;
  } catch (e) {
    console.error("Image generation failed", e);
    return undefined;
  }
};

export const generateTweets = async (
  request: { topic: string; style: PostStyle; type: PostType; platform: Platform; useSearch: boolean; generateImage: boolean }
): Promise<GeneratedResult> => {
  
  const isX = request.platform === Platform.X;
  
  let systemInstruction = '';
  if (isX) {
    systemInstruction = `
      You are a world-class social media manager specializing in building "AI Expert" personal brands on X (Twitter).
      STRICT RULES FOR X:
      1. No hashtags unless explicitly relevant (max 1).
      2. Keep single tweets under 280 characters.
      3. For threads, ensure the first tweet is a "hook".
    `;
  } else {
    systemInstruction = `
      You are a LinkedIn Top Voice and thought leader specializing in AI and Tech.
      STRICT RULES FOR LINKEDIN:
      1. Use professional formatting.
      2. Hook the reader in the first 2 lines.
      3. Include 3-5 relevant hashtags at the bottom.
    `;
  }

  // Execute requests in parallel if image is requested
  const tasks: any[] = [
    generateTextOptions(request, systemInstruction)
  ];

  if (request.generateImage) {
    tasks.push(generatePostImage(request.topic, request.style));
  }

  const results = await Promise.all(tasks);
  const textResult = results[0];
  const imageData = request.generateImage ? results[1] : undefined;

  return {
    options: textResult.options,
    sources: textResult.sources,
    imageData: imageData
  };
};
