// Utility functions for safe client-side operations

// Safe window access that works in SSR
export const safeWindow = {
  open: (url: string, target: string = '_blank') => {
    if (typeof window !== 'undefined') {
      window.open(url, target);
    }
  },
  
  redirect: (url: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  },
  
  getScrollY: (): number => {
    if (typeof window !== 'undefined') {
      return window.scrollY;
    }
    return 0;
  },
  
  addEventListener: (event: string, handler: EventListener, options?: AddEventListenerOptions) => {
    if (typeof window !== 'undefined') {
      window.addEventListener(event, handler, options);
    }
  },
  
  removeEventListener: (event: string, handler: EventListener) => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(event, handler);
    }
  }
};

// Safe check for client-side only operations
export const isClient = typeof window !== 'undefined';

// Safe navigation utilities
export const navigate = {
  openInNewTab: (url: string) => safeWindow.open(url, '_blank'),
  redirect: (url: string) => safeWindow.redirect(url)
};