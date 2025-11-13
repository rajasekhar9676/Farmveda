import Image from 'next/image';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/Farmveda_Logo.avif"
        alt="FarmVeda Logo"
        width={180}
        height={60}
        className="h-auto w-auto object-contain"
        priority
      />
    </div>
  );
}


