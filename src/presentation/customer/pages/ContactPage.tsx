// ============================================================================
// ContactPage — Contact information, WhatsApp, FAQ
// ============================================================================

export default function ContactPage() {
  const CONTACT_OPTIONS = [
    {
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      ),
      title: 'Call Us',
      desc: '+91 98765 43210',
      href: 'tel:+919876543210',
      action: 'Call Now',
    },
    {
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      title: 'WhatsApp',
      desc: 'Chat with us instantly',
      href: 'https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20with%20Nayantara%20Rentals.',
      action: 'Chat Now',
    },
    {
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      title: 'Email',
      desc: 'hello@nayantararentals.com',
      href: 'mailto:hello@nayantararentals.com',
      action: 'Send Email',
    },
    {
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
      title: 'Visit Us',
      desc: 'Nayantara Rentals, Main Market, City',
      href: '#',
      action: 'Get Directions',
    },
  ];

  const FAQS = [
    {
      q: 'How does the rental process work?',
      a: 'Browse our collection, select your outfit, choose your rental dates, and book. We deliver to your doorstep and pick up after use.',
    },
    {
      q: 'What is the cancellation policy?',
      a: 'Free cancellation up to 48 hours before the start date. After that, a 50% cancellation fee applies.',
    },
    {
      q: 'Do you offer alterations?',
      a: 'Minor alterations are available for free. Major alterations depend on the outfit and timing.',
    },
    {
      q: 'How is the security deposit handled?',
      a: 'A refundable security deposit is collected at the time of booking and returned after the outfit is returned in good condition.',
    },
    {
      q: 'What areas do you deliver to?',
      a: 'We currently deliver across major Indian cities. Delivery times vary from 3-5 business days.',
    },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text">Contact Us</h1>
          <p className="text-sm text-text-muted mt-2">We're here to help with your rental needs</p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {CONTACT_OPTIONS.map((opt) => (
            <a
              key={opt.title}
              href={opt.href}
              target={opt.href.startsWith('http') ? '_blank' : undefined}
              rel={opt.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="rounded-2xl bg-surface border border-border p-5 flex flex-col items-center text-center card-lift"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 text-primary mb-3">
                {opt.icon}
              </div>
              <h3 className="text-sm font-semibold text-text">{opt.title}</h3>
              <p className="text-[10px] sm:text-xs text-text-muted mt-1">{opt.desc}</p>
              <span className="mt-3 text-xs font-medium text-primary">{opt.action} →</span>
            </a>
          ))}
        </div>

        {/* Business Hours */}
        <div className="mt-8 rounded-2xl bg-surface border border-border p-5">
          <h3 className="text-sm font-semibold text-text mb-4">Business Hours</h3>
          <div className="space-y-2">
            {[
              { day: 'Monday – Saturday', time: '10:00 AM – 8:00 PM' },
              { day: 'Sunday', time: '11:00 AM – 6:00 PM' },
              { day: 'Public Holidays', time: 'Closed' },
            ].map((row) => (
              <div key={row.day} className="flex justify-between text-xs">
                <span className="text-text-muted">{row.day}</span>
                <span className="text-text font-medium">{row.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-text mb-5">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl bg-surface border border-border overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-medium text-text">
                  {faq.q}
                  <svg className="h-4 w-4 text-text-muted group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-xs text-text-muted leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
