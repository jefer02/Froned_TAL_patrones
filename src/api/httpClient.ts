import type { ApiErrorResponse } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export class ApiError extends Error {
  public readonly status: number
  public readonly code: string
  public readonly path: string
  public readonly details: Record<string, unknown> | undefined
  public readonly timestamp: string | undefined
  public readonly retryAfterSeconds: number | null

  constructor(params: {
    message: string
    status: number
    code: string
    path: string
    details?: Record<string, unknown>
    timestamp?: string
    retryAfterSeconds: number | null
  }) {
    super(params.message)
    this.name = 'ApiError'
    this.status = params.status
    this.code = params.code
    this.path = params.path
    this.details = params.details
    this.timestamp = params.timestamp
    this.retryAfterSeconds = params.retryAfterSeconds
  }
}

interface HttpResult<T> {
  data: T
  headers: Headers
}

const buildHeaders = (headers?: HeadersInit): HeadersInit => ({
  'Content-Type': 'application/json',
  ...headers
})

const parseRetryAfterSeconds = (headers: Headers): number | null => {
  const retryAfter = headers.get('Retry-After')
  if (!retryAfter) {
    return null
  }

  const parsed = Number.parseInt(retryAfter, 10)
  return Number.isNaN(parsed) ? null : parsed
}

export const httpClient = async <T>(path: string, options: RequestInit = {}): Promise<HttpResult<T>> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers)
  })

  if (!response.ok) {
    const retryAfterSeconds = parseRetryAfterSeconds(response.headers)
    let errorPayload: ApiErrorResponse | null = null

    try {
      errorPayload = (await response.json()) as ApiErrorResponse
    } catch {
      errorPayload = null
    }

    throw new ApiError({
      status: response.status,
      message: errorPayload?.message ?? 'Unexpected API error',
      code: errorPayload?.code ?? `BAD_${response.status}`,
      path: errorPayload?.path ?? path,
      details: errorPayload?.details,
      timestamp: errorPayload?.timestamp,
      retryAfterSeconds
    })
  }

  if (response.status === 204) {
    return { data: undefined as T, headers: response.headers }
  }

  return {
    data: (await response.json()) as T,
    headers: response.headers
  }
}
