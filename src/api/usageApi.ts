import { httpClient } from './httpClient'
import type { QuotaStatusResponse, UsageHistoryItem, UserCredentials } from '../types/api'

const toQueryString = (credentials: UserCredentials): string =>
  `userId=${encodeURIComponent(credentials.userId)}&encryptedPassword=${encodeURIComponent(credentials.encryptedPassword)}`

export const usageApi = {
  getStatus: async (credentials: UserCredentials): Promise<QuotaStatusResponse> => {
    const query = toQueryString(credentials)
    const response = await httpClient<QuotaStatusResponse>(`/api/quota/status?${query}`, {
      method: 'GET'
    })

    return response.data
  },

  getHistory: async (credentials: UserCredentials): Promise<UsageHistoryItem[]> => {
    const query = toQueryString(credentials)
    const response = await httpClient<UsageHistoryItem[]>(`/api/quota/history?${query}`, {
      method: 'GET'
    })

    return response.data
  }
}
