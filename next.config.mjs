/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict Mode's dev-only double-invoke of effects (mount → cleanup →
  // mount again) doesn't play well with @react-three/fiber's <Canvas>,
  // which creates a real WebGL context/canvas element outside React's
  // normal render path. Combined with GSAP/Lenis also mutating the DOM in
  // the same section, the rapid double-mount was corrupting React's fiber
  // tree ("insertBefore … not a child of this node") on page load in dev.
  // This only affects `next dev` — production builds never double-invoke
  // effects regardless of this setting, so nothing changes for real users.
  reactStrictMode: false,
};

export default nextConfig;
