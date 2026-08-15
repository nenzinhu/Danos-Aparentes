'use client'

import Link from 'next/link'
import { B2B_CTA_TRIAL_SHORT } from '@/src/lib/b2bPositioning'

export default function MobileStickyCta(_props?: { heroCtaId?: string; eventSource?: string }) {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-2 bg-[linear-gradient(to_top,var(--bg-main)_70%,transparent)] border-t border-[var(--card-border)]/50">
      <Link
        href="/planos"
        className="block w-full text-center px-6 py-3.5 text-white font-black rounded-xl shadow-xl shadow-[var(--primary)]/25"
        style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
      >
        {B2B_CTA_TRIAL_SHORT}
      </Link>
    </div>
  )
}
