export interface User {
  messageCount: number
  subscribed: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: number
  lastMessageAt?: number
  optedOut?: boolean
}
