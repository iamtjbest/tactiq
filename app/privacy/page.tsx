// app/privacy/page.tsx — Privacy Policy (required for MiniPay listing)
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-4 max-w-sm mx-auto">
      <a href="/" className="text-zinc-400 text-sm block mb-4">← Back</a>
      <h1 className="text-xl font-bold text-white mb-4">Privacy Policy</h1>
      <div className="text-sm text-zinc-400 space-y-4 leading-relaxed">
        <p>Last updated: June 2026</p>
        <p>TactiQ collects minimal data to operate the service.</p>
        <p><strong className="text-white">Data We Collect:</strong> Your Celo wallet address (automatically provided by MiniPay) and your prediction history stored on-chain. We do not collect names, emails, or personal identifiers.</p>
        <p><strong className="text-white">On-Chain Data:</strong> All predictions are recorded on the public Celo blockchain and are permanently viewable. Do not make predictions you wish to keep private.</p>
        <p><strong className="text-white">AI Tips:</strong> When you request an AI tip, your team names are sent to our backend (Gemini API). No personal data is sent.</p>
        <p><strong className="text-white">No Third-Party Tracking:</strong> We do not use cookies, advertising trackers, or sell your data.</p>
        <p><strong className="text-white">Contact:</strong> Reach us on Telegram: t.me/TactiQPredict</p>
      </div>
    </div>
  );
}
