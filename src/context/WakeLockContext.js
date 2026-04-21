import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';

const WakeLockContext = createContext(null);

export const WakeLockProvider = ({ children }) => {
  const wakeLock = useRef(null);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLock.current = await navigator.wakeLock.request('screen');
        console.log('✅ Screen Wake Lock is active');

        wakeLock.current.addEventListener('release', () => {
          console.log('🔓 Screen Wake Lock was released');
        });
      } catch (err) {
        console.error(`❌ Wake Lock Error: ${err.name}, ${err.message}`);
      }
    } else {
      console.warn('⚠️ Wake Lock API not supported');
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock.current) {
      await wakeLock.current.release();
      wakeLock.current = null;
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLock.current !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    const handleInteraction = async () => {
      if (!wakeLock.current) {
        await requestWakeLock();
      }
      // Remove listeners once lock is attempt or interaction happens
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    
    // Initial attempt (might be blocked without gesture on some versions)
    requestWakeLock();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock]);

  return (
    <WakeLockContext.Provider value={{ requestWakeLock, releaseWakeLock }}>
      {children}
    </WakeLockContext.Provider>
  );
};

export const useWakeLockContext = () => {
  const context = useContext(WakeLockContext);
  if (!context) {
    throw new Error('useWakeLockContext must be used within a WakeLockProvider');
  }
  return context;
};
