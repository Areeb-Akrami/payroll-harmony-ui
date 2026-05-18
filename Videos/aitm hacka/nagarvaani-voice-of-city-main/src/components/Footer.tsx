import { Link } from "@tanstack/react-router";
import { Megaphone, Heart, Github, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-24 bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-civic">
              <Megaphone className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="font-display text-xl font-bold">NagarVaani</div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
            A civic-tech platform amplifying citizen voices and accelerating municipal response across Bhatkal's 12 wards.
          </p>
          <div className="mt-5 flex gap-2">
            {[Twitter, Github, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Platform</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/submit" className="hover:text-foreground text-muted-foreground">Report Issue</Link></li>
            <li><Link to="/map" className="hover:text-foreground text-muted-foreground">City Map</Link></li>
            <li><Link to="/analytics" className="hover:text-foreground text-muted-foreground">Analytics</Link></li>
            <li><Link to="/leaderboard" className="hover:text-foreground text-muted-foreground">Leaderboard</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Languages</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>English</li><li>ಕನ್ನಡ Kannada</li><li>हिन्दी Hindi</li><li>اردو Urdu</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-5 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        Made with <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> for Bhatkal · © 2026 NagarVaani
      </div>
    </footer>
  );
}