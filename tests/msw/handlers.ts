import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/products', () => {
    return HttpResponse.json({ contents: [] })
  }),
  http.get('/api/users', () => {
    return HttpResponse.json({ contents: [] })
  }),
]
