import { generateAIContent } from '@/utils/actions';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { formData, selectedPrompt, slug, createdBy } = await request.json();
    const result = await generateAIContent(formData, selectedPrompt, slug, createdBy);
    return Response.json(result);
  } catch (error) {
    return Response.json({ success: false, error: 'Unexpected error in test API' }, { status: 500 });
  }
}