
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx';
import  store  from './Store/store.js';
import {HelmetProvider} from "react-helmet-async";
import {Provider} from 'react-redux';
import { setupAxiosInterceptor } from "./axiosSetup.js";


setupAxiosInterceptor(store);


createRoot(document.getElementById("root")).render(
   <HelmetProvider>
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
  </HelmetProvider>
);

