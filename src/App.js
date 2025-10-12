import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Films from "./pages/Films";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminPanel from "./admin/AdminPanel";
import InquiryModal from "./ui/InquiryModal";
import "./styles.css";

export default function App() {
  const [inquiryOpen, setInquiryOpen] = React.useState(false);

  return (
    <Router>
      <div className="App">
        {/* Main routes */}
        <Routes>
          <Route path="/" element={<Home openInquiry={() => setInquiryOpen(true)} />} />
          <Route path="/portfolio" element={<Portfolio openInquiry={() => setInquiryOpen(true)} />} />
          <Route path="/films" element={<Films openInquiry={() => setInquiryOpen(true)} />} />
          <Route path="/about" element={<About openInquiry={() => setInquiryOpen(true)} />} />
          <Route path="/contact" element={<Contact openInquiry={() => setInquiryOpen(true)} />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>

        {/* Inquiry Modal */}
        {inquiryOpen && <InquiryModal onClose={() => setInquiryOpen(false)} />}

        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.me/917383826282"
          className="whatsapp-float"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/assets/icon_wa.png" alt="WhatsApp" />
        </a>

        {/* Cinematic Animated Background */}
        <div className="cinematic-bg"></div>
      </div>
    </Router>
  );
}
