export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { movieId, movieTitle, tier, amount, userId } = req.body

  const uid = process.env.PAGADITO_UID
  const wsk = process.env.PAGADITO_WSK
  const isSandbox = process.env.PAGADITO_ENV !== 'production'
  const baseUrl = isSandbox
    ? 'https://sandbox.pagadito.com/apipg'
    : 'https://app.pagadito.com/apipg'

  // URL a la que Pagadito redirige tras el pago (debe configurarse también en el dashboard)
  const appUrl = process.env.APP_URL || 'https://zairo-films.vercel.app'

  try {
    // 1. Obtener token de sesión
    const connectRes = await fetch(`${baseUrl}/connect.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, wsk, format_return: 'JSON' }),
    })
    const connectData = await connectRes.json()

    if (connectData.code !== 'PG1001') {
      return res.status(502).json({ error: 'Pagadito connect failed', detail: connectData })
    }

    const pgToken = connectData.value.token

    // 2. Crear transacción
    const ern = `ZF-${userId.slice(0, 8)}-${Date.now()}`

    const transRes = await fetch(`${baseUrl}/exec_trans.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: pgToken,
        ern,
        amount,
        currency: 'USD',
        allow_partial_pay: 0,
        details: [
          {
            quantity: 1,
            description: movieTitle,
            price: amount,
            taxes: 0,
          },
        ],
        return_url: appUrl,
        format_return: 'JSON',
      }),
    })
    const transData = await transRes.json()

    if (transData.code !== 'PG1002') {
      return res.status(502).json({ error: 'Pagadito exec_trans failed', detail: transData })
    }

    return res.json({
      url: transData.value.redirectUrl,
      ern,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: String(err) })
  }
}
