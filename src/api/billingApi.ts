import { httpClient } from './httpClient'
import type { UpgradePlanRequest, UpgradePlanResponse } from '../types/api'

export const billingApi = {
  upgradePlan: async (payload: UpgradePlanRequest): Promise<UpgradePlanResponse> => {
    const response = await httpClient<UpgradePlanResponse>('/api/quota/upgrade', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    return response.data
  }
}
