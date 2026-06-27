// app/terms/page.tsx — Terms of Service (required for MiniPay listing)
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-4 max-w-sm mx-auto">
      <a href="/" className="text-zinc-400 text-sm block mb-4">← Back</a>
      <h1 className="text-xl font-bold text-white mb-4">Terms of Service</h1>
      <div className="text-sm text-zinc-400 space-y-4 leading-relaxed">
        <p>Last updated: June 2026</p>
        <p>By using TactiQ, you agree to these terms. TactiQ is a prediction game on the Celo blockchain where users stake USDm stablecoins on football formation predictions.</p>
        <p><strong className="text-white">Eligibility:</strong> You must be 18 or older to use this service. Users are responsible for complying with local laws regarding prediction games.</p>
        <p><strong className="text-white">Staking:</strong> Staked USDm is held in a smart contract on Celo Mainnet. Results are settled on-chain after each match. The protocol retains a 5% fee from winning pools.</p>
        <p><strong className="text-white">No Warranties:</strong> The service is provided "as is". AI tactical tips are for entertainment purposes and do not constitute financial or betting advice.</p>
        <p><strong className="text-white">Smart Contract Risk:</strong> Blockchain transactions are irreversible. Ensure you understand the risks before staking.</p>
        <p><strong className="text-white">Contact:</strong> For support, reach us on Telegram: t.me/TactiQPredict</p>
      </div>
    </div>
  );
}
