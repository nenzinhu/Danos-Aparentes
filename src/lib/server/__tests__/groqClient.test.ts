import { describe, it, expect, vi, beforeEach } from 'vitest'
import { callGroqChat, getGroqApiKey, getGroqModel } from '../groqClient'

describe('groqClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.GROQ_API_KEY = 'gsk_test_key_12345'
    process.env.GROQ_MODEL = 'llama-3.3-70b-versatile'
  })

  it('retorna a chave de API e modelo das variaveis de ambiente', () => {
    expect(getGroqApiKey()).toBeTruthy()
    expect(getGroqModel()).toBe('llama-3.3-70b-versatile')
  })

  it('retorna erro amigável se a requisição falhar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Invalid API Key',
    }))

    const res = await callGroqChat({
      messages: [{ role: 'user', content: 'Olá' }],
    })

    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.status).toBe(401)
      expect(res.error).toContain('Groq API Error')
    }
  })

  it('retorna o conteudo gerado quando a requisição é bem sucedida', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          { message: { content: 'Resposta de teste da IA Groq' } },
        ],
      }),
    }))

    const res = await callGroqChat({
      messages: [{ role: 'user', content: 'Analise o laudo de avarias' }],
    })

    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.content).toBe('Resposta de teste da IA Groq')
    }
  })
})
