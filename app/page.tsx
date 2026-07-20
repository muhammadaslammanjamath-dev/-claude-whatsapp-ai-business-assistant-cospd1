export default function Home() {
  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 640,
        margin: '4rem auto',
        padding: '0 1.5rem',
        lineHeight: 1.6,
      }}
    >
      <h1>AskAI Business Assistant</h1>
      <p>
        Instant UK business help on WhatsApp. Message the AskAI WhatsApp number with any
        business question &mdash; contracts, HR, marketing, invoices, and more.
      </p>
      <p>Free for 3 messages, then £9/month for unlimited access.</p>
      <p>
        This page is a deployment status check for the underlying Next.js app; the product
        itself runs entirely inside WhatsApp.
      </p>
    </main>
  )
}
