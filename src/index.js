import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App';
import reportWebVitals from './reportWebVitals';

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

// Monitor performance metrics
reportWebVitals(metric => {
  // Send to analytics
  console.log(metric);

  // You can send to your analytics service here
  if (metric.name === 'FCP') {
    // First Contentful Paint
    console.log('FCP:', metric.value);
  }
  if (metric.name === 'LCP') {
    // Largest Contentful Paint
    console.log('LCP:', metric.value);
  }
});
