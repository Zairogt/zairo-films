import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { session_id } = req.query
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status !== 'paid') {
      return res.json({ status: 'FAILED' })
    }

    return res.json({
      status: 'COMPLETED',
      movieId: session.metadata?.movieId,
      movieTitle: session.metadata?.movieTitle,
      tier: session.metadata?.tier,
      amount: (session.amount_total ?? 0) / 100,
      userId: session.metadata?.userId,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Error verificando sesión', detail: String(err) })
  }
}
