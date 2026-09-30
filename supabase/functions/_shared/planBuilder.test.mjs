// 【核心改造】：直連 Supabase 真實資料庫讀取 32 題 question_bank
async function getLiveQuestionBank() {
  const candidatePaths = [
    new URL('../../../frontend/.env.local', import.meta.url),
    new URL('../../../.env.local', import.meta.url),
    new URL('../../../frontend/.env', import.meta.url),
    new URL('../../../.env', import.meta.url),
  ]

  let envText = ''
  for (const p of candidatePaths) {
    if (existsSync(p)) {
      envText += '\n' + readFileSync(p, 'utf8')
    }
  }

  if (!envText.trim()) {
    throw new Error('找不到 .env 或 .env.local 檔案，無法讀取 Supabase 金鑰')
  }

  const env = Object.fromEntries(
    envText
      .split('\n')
      .filter((l) => l.includes('='))
      .map((l) => {
        const idx = l.indexOf('=')
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')]
      })
  )

  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL
  const key = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('環境變數中缺少 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY')
  }

  console.log('\n>>> 正在連線 Supabase 真實資料庫:', url)
  const res = await fetch(`${url}/rest/v1/question_bank?is_active=eq.true&order=id.asc`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`Supabase 連線失敗 HTTP ${res.status}: ${errorBody}`)
  }

  const rows = await res.json()
  console.log(`>>> [真實資料連線成功] 成功自 Supabase 即時載入 ${rows.length} 題正式題庫！ <<<\n`)
  return rows
}