import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/public/Home';
import About from './pages/public/About';
import Portfolio from './pages/public/Portfolio';
import StoryDetails from './pages/public/StoryDetails';
import PublicPricing from './pages/public/Pricing';
import Contact from './pages/public/Contact';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import MediaLibrary from './pages/admin/MediaLibrary';
import Banners from './pages/admin/Banners';
import Categories from './pages/admin/Categories';
import Stories from './pages/admin/Stories';
import Testimonials from './pages/admin/Testimonials';
import AdminPricing from './pages/admin/Pricing';
import PortfolioAdmin from './pages/admin/Portfolio';
import CRM from './pages/admin/CRM';
import Revenue from './pages/admin/Revenue';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="portfolio/:slug" element={<StoryDetails />} />
            <Route path="pricing" element={<PublicPricing />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Admin Auth Route */}
          <Route path="/admin/login" element={<Login />} />

          {/* Secure Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="banners" element={<Banners />} />
            <Route path="categories" element={<Categories />} />
            <Route path="stories" element={<Stories />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="portfolio" element={<PortfolioAdmin />} />
            <Route path="crm" element={<CRM />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
      <ToastContainer position="bottom-right" theme="colored" />
    </Router>
  );
}

export default App;
