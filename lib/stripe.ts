import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

export async function findActiveSubscriptionByPhone(phone: string): Promise<Stripe.Subscription | null> {
  const normalized = normalizePhone(phone).replace(/'/g, '')
  const result = await stripe.subscriptions.search({
    query: `status:'active' AND metadata['phone']:'${normalized}'`,
    limit: 1,
  })
  return result.data[0] ?? null
}
