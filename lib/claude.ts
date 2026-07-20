import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from './messages'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FALLBACK_REPLY = "Sorry, I couldn't put together a reply just now. Please try again in a moment.\n\nAskAI Business Assistant"

export async function generateReply(userMessage: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 700,
    system: SYSTEM_PROMPT,
    output_config: { effort: 'low' },
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  return textBlock?.type === 'text' ? textBlock.text : FALLBACK_REPLY
}
