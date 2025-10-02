import { createRoot } from "react-dom/client";
import { I18nextProvider } from 'react-i18next';
import App from "./App.tsx";
import "./index.css";
import i18n from './i18n/i18n';

// Forcing a re-render when language changes
const I18nApp = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  );
};

createRoot(document.getElementById("root")!).render(<I18nApp />);