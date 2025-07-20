'use client';

import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
} from 'react';

const NotificationContext = createContext(null);

let globalNotify = () => {};

// Define preset styles
const PRESET_STYLES = {
  info: {
    background: 'var(--ex-info-primary)',
    titleColor: 'var(--ex-text-white)',
    messageColor: 'var(--ex-text-white)',
  },
  success: {
    background: 'var(--ex-success-primary)',
    titleColor: 'var(--ex-text-white)',
    messageColor: 'var(--ex-text-white)',
  },
  warn: {
    background: 'var(--ex-warning-primary)',
    titleColor: 'var(--ex-text-white)',
    messageColor: 'var(--ex-text-white)',
  },
  alert: {
    background: 'var(--ex-danger-primary)',
    titleColor: 'var(--ex-text-white)',
    messageColor: 'var(--ex-text-white)',
  },
  active: {
    background: 'var(--ex-active-primary)',
    titleColor: 'var(--ex-text-white)',
    messageColor: 'var(--ex-text-white)',
  },
};

export function NotificationProvider({ children }) {
  const ref = useRef(null);
  const [ExNotification, setExNotification] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@bhavinpatel57/element-x').then((mod) => {
        setExNotification(() => mod.ExNotification);
      });
    }
  }, []);

  useEffect(() => {
    globalNotify = ({ type, title, message, ...rest }) => {
      const preset = PRESET_STYLES[type] || {};
      ref.current?.addNotification?.({
        title,
        message,
        duration: 5000,
        align: 'left',
        ...preset,
        ...rest,
      });
    };
  }, []);

  if (!ExNotification) return null;

  return (
    <NotificationContext.Provider value={{ notify: globalNotify }}>
      {children}
      <ExNotification ref={ref} position="bottom-right" mergeDuplicates/>
    </NotificationContext.Provider>
  );
}

export function notifyGlobal({ type, title, message, ...rest }) {
  globalNotify?.({ type, title, message, ...rest });
}

export function useNotify() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotify must be used within NotificationProvider');
  }
  return context.notify;
}
