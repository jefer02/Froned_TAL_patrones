import { httpClient } from './httpClient'
import type { RegisterUserRequest, RegisterUserResponse } from '../types/api'

export const authApi = {
  register: async (payload: RegisterUserRequest): Promise<RegisterUserResponse> => {
    const response = await httpClient<RegisterUserResponse>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    return response.data
  }
}
