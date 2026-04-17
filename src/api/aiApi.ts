import { httpClient } from './httpClient'
import type { GenerateTextRequest, GenerateTextResponse } from '../types/api'

export const aiApi = {
  generate: async (payload: GenerateTextRequest): Promise<GenerateTextResponse> => {
    const response = await httpClient<GenerateTextResponse>('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    return response.data
  }
}
