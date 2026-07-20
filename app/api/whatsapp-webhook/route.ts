import { NextRequest, NextResponse } from 'next/server'
import { getUser, createUser, saveUser, incrementDailyMessageStat, linkStripeCustomer } from '@/lib/kv'
import type { User } from '@/lib/types'
import { generateReply } from '@/lib/claude'
import { sendWhatsApp, validateTwilioRequest } from '@/lib/twilio'
import { findActiveSubscriptionByPhone } from '@/lib/stripe'
import {
  WELCOME_MESSAGE,
  ONE_FREE_MESSAGE_REMAINING,
  PAYWALL_MESSAGE,
  PAID_CONFIRMED_MESSAGE,
  PAID_NOT_FOUND_MESSAGE,
  HELP_MESSAGE,
} from '@/lib/messages'

const FREE_MESSAGE_LIMIT = 3

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const params: Record<string, string> = {}
  formData.forEach((value, key) => {
    params[key] = value.toString()
  })

  const signature = req.headers.get('x-twilio-signature') ?? ''
  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp-webhook`
  if (!validateTwilioRequest(signature, webhookUrl, params)) {
    return new NextResponse('Invalid signature', { status: 403 })
  }

  const from = params.From ?? ''
  const body = (params.Body ?? '').trim()
  const phone = from.replace('whatsapp:', '')

  if (!phone) {
    return new NextResponse('Missing sender', { status: 400 })
  }

  let user = await getUser(phone)
  if (!user) {
    user = await createUser(phone)
    await sendWhatsApp(phone, WELCOME_MESSAGE)
  }

  if (user.optedOut) {
    return new NextResponse('', { status: 200 })
  }

  const upperBody = body.toUpperCase()

  if (upperBody === 'STOP') {
    user.optedOut = true
    await saveUser(phone, user)
    return new NextResponse('', { status: 200 })
  }

  if (upperBody === 'PAID') {
    await handlePaidConfirmation(phone, user)
    return new NextResponse('', { status: 200 })
  }

  if (upperBody.includes('HELP')) {
    await sendWhatsApp(phone, HELP_MESSAGE)
    return new NextResponse('', { status: 200 })
  }

  if (!user.subscribed && user.messageCount >= FREE_MESSAGE_LIMIT) {
    await sendWhatsApp(phone, PAYWALL_MESSAGE)
    return new NextResponse('', { status: 200 })
  }

  const reply = await generateReply(body)
  await sendWhatsApp(phone, reply)

  user.messageCount += 1
  user.lastMessageAt = Date.now()
  await saveUser(phone, user)
  await incrementDailyMessageStat()

  if (!user.subscribed && user.messageCount === 2) {
    await sendWhatsApp(phone, ONE_FREE_MESSAGE_REMAINING)
  }

  return new NextResponse('', { status: 200 })
}

async function handlePaidConfirmation(phone: string, user: User): Promise<void> {
  const subscription = await findActiveSubscriptionByPhone(phone)
  if (subscription) {
    const customerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
    user.subscribed = true
    user.stripeCustomerId = customerId
    user.stripeSubscriptionId = subscription.id
    await saveUser(phone, user)
    await linkStripeCustomer(phone, customerId)
    await sendWhatsApp(phone, PAID_CONFIRMED_MESSAGE)
  } else {
    await sendWhatsApp(phone, PAID_NOT_FOUND_MESSAGE)
  }
}
