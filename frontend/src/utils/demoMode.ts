export function checkDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  const envEnabled = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true'
  const urlParams = new URLSearchParams(window.location.search)
  const queryDemo = urlParams.get('demo') === '1'
  return envEnabled && queryDemo
}
