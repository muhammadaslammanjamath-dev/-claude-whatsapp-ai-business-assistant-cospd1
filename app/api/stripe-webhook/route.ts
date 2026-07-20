import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { getUser, saveUser, linkStripeCustomer, findUserByStripeCustomerId } from '@/lib/kv'
import { sendWhatsApp } from '@/lib/twilio'
import { SUBSCRIPTION_ENDED_MESSAGE } from '@/lib/messages'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new NextResponse('Webhook signature verification failed', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const phone = extractPhoneFromCheckoutSession(session)
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

      if (phone && customerId) {
        await linkStripeCustomer(phone, customerId)
        await stripe.customers.update(customerId, { metadata: { phone } })
        if (subscriptionId) {
          await stripe.subscriptions.update(subscriptionId, { metadata: { phone } })
        }
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const phone = subscription.metadata?.phone
      if (phone && subscription.status === 'active') {
        const user = await getUser(phone)
        if (user) {
          const customerId =
            typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
          user.subscribed = true
          user.stripeCustomerId = customerId
          user.stripeSubscriptionId = subscription.id
          await saveUser(phone, user)
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      let phone: string | undefined = subscription.metadata?.phone
      if (!phone) {
        const customerId =
          typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
        const found = await findUserByStripeCustomerId(customerId)
        phone = found?.phone
      }
      if (phone) {
        const user = await getUser(phone)
        if (user) {
          user.subscribed = false
          await saveUser(phone, user)
          await sendWhatsApp(phone, SUBSCRIPTION_ENDED_MESSAGE)
        }
      }
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}

function extractPhoneFromCheckoutSession(session: Stripe.Checkout.Session): string | null {
  const nativePhone = session.customer_details?.phone
  if (nativePhone) {
    return nativePhone.replace(/[^\d+]/g, '')
  }
  const field = session.custom_fields?.find((f) => f.key === 'phone_number' || f.key === 'phone')
  const raw = field?.text?.value
  if (!raw) return null
  return raw.replace(/[^\d+]/g, '')
}
