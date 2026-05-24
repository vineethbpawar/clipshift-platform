import React from "react";
import Link from "next/link";
import { MessageSquare, Camera, Terminal, Play } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <span className="text-2xl font-black tracking-tighter text-white">
                CLIP<span className="text-neon-purple">SHIFT</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              The world's premier marketplace for cinematic assets and digital creations. 
              Elevating creator commerce to a cinematic level.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Marketplace</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-neon-purple transition-colors">Video Assets</Link></li>
              <li><Link href="#" className="hover:text-neon-purple transition-colors">3D Models</Link></li>
              <li><Link href="#" className="hover:text-neon-purple transition-colors">Audio Tracks</Link></li>
              <li><Link href="#" className="hover:text-neon-purple transition-colors">Visual Effects</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-neon-purple transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-neon-purple transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-neon-purple transition-colors">Creator Guide</Link></li>
              <li><Link href="#" className="hover:text-neon-purple transition-colors">Community</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Connect</h4>
            <div className="flex space-x-4 mb-8">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <MessageSquare size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Camera size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Terminal size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Play size={20} />
              </Link>
            </div>
            <p className="text-gray-400 text-sm">
              Subscribe to our newsletter for cinematic drops.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <p>© 2026 ClipShift Platform. All rights reserved.</p>
            <p className="font-bold text-gray-400">Contact: clipshiftplatform@gmail.com</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Service</Link>
            <Link href="#" className="hover:text-white">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
