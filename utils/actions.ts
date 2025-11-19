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
    const finalPrompt = `${selectedPrompt}\n\nUser Input JSON:\n${JSON.stringify(formData)}`;

    const text = await sendWithRetry(finalPrompt, {
      maxRetries: 3,
      baseDelayMs: 800,
      timeoutMs: 30000,
      useFallback: true,
    });

    const cleanedText = stripRtf(text);

    const result = await db.insert(AiOutput).values({
      formData: JSON.stringify(formData),
      templateSlug: slug,
      aiResponse: cleanedText,
      createdBy: createdBy,
      createdAt: new Date().toISOString(),
    });

    return cleanedText;
  } catch (error) {
    console.error("Error in generateAIContent:", error);
    throw error;
  }
}