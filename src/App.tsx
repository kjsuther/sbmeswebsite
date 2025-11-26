import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
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
import MESAdmin from './pages/MESAdmin';
import RFIEngagementInsights from './pages/RFIEngagementInsights';
import MasterContractSubmission from './pages/MasterContractSubmission';
import WorkOrderContract from './pages/WorkOrderContract';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <Router>
      <ScrollToTop />
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
          <Route path="/rfi-engagement-insights" element={<RFIEngagementInsights />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/mes-admin" element={<MESAdmin />} />
          <Route path="/master-contract-submission" element={<MasterContractSubmission />} />
          <Route path="/work-order-contract" element={<WorkOrderContract />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;