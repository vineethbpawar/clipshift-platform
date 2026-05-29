import React from "react";
import Link from "next/link";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="bg-black py-16 px-4 md:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/logo.png"
              alt="ClipShift"
              width={140}
              height={40}
              className="h-10 w-auto object-contain brightness-110"
            />
          </Link>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
            ClipShift connects clients with skilled video creators for editing, shooting, portfolios, proposals, and secure project communication.
          </p>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Platform</h4>
          <ul className="space-y-4">
            <li><Link href="/marketplace" className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-neon-purple transition-colors">Find Creators</Link></li>
            <li><Link href="/post-project" className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-neon-purple transition-colors">Post a Project</Link></li>
            <li><Link href="/projects" className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-neon-purple transition-colors">Browse Projects</Link></li>
            <li><Link href="/pricing" className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-neon-purple transition-colors">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Resources</h4>
          <ul className="space-y-4">
            <li><Link href="/how-it-works" className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-neon-purple transition-colors">How It Works</Link></li>
            <li><Link href="/creator-guide" className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-neon-purple transition-colors">Creator Guide</Link></li>
            <li><Link href="/client-guide" className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-neon-purple transition-colors">Client Guide</Link></li>
            <li><Link href="/help" className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-neon-purple transition-colors">Help Center</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Company</h4>
          <ul className="space-y-4">
            <li><Link href="/about" className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-neon-purple transition-colors">About ClipShift</Link></li>
            <li><Link href="/contact" className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-neon-purple transition-colors">Contact</Link></li>
            <li><Link href="/terms" className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-neon-purple transition-colors">Terms</Link></li>
            <li><Link href="/privacy" className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-neon-purple transition-colors">Privacy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">© 2026 ClipShift Collective</p>
        <p className="text-[9px] text-neon-blue font-bold uppercase tracking-widest">clipshiftplatform@gmail.com</p>
      </div>
    </footer>
  );
};
