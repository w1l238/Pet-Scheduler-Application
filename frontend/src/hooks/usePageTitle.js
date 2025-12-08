import { useEffect } from 'react';

const usePageTitle = (title, favicon) => {
  useEffect(() => {
    document.title = title;
    
    const faviconLink = document.querySelector("link[rel*='icon']");
    if (faviconLink) {
      faviconLink.href = favicon;
    } else {
      const newFaviconLink = document.createElement('link');
      newFaviconLink.rel = 'icon';
      newFaviconLink.href = favicon;
      document.head.appendChild(newFaviconLink);
    }
  }, [title, favicon]);
};

export default usePageTitle;
