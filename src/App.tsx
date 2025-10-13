import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MESModernization from './pages/MESModernization';
import GreatBakeOff from './pages/GreatBakeOff';
import SoftwareRFPRequirements from './pages/SoftwareRFPRequirements';
import DeliveryServicesRequirements from './pages/DeliveryServicesRequirements';
import SliceRFPResponse from './pages/SliceRFPResponse';
import LayerRFPResponse from './pages/LayerRFPResponse';
import SoftwareProviderRFPResponse from './pages/SoftwareProviderRFPResponse';
import Feedback from './pages/Feedback';
import ReferenceMaterials from './pages/ReferenceMaterials';
import FAQs from './pages/FAQs';
import MESTraining from './pages/MESTraining';
import Chatbot from './pages/Chatbot';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mes-modernization" element={<MESModernization />} />
          <Route path="/great-bake-off" element={<GreatBakeOff />} />
          <Route path="/software-rfp-requirements" element={<SoftwareRFPRequirements />} />
          <Route path="/delivery-services-requirements" element={<DeliveryServicesRequirements />} />
          <Route path="/slice-rfp-response" element={<SliceRFPResponse />} />
          <Route path="/layer-rfp-response" element={<LayerRFPResponse />} />
          <Route path="/software-provider-rfp-response" element={<SoftwareProviderRFPResponse />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/reference-materials" element={<ReferenceMaterials />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/mes-training" element={<MESTraining />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;