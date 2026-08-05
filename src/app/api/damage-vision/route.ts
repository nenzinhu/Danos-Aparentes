import { NextRequest } from 'next/server';
import { POST as classifyPost } from '../damage-classify/route';

/** 
 * Endpoint de análise de foto por IA via Groq Llama 3.2 Vision.
 * Redireciona para a mesma lógica pericial de damage-classify.
 */
export async function POST(req: NextRequest) {
  return classifyPost(req);
}
