export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'Missing token' })

  const isSandbox = process.env.PAGADITO_ENV !== 'production'
  const baseUrl = isSandbox
    ? 'https://sandbox.pagadito.com/apipg'
    : 'https://app.pagadito.com/apipg'

  try {
    const statusRes = await fetch(`${baseUrl}/get_status.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, format_return: 'JSON' }),
    })
    const statusData = await statusRes.json()

    if (statusData.code !== 'PG1003') {
      return res.status(502).json({ error: 'Status check failed', detail: statusData })
    }

    return res.json({
      status: statusData.value.status,  // COMPLETED | FAILED | CANCELED | EXPIRED | VERIFYING
      ern: statusData.value.ern,
      amount: statusData.value.amount,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: String(err) })
  }
}
