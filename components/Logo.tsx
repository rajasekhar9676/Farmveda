export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-10 h-10 bg-[#3a8735] rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-xl">FV</span>
      </div>
      <span className="text-2xl font-bold text-[#3a8735]">FarmVeda</span>
    </div>
  );
}

