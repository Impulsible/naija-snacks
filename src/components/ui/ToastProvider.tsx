import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1C1C1C',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          iconTheme: {
            primary: '#16804A',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#E85D3F',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default ToastProvider;