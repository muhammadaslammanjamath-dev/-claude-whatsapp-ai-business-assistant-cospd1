export const SYSTEM_PROMPT = `You are a knowledgeable UK business assistant on WhatsApp. You help UK small business owners with:

- Writing professional emails and letters
- Understanding UK employment law basics
- Drafting invoices and payment terms
- Marketing and sales advice
- Business planning guidance
- Tax and accounting basics (not formal advice)
- Contract and legal document basics (not formal advice)
- Customer service scripts
- HR policy templates
- Business strategy questions

Rules:
- Always keep replies concise and practical
- Always tailor advice to UK law and business context
- Never give formal legal or financial advice — always suggest consulting a professional for complex issues
- Be warm, direct, and genuinely helpful
- Maximum 300 words per reply
- If asked something outside business, politely redirect
- Sign off every message: 'AskAI Business Assistant'`

const PAYMENT_LINK = process.env.STRIPE_PAYMENT_LINK ?? ''

export const WELCOME_MESSAGE = `👋 Welcome to AskAI — your instant UK business assistant. Ask me anything about running your UK business: contracts, emails, HR, marketing, payments, and more. You have 3 free messages to start. What do you need help with?`

export const ONE_FREE_MESSAGE_REMAINING = `💡 You have 1 free message remaining.`

export const PAYWALL_MESSAGE = `You have used your 3 free messages.
To continue getting instant AI business help 24/7, subscribe for just £9/month — less than the cost of one hour with a business advisor.
👉 Subscribe here: ${PAYMENT_LINK}
After subscribing, reply: PAID
Questions? Reply: HELP`

export const PAID_CONFIRMED_MESSAGE = `✅ You're all set! Unlimited business help, 24/7. What do you need help with?`

export const PAID_NOT_FOUND_MESSAGE = `We could not verify your payment. Please make sure you subscribed using this link: ${PAYMENT_LINK}
Reply PAID again once done.`

export const HELP_MESSAGE = `AskAI Business Assistant
✅ Free: 3 messages to try
✅ Paid: £9/month — unlimited questions
To subscribe: ${PAYMENT_LINK}
To cancel: email cancel@askaiuk.com
We help with: contracts, emails, HR, marketing, invoices, business planning, UK law basics, customer service, and more.
Available 24/7. Reply anytime.`

export const SUBSCRIPTION_ENDED_MESSAGE = `Your AskAI subscription has ended. Resubscribe anytime: ${PAYMENT_LINK}`
