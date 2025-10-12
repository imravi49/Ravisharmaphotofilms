import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminPanel from "./admin/AdminPanel";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Films from "./pages/Films";
import About from "./pages/About";
import Contact from "./pages/Contact";
import InquiryModal from "./ui/InquiryModal";
import "./styles.css";

export default function App() {
  const [adminData, setAdminData] = useState(() => {
    const s = localStorage.getItem("ravisharm_full_admin_data");
    return s
      ? JSON.parse(s)
      : {
          heroSlides: [
            { src: "/assets/photo_1.jpg", text: "Cinematic Wedding Stories" },
            { src: "/assets/photo_2.jpg", text: "Unscripted Candid Emotions" },
            { src: "/assets/photo_3.jpg", text: "Memories in Golden Frames" },
          ],
        };
  });
  useEffect(() => {
    localStorage.setItem("ravisharm_full_admin_data", JSON.stringify(adminData));
  }, [adminData]);

  return (
    <Router>
      <div className="app-shell">
        <nav className="topnav">
          <div className="nav-left">
            <Link to="/" className="brand">
              {adminData.logo ? (
                <img src={adminData.logo} alt="logo" style={{ height: 36 }} />
              ) : (
                <span className="brand-text">Ravi Sharma Photo & Films</span>
              )}
            </Link>
          </div>
          <div className="nav-right">
            <button className="hamb-btn" id="hamb">
              ☰
            </button>
            <div className="menu" id="menu">
              <Link to="/">Home</Link>
              <Link to="/portfolio">Portfolio</Link>
              <Link to="/films">Films</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/admin">Admin</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home adminData={adminData} />} />
          <Route
            path="/portfolio"
            element={<Portfolio adminData={adminData} />}
          />
          <Route path="/films" element={<Films adminData={adminData} />} />
          <Route path="/about" element={<About adminData={adminData} />} />
          <Route path="/contact" element={<Contact adminData={adminData} />} />
          <Route
            path="/admin"
            element={
              <AdminPanel adminData={adminData} setAdminData={setAdminData} />
            }
          />
        </Routes>

        <InquiryModal />
        <div className="site-global-buttons">
          <a
            href="https://wa.me/917383826282"
            target="_blank"
            rel="noreferrer"
            className="whatsapp-fab"
          >
            <img src="/assets/icon_wa.png" alt="wa" />
          </a>
          <button
            className="book-enquiry-fab"
            onClick={() =>
              window.dispatchEvent(new Event("open-enquiry-modal"))
            }
          >
            Book Enquiry
          </button>
        </div>
      </div>
    </Router>
  );
}
