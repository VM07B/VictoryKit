import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with GSAP
const ScrollHomePage = dynamic(
  () => import('@/components/ScrollHomePage'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen w-full bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-white/50">Loading maula.ai...</p>
        </div>
      </div>
    )
  }
);

export default function HomePage() {
  return <ScrollHomePage />;
}
