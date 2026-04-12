import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { movieId, movieTitle, tier, amount, userId } = req.body

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const appUrl = process.env.APP_URL || 'https://zairo-films.vercel.app'

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: movieTitle,
              description: tier === 'download' ? 'Ver + Descargar · acceso permanente' : 'Ver sin anuncios · acceso ilimitado',
            },
            unit_amount: Math.round(amount * 100), // Stripe trabaja en centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}?stripe_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#/checkout/${movieId}`,
      metadata: { movieId, movieTitle, tier, userId },
    })

    return res.json({ url: session.url })
  } catch (err) {
    return res.status(500).json({ error: 'Error creando sesión de Stripe', detail: String(err) })
  }
}
