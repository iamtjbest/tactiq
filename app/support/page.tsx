// app/support/page.tsx — In-app support page (no Telegram needed yet)
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col max-w-[430px] mx-auto p-4">
      <Link href="/" className="text-zinc-400 text-sm block mb-5">← Back</Link>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">💬</span>
        <div>
          <h1 className="text-lg font-black text-white">Support</h1>
          <p className="text-xs text-zinc-500">TactiQ Help Centre</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-3 mb-6">
        {[
          { q: "How do predictions work?", a: "Pick which formation the home team will use. Stake $0.50–$10 USDm. If correct, you win proportionally from the prize pool." },
          { q: "When do I get paid?", a: "After the match, the contract owner settles results on-chain. Winnings are automatically claimable from the contract." },
          { q: "What if a match is cancelled?", a: "All stakers receive a full refund. No fees are taken on cancelled matches." },
          { q: "How are AI tips generated?", a: "Tips use Google Gemini AI trained on football formation data. They are for guidance only — not guaranteed to be correct." },
          { q: "What is USDm?", a: "USDm is a stablecoin pegged to $1 USD, native to the Celo blockchain. You can deposit it via the MiniPay Deposit button." },
          { q: "What is the 5% fee?", a: "A 5% protocol fee is deducted from the total prize pool before payouts. This funds ongoing development." },
        ].map((item, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-sm font-bold text-white mb-1">{item.q}</p>
            <p className="text-xs text-zinc-400 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-xl p-4">
        <p className="text-xs font-bold text-emerald-400 mb-2">Still need help?</p>
        <a
          href="mailto:support@tactiq.app"
          className="flex items-center gap-2 text-sm text-zinc-300"
        >
          <span>📧</span>
          <span>support@tactiq.app</span>
        </a>
        <p className="text-[10px] text-zinc-600 mt-2">We respond within 24 hours.</p>
      </div>

      {/* Legal links */}
      <div className="flex gap-4 justify-center mt-6">
        <Link href="/terms" className="text-xs text-zinc-600 underline">Terms</Link>
        <Link href="/privacy" className="text-xs text-zinc-600 underline">Privacy</Link>
        <Link href="/stats" className="text-xs text-zinc-600 underline">On-chain Stats</Link>
      </div>
    </div>
  );
}
