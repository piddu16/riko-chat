import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this app (silences the multi-lockfile warning
  // that appears because a stray package-lock.json exists at ~/Downloads/).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
