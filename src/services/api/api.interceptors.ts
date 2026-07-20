import type { AxiosInstance } from 'axios'

import { tokenStorage } from '@/lib/token-storage.ts'

export function setupInterceptors(api: AxiosInstance) {
  api.interceptors.request.use(
    (config) => {
      const token = tokenStorage.get()

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => Promise.reject(error),
  )
}
