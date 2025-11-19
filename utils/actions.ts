'use server'

import { sendWithRetry } from '@/utils/AiModel'
import { db } from '@/utils/db'
import { AiOutput } from '@/utils/schema'

function stripRtf(text: string): string {
  // Remove RTF formatting if present
  if (text.startsWith('{\\rtf')) {
    // Find the last closing brace
    let braceCount = 0;
    let endIndex = -1;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') braceCount++;
      else if (text[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }
    if (endIndex !== -1) {
      // Extract content after the RTF header
      const rtfContent = text.substring(text.indexOf('\\viewkind'), endIndex);
      // Simple RTF to text conversion - remove RTF control words
      return rtfContent
        .replace(/\\[a-z]+\d*\s?/g, '') // Remove RTF control words
        .replace(/\\\n/g, '\n') // Handle line breaks
        .replace(/\\par/g, '\n') // Paragraph breaks
        .replace(/\\tab/g, '\t') // Tabs
        .replace(/\{\\fonttbl[^}]*\}/g, '') // Remove font table
        .replace(/\{\\colortbl[^}]*\}/g, '') // Remove color table
        .replace(/\\[a-z]+/g, '') // Remove remaining control words
        .replace(/\n\s*\n/g, '\n\n') // Clean up extra newlines
        .trim();
    }
  }
  return text;
}

export async function generateAIContent(formData: any, selectedPrompt: string, slug: string, createdBy: string) {
  try {
    console.log('Actions: Starting generateAIContent for slug:', slug);
    const finalPrompt = `${selectedPrompt}\n\nUser Input JSON:\n${JSON.stringify(formData)}`;

    console.log('Actions: Calling AI model with prompt length:', finalPrompt.length);
    const text = await sendWithRetry(finalPrompt);

    const cleanedText = stripRtf(text);
    console.log('Actions: AI response received, length:', cleanedText.length);

    console.log('Actions: Attempting db insert');
    const result = await db.insert(AiOutput).values({
      formData: JSON.stringify(formData),
      templateSlug: slug,
      aiResponse: cleanedText,
      createdBy: createdBy,
      createdAt: new Date().toISOString(),
    });
    console.log('Actions: DB insert successful');

    return cleanedText;
  } catch (error: any) {
    console.error("Error in generateAIContent:", error);

    // Detailed error analysis
    const errorMessage = String(error?.message || error).toLowerCase();
    let detailedMessage = "An error occurred during AI content generation.";

    if (errorMessage.includes("api key") || errorMessage.includes("not set")) {
      detailedMessage = "API key configuration error: Please check that NEXT_PUBLIC_GEMINI_API_KEY and OPENAI_API_KEY are properly set in your environment variables.";
    } else if (errorMessage.includes("quota")) {
      detailedMessage = "AI service quota exceeded: Your API usage limit has been reached. Please check your billing or usage limits with your AI provider.";
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
      detailedMessage = "Rate limit exceeded: Too many requests to the AI service. Please wait a moment and try again.";
    } else if (errorMessage.includes("network") || errorMessage.includes("fetch") || errorMessage.includes("timeout")) {
      detailedMessage = "Network or connection error: Unable to reach the AI service. Please check your internet connection and try again.";
    } else if (errorMessage.includes("empty response")) {
      detailedMessage = "AI service returned an empty response: The model may be experiencing issues. Please try again.";
    } else if (errorMessage.includes("overloaded") || errorMessage.includes("500") || errorMessage.includes("502") || errorMessage.includes("503") || errorMessage.includes("504")) {
      detailedMessage = "AI service temporarily unavailable: The service is overloaded or experiencing issues. Please try again later.";
    }

    console.error("Detailed error:", detailedMessage);
    const enhancedError = new Error(detailedMessage);
    enhancedError.cause = error;
    throw enhancedError;
  }
}