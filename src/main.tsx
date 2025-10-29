import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

console.log('main.tsx loading...');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">ERROR: Root element not found</div>';
} else {
  try {
    console.log('Creating React root...');
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    console.log('React root created successfully');
  } catch (error) {
    console.error('Error creating React root:', error);
    document.body.innerHTML = `<div style="padding: 20px; color: red;">ERROR: ${error}</div>`;
  }
}
