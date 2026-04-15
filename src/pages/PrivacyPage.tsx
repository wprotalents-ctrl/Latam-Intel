import React from 'react';
import { Shield, Mail, Phone, Globe, ArrowLeft } from 'lucide-react';

interface Props {
  onBack?: () => void;
}

export default function PrivacyPage({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Header bar */}
      <div className="border-b border-border bg-surface px-6 py-3 flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="mono text-[9px] text-text/40 hover:text-accent transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={11} /> Back
          </button>
        )}
        <div className="flex items-center gap-2">
          <Shield size={13} className="text-accent" />
          <span className="mono text-[9px] font-bold text-accent tracking-widest">PRIVACY POLICY</span>
        </div>
        <span className="mono text-[8px] text-text/20 ml-auto">World Pro Talents LLC · Effective April 15, 2026</span>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <div className="mono text-[9px] text-accent/60 mb-2 tracking-widest">WORLD PRO TALENTS LLC</div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-3">Privacy Policy</h1>
          <p className="mono text-[10px] text-text/40">
            Effective Date: April 15, 2026 &nbsp;·&nbsp; Last Updated: April 15, 2026
          </p>
        </div>

        <div className="space-y-8 mono text-[11px] leading-relaxed text-text/70">

          {/* Section 1 */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-tight text-text mb-3">1. Who We Are</h2>
            <p>
              World Pro Talents LLC ("WProTalents," "we," "us," or "our") is a Florida limited liability company
              providing talent acquisition, market intelligence, and recruitment services. Our platform is available at{' '}
              <a href="https://wprotalents.lat" className="text-accent hover:underline">wprotalents.lat</a>.
            </p>
            <p className="mt-2">
              This Privacy Policy explains how we collect, use, share, and protect personal information when you
              visit our website or use our services, and describes your rights regarding that information.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-tight text-text mb-3">2. What Data We Collect</h2>
            <div className="space-y-2">
              {[
                { label: 'Account data', detail: 'Name, email address, and role type (candidate or company) when you register.' },
                { label: 'Professional data', detail: 'Job preferences, seniority level, location, and salary expectations you provide.' },
                { label: 'Usage data', detail: 'Pages visited, features used, session duration, and interaction patterns.' },
                { label: 'Communications', detail: 'Messages submitted through contact forms, WhatsApp, or email.' },
                { label: 'Technical data', detail: 'IP address, browser type, device information, and cookie identifiers.' },
              ].map(({ label, detail }) => (
                <div key={label} className="flex gap-3 p-3 bg-surface border border-border">
                  <div className="w-1 bg-accent/40 shrink-0 rounded-full" />
                  <div>
                    <span className="font-bold text-text">{label}: </span>{detail}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-tight text-text mb-3">3. How We Use Your Data</h2>
            <ul className="space-y-1.5 list-none">
              {[
                'To operate and improve our platform and talent matching services',
                'To send job opportunities, market intelligence, or hiring updates you have opted into',
                'To respond to inquiries and provide customer support',
                'To prevent fraud and maintain platform security',
                'To comply with applicable legal obligations',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">→</span> {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-tight text-text mb-3">4. Who We Share It With</h2>
            <p className="mb-2">
              <span className="font-bold text-text">We do not sell your personal data.</span> We may share it only with:
            </p>
            <ul className="space-y-1.5">
              {[
                'Service providers that help us operate the platform (including Firebase, Supabase, and Vercel), under data processing agreements',
                'You, upon your request to access your own data',
                'Law enforcement or regulators when legally required or to protect the rights of our users',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">→</span> {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-tight text-text mb-3">5. Data Security (Florida Information Protection Act)</h2>
            <p>
              We implement reasonable technical and organizational measures to protect your personal data, consistent
              with the <span className="text-text font-bold">Florida Information Protection Act (FIPA)</span>.
              This includes secure transmission (HTTPS), access controls, and regular security reviews.
            </p>
            <p className="mt-2">
              In the event of a data breach affecting your personal information, we will notify you within{' '}
              <span className="text-text font-bold">30 days</span> as required by Florida law, and will notify the
              Florida Department of Legal Affairs if more than 500 Florida residents are affected.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-tight text-text mb-3">6. Email Communications (CAN-SPAM Act)</h2>
            <p>
              If you receive marketing emails from World Pro Talents LLC, each email includes our physical mailing
              address and a functioning one-click unsubscribe link. We will never use deceptive subject lines or
              sender information. To opt out of marketing emails at any time, click the unsubscribe link in any email
              or contact us directly at{' '}
              <a href="mailto:info@wprotalents.lat" className="text-accent hover:underline">info@wprotalents.lat</a>.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-tight text-text mb-3">7. SMS / WhatsApp Outreach (Florida FTSA)</h2>
            <p>
              By submitting your contact information and checking the consent box on our forms, you expressly consent
              to receive talent-related messages from World Pro Talents LLC via WhatsApp or SMS. Message frequency
              varies. Standard message and data rates may apply.
            </p>
            <p className="mt-2">
              To opt out at any time, reply <span className="text-text font-bold">STOP</span> to any message. We will
              cease communications within 15 days of receiving your opt-out request, consistent with the Florida
              Telephone Solicitation Act.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-tight text-text mb-3">8. Children's Privacy (COPPA)</h2>
            <p>
              Our services are intended exclusively for users <span className="text-text font-bold">18 years of age or older</span>.
              We do not knowingly collect personal data from individuals under 13. If you believe a minor has submitted
              personal data to us, please contact us immediately at{' '}
              <a href="mailto:info@wprotalents.lat" className="text-accent hover:underline">info@wprotalents.lat</a>{' '}
              and we will promptly delete it.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-tight text-text mb-3">9. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="space-y-1.5">
              {[
                'Access the personal data we hold about you',
                'Request correction of inaccurate data',
                'Request deletion of your data ("right to be forgotten")',
                'Withdraw consent for communications at any time',
                'Lodge a complaint with the relevant regulatory authority',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">→</span> {item}
                </li>
              ))}
            </ul>
            <p className="mt-2">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:info@wprotalents.lat" className="text-accent hover:underline">info@wprotalents.lat</a>.
              We will respond within 30 days.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-tight text-text mb-3">10. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account remains active or as necessary to provide
              our services. If you delete your account or request erasure, we will remove your data within 30 days
              except where retention is required by law.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-tight text-text mb-3">11. Cookies</h2>
            <p>
              Our platform uses essential cookies to maintain your session and preferences (such as language
              selection and theme). We do not use third-party advertising cookies. You may disable cookies in
              your browser settings, though some features may not function correctly as a result.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-tight text-text mb-3">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will post the revised version
              with an updated effective date. Your continued use of our platform after any changes constitutes
              your acceptance of the updated policy.
            </p>
          </section>

          {/* Section 13 — Contact */}
          <section className="border border-accent/20 bg-accent/5 p-6">
            <h2 className="text-sm font-black uppercase tracking-tight text-text mb-4">13. Contact Us</h2>
            <div className="space-y-2">
              <div className="font-bold text-text">World Pro Talents LLC</div>
              {[
                { icon: Mail, label: 'info@wprotalents.lat', href: 'mailto:info@wprotalents.lat' },
                { icon: Phone, label: 'WhatsApp: +57 324 313 2500', href: 'https://wa.me/573243132500' },
                { icon: Globe, label: 'wprotalents.lat', href: 'https://wprotalents.lat' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-accent hover:underline"
                >
                  <Icon size={11} /> {label}
                </a>
              ))}
            </div>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-border mono text-[8px] text-text/20 text-center">
          © 2026 World Pro Talents LLC · Florida Limited Liability Company · All rights reserved
        </div>
      </div>
    </div>
  );
}
