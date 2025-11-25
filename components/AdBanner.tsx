import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
  slotId?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ className, slotId = "9951018964" }) => {
  const adRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    
    try {
      // @ts-ignore
      const adsbygoogle = window.adsbygoogle || [];
      // Check if ad script is loaded
      if (window.document.querySelector('script[src*="adsbygoogle"]')) {
        adsbygoogle.push({});
        initialized.current = true;
      }
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  return (
    <div ref={adRef} className={`w-full flex justify-center items-center bg-gray-100 dark:bg-gray-800 min-h-[100px] rounded-lg overflow-hidden my-4 ${className}`}>
      <div className="text-xs text-gray-400 absolute">Advertisement</div>
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', height: '100px' }}
           data-ad-client="ca-pub-6043947041928262"
           data-ad-slot={slotId}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};