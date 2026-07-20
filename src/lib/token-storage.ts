let accessToken: string | null = null

export const tokenStorage = {
  get() {
    return accessToken
  },

  set(token: string) {
    accessToken = token
    localStorage.setItem('access_token', token)
  },

  clear() {
    accessToken = null
    localStorage.removeItem('access_token')
  },

  load() {
    accessToken = localStorage.getItem('access_token')
  },
}
