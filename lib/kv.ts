import { kv } from '@vercel/kv'
import type { User } from './types'

function userKey(phone: string): string {
  return `user:${phone}`
}

export async function getUser(phone: string): Promise<User | null> {
  return kv.get<User>(userKey(phone))
}

export async function createUser(phone: string): Promise<User> {
  const user: User = { messageCount: 0, subscribed: false, createdAt: Date.now() }
  await kv.set(userKey(phone), user)
  await kv.incr('stats:total_users')
  return user
}

export async function saveUser(phone: string, user: User): Promise<void> {
  await kv.set(userKey(phone), user)
}

export async function linkStripeCustomer(phone: string, stripeCustomerId: string): Promise<void> {
  await kv.set(`stripe_customer:${stripeCustomerId}`, phone)
}

export async function findUserByStripeCustomerId(
  stripeCustomerId: string
): Promise<{ phone: string; user: User } | null> {
  const phone = await kv.get<string>(`stripe_customer:${stripeCustomerId}`)
  if (!phone) return null
  const user = await getUser(phone)
  if (!user) return null
  return { phone, user }
}

export async function incrementDailyMessageStat(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)
  await kv.incr(`stats:total_messages_today:${today}`)
}
