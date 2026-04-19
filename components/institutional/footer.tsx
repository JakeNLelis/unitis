import { ShieldCheck, HardDrive, Globe, Lock } from "lucide-react";
import { Logo } from "@/components/logo";
import Link from "next/link";

export function InstitutionalFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t-4 border-foreground bg-surface-low mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          {/* Brand & Registry Info */}
          <div className="md:col-span-4 space-y-6">
            <Logo size="lg" color="blue" />
            <p className="text-sm font-medium leading-relaxed max-w-xs">
              Plenum is the authoritative electoral management platform for university student bodies, 
              engineered for absolute transparency and auditability.
            </p>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-1">
                <ShieldCheck className="size-3 text-primary" />
                Verified
              </div>
              <div className="flex items-center gap-1">
                <Lock className="size-3 text-primary" />
                Encrypted
              </div>
              <div className="flex items-center gap-1">
                <HardDrive className="size-3 text-primary" />
                V4.2.0-STABLE
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Navigation</h4>
            <ul className="space-y-2 text-sm font-bold uppercase tracking-tight">
              <li><Link href="/" className="hover:text-primary transition-colors">Registry Home</Link></li>
              <li><Link href="/archive" className="hover:text-primary transition-colors">Public Archive</Link></li>
              <li><Link href="/officer/elections" className="hover:text-primary transition-colors">Officer Portal</Link></li>
            </ul>
          </div>

          {/* Institutional Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Legalities</h4>
            <ul className="space-y-2 text-sm font-bold uppercase tracking-tight">
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Use</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Audit Standards</Link></li>
            </ul>
          </div>

          {/* Status Overlay */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Global Registry Status</h4>
            <div className="bg-background border-2 border-foreground p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest">Network Status</span>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600">
                  <div className="size-1.5 rounded-full bg-green-600 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest">Latency</span>
                <span className="text-[10px] font-mono font-bold tracking-widest">0.024ms</span>
              </div>
              <div className="pt-2 border-t border-foreground/10 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest italic opacity-50">Local ID</span>
                <span className="text-[10px] font-mono font-bold tracking-widest opacity-50">#PX-849-AUTH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Bottom Bar */}
        <div className="mt-12 pt-8 border-t-2 border-foreground/10 flex flex-col md:flex-row justify-between gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            © {currentYear} PLENUM ELECTION MANAGEMENT SYSTEM. ALL RIGHTS RESERVED. 
            DISTRIBUTION RESTRICTED UNDER SEB PROTOCOL.
          </p>
          <div className="flex items-center gap-4">
            <Globe className="size-4 text-muted-foreground" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Global Instance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
