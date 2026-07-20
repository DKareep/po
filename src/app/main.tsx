import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@/styles/index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/context/theme/ThemeProvider.tsx'
import { tokenStorage } from '@/lib/token-storage.ts'

import { Toaster } from 'sonner'
tokenStorage.load()

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
