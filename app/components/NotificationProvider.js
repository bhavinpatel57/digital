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
    background: 'var(--ex-info-g1)',
    titleColor: 'var(--ex-info-primary-dark)',
    messageColor: 'var(--ex-info-primary)',
  },
  success: {
    background: 'var(--ex-success-g1)',
    titleColor: 'var(--ex-success-primary-dark)',
    messageColor: 'var(--ex-success-primary)',
  },
  warn: {
    background: 'var(--ex-warning-g1)',
    titleColor: 'var(--ex-warning-primary-dark)',
    messageColor: 'var(--ex-warning-primary)',
  },
  alert: {
    background: 'var(--ex-danger-g1)',
    titleColor: 'var(--ex-danger-primary-dark)',
    messageColor: 'var(--ex-danger-primary)',
  },
  active: {
    background: 'var(--ex-active-g1)',
    titleColor: 'var(--ex-active-primary-dark)',
    messageColor: 'var(--ex-active-primary)',
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
      <ExNotification ref={ref} position="top-center" mergeDuplicates        style={{ '--exc-border': 'none','--exc-box-shadow':'var(--ex-box-shadow-primary)' }} 
        closeButton={false}/>
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
