import { api } from './api.client.ts'
import { setupInterceptors } from './api.interceptors.ts'

setupInterceptors(api)

export { api }
