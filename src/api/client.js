const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.detail || `Request failed: ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  uploadDocument: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request('/documents/upload', { method: 'POST', body: formData })
  },
  listDocuments: () => request('/documents'),
  getDocument: (id) => request(`/documents/${id}`),
  deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
  analyzeDocument: (id) => request(`/documents/${id}/analyze`, { method: 'POST' }),
  getIssues: (id) => request(`/documents/${id}/issues`),
  transformDocument: (id, payload) =>
    request(`/documents/${id}/transform`, { method: 'POST', body: JSON.stringify(payload) }),
  listVersions: (id) => request(`/documents/${id}/versions`),
  validateDocument: (id) => request(`/documents/${id}/validate`, { method: 'POST' }),
  listValidations: (id) => request(`/documents/${id}/validations`),
  listReviewQueue: () => request('/reviews/queue'),
  submitReview: (documentId, validationId, payload) =>
    request(`/documents/${documentId}/validations/${validationId}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  exportUrl: (id, format = 'zip') => `${BASE}/documents/${id}/export?format=${format}`,
}
