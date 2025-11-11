import { GoogleGenAI, Type } from "@google/genai";
import { AgenticResponse, CustomerData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        churn_probability: {
            type: Type.NUMBER,
            description: "A probability score between 0.0 and 1.0 indicating the likelihood of the customer churning.",
        },
        risk_level: {
            type: Type.STRING,
            enum: ["VERY_LOW", "LOW", "MEDIUM", "HIGH"],
            description: "A categorical risk level based on the churn probability.",
        },
        urgency: {
            type: Type.STRING,
            enum: ["ROUTINE", "WITHIN_WEEK", "WITHIN_24_HOURS", "IMMEDIATE"],
            description: "The urgency for intervention based on the risk level.",
        },
        key_factors: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
            description: "A list of the top 3-5 key factors influencing the churn prediction, phrased as concise statements.",
        },
        recommended_actions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    action: {
                        type: Type.STRING,
                        description: "A specific, actionable recommendation to mitigate churn risk.",
                    },
                    channel: {
                        type: Type.STRING,
                        description: "The recommended communication channel for this action (e.g., Phone Call, Email, SMS).",
                    },
                    priority: {
                        type: Type.STRING,
                        enum: ["Low", "Medium", "High", "Critical"],
                        description: "The priority level for executing this action.",
                    },
                },
                required: ["action", "channel", "priority"],
            },
            description: "A list of personalized retention actions tailored to the customer's profile and risk level.",
        },
    },
    required: ["churn_probability", "risk_level", "urgency", "key_factors", "recommended_actions"],
};

export const getAgenticChurnPrediction = async (customerData: CustomerData): Promise<AgenticResponse> => {
    const prompt = `
        You are an expert AI agent specializing in customer churn prediction for a telecommunications company.
        Your task is to analyze the following customer data and provide a detailed churn risk assessment.
        Based on the data, you must generate a churn probability, classify the risk, determine the urgency, identify key contributing factors, and recommend personalized retention actions.

        Customer Data:
        ${JSON.stringify(customerData, null, 2)}

        Please provide your analysis in the specified JSON format.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        
        // Basic validation
        if (
            typeof parsedResponse.churn_probability !== 'number' ||
            !Array.isArray(parsedResponse.key_factors) ||
            !Array.isArray(parsedResponse.recommended_actions)
        ) {
            throw new Error("Invalid response structure from Gemini API");
        }
        
        return parsedResponse as AgenticResponse;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Re-throw the error to be handled by the calling component
        throw error;
    }
};