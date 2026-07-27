import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useBackendStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null); // null = vérification en cours
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      await api.get('/health');
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return { isOnline, isChecking, retry: checkStatus };
}