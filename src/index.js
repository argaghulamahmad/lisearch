import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App';

// Import styles asynchronously
import('antd/dist/antd.css');

// Create root with concurrent features
const root = createRoot(document.getElementById('root'));

// Render with performance optimization settings
root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
      virtual={true}
      input={{ autoComplete: 'off' }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
