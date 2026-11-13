import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Modern Product Slider Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#071126] text-white flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md p-8 rounded-3xl border border-[#162D5D] bg-[#0B152B] shadow-2xl space-y-4">
            <h2 className="text-xl font-black">Dashboard Portal Notice</h2>
            <p className="text-xs text-slate-300">
              A temporary display glitch occurred. Click below to refresh the portal.
            </p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  window.location.hash = '';
                  window.location.reload();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] text-white text-xs font-bold border border-[#2555A8]"
              >
                Reload Portal
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
