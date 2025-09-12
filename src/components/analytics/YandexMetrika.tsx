'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export default function YandexMetrika() {
  const pathname = usePathname();
  
  // Не загружаем метрику на админских страницах
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=104136916', 'ym');

            ym(104136916, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
          `,
        }}
      />
      <noscript>
        <div>
          <img 
            src="https://mc.yandex.ru/watch/104136916" 
            style={{ position: 'absolute', left: '-9999px' }} 
            alt="" 
          />
        </div>
      </noscript>
    </>
  );
}
