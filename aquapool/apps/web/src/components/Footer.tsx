export function Footer() {
  return (
    <footer className="border-t border-white/5 py-16" style={{ backgroundColor: '#050D1A' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl">
              <span className="w-8 h-8 rounded-lg bg-[#C8FF00] flex items-center justify-center text-[#050D1A] text-sm font-black">A</span>
              <span className="text-[#F0F4FF]">Aqua<span className="text-[#C8FF00]">pool</span></span>
            </div>
            <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs">
              Your global finance hub. Send, earn, and invest across every chain.
            </p>
          </div>

          {[
            { title: 'Platform', links: ['Markets', 'Crypto', 'Stocks', 'DeFi', 'Earn', 'Send & Receive'] },
            { title: 'Company',  links: ['About', 'Blog', 'Careers', 'Press'] },
            { title: 'Legal',    links: ['Privacy policy', 'Terms of service', 'Cookie policy', 'Compliance'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280] mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-[#6B7280] hover:text-[#F0F4FF] transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <p className="text-xs text-[#6B7280]">
            © {new Date().getFullYear()} Aquapool Technologies Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[#6B7280]">
            <span>Not financial advice.</span>
            <span>Crypto involves risk.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
