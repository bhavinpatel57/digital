'use client';
import { useEffect } from 'react';

export default function ElementXLoader() {
  useEffect(() => {
    import('@bhavinpatel57/element-x').then((mod) => {
      mod.ensureGlobalStyles?.();
    });
  }, []);

  return null;
}
