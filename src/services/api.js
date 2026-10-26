const API_BASE = '/api'

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }
    return await response.json()
  } catch (err) {
    console.error(`API Error [${options.method || 'GET'} ${url}]:`, err.message)
    throw err
  }
}

export const api = {
  // Contacts
  getContacts: (params) => apiRequest(`/contacts?${new URLSearchParams(params).toString()}`),
  getContact: (id) => apiRequest(`/contacts/${id}`),
  createContact: (data) => apiRequest('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (id, data) => apiRequest(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContact: (id) => apiRequest(`/contacts/${id}`, { method: 'DELETE' }),

  // Leads
  getLeads: (params) => apiRequest(`/leads?${new URLSearchParams(params).toString()}`),
  getLead: (id) => apiRequest(`/leads/${id}`),
  createLead: (data) => apiRequest('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id, data) => apiRequest(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLead: (id) => apiRequest(`/leads/${id}`, { method: 'DELETE' }),
  qualifyLead: (id, data) => apiRequest(`/leads/${id}/qualify`, { method: 'POST', body: JSON.stringify(data) }),
  convertLead: (id, data) => apiRequest(`/leads/${id}/convert`, { method: 'POST', body: JSON.stringify(data) }),

  // Deals
  getDeals: (params) => apiRequest(`/deals?${new URLSearchParams(params).toString()}`),
  getDeal: (id) => apiRequest(`/deals/${id}`),
  createDeal: (data) => apiRequest('/deals', { method: 'POST', body: JSON.stringify(data) }),
  updateDeal: (id, data) => apiRequest(`/deals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDeal: (id) => apiRequest(`/deals/${id}`, { method: 'DELETE' }),
  moveDealStage: (id, stageId) => apiRequest(`/deals/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stageId }) }),

  // Pipelines
  getPipelines: () => apiRequest('/pipelines'),
  getPipeline: (id) => apiRequest(`/pipelines/${id}`),
  createPipeline: (data) => apiRequest('/pipelines', { method: 'POST', body: JSON.stringify(data) }),
  updatePipeline: (id, data) => apiRequest(`/pipelines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePipeline: (id) => apiRequest(`/pipelines/${id}`, { method: 'DELETE' }),
  createStage: (pipelineId, data) => apiRequest(`/pipelines/${pipelineId}/stages`, { method: 'POST', body: JSON.stringify(data) }),
  updateStage: (id, data) => apiRequest(`/pipelines/stages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStage: (id) => apiRequest(`/pipelines/stages/${id}`, { method: 'DELETE' }),
  reorderStages: (pipelineId, stageIds) => apiRequest(`/pipelines/${pipelineId}/reorder`, { method: 'POST', body: JSON.stringify({ stageIds }) }),

  // Dashboard
  getDashboard: () => apiRequest('/dashboard'),

  // Activities
  getActivities: (params) => apiRequest(`/activities?${new URLSearchParams(params).toString()}`),
  getActivity: (id) => apiRequest(`/activities/${id}`),
  createActivity: (data) => apiRequest('/activities', { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id, data) => apiRequest(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteActivity: (id) => apiRequest(`/activities/${id}`, { method: 'DELETE' }),

  // Sources
  simulateGoogleAds: () => apiRequest('/sources/google-ads', { method: 'POST' }),
  simulateMetaAds: () => apiRequest('/sources/meta-ads', { method: 'POST' }),
  simulateWebsite: () => apiRequest('/sources/website-form', { method: 'POST' }),
  simulateInboundCall: () => apiRequest('/sources/inbound-call', { method: 'POST' }),

  // Reports
  getReports: () => apiRequest('/reports'),

  // Lead readiness — GET /api/leads/:id/readiness
  getLeadReadiness: (id) => apiRequest(`/leads/${id}/readiness`),

  // Settings
  resetAllData: (password) => apiRequest('/settings/reset', { method: 'POST', body: JSON.stringify({ password }) }),
}
