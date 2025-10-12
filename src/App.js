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
        <Routes>
          <Route
            path="/"
            element={<Home openInquiry={() => setInquiryOpen(true)} />}
          />
          <Route
            path="/portfolio"
            element={<Portfolio openInquiry={() => setInquiryOpen(true)} />}
          />
          <Route
            path="/films"
            element={<Films openInquiry={() => setInquiryOpen(true)} />}
          />
          <Route
            path="/about"
            element={<About openInquiry={() => setInquiryOpen(true)} />}
          />
          <Route
            path="/contact"
            element={<Contact openInquiry={() => setInquiryOpen(true)} />}
          />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>

        {inquiryOpen && <InquiryModal onClose={() => setInquiryOpen(false)} />}

        {/* Floating WhatsApp button */}
        <a
          className="fab-wa"
          href="https://wa.me/917383826282"
          target="_blank"
          rel="noreferrer"
        >
          <img src="/assets/icon_wa.png" alt="WhatsApp" />
        </a>
      </div>
    </Router>
  );
}
