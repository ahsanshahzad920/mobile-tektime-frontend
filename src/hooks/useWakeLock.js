import { useEffect, useCallback, useRef } from 'react';

const useWakeLock = () => {
  const wakeLock = useRef(null);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLock.current = await navigator.wakeLock.request('screen');
        console.log('Screen Wake Lock is active');

        wakeLock.current.addEventListener('release', () => {
          console.log('Screen Wake Lock was released');
        });
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    } else {
      console.warn('Wake Lock API not supported in this browser');
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

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial request
    requestWakeLock();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock]);

  return { requestWakeLock, releaseWakeLock };
};

export default useWakeLock;
