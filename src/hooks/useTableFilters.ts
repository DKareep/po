import { useSearchParams } from 'react-router-dom'

export function useTableFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const get = (key: string) => searchParams.get(key) ?? ''

  const set = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams)

    if (!value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    setSearchParams(params)
  }

  const reset = () => {
    setSearchParams({})
  }

  return {
    get,
    set,
    reset,
    searchParams,
  }
}
