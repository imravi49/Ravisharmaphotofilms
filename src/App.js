import React, {useState,useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminPanel from './admin/AdminPanel';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Films from './pages/Films';
import About from './pages/About';
import Contact from './pages/Contact';

export default function App(){
  const [adminData, setAdminData] = useState(()=>{ const s=localStorage.getItem('ravisharm_full_admin_data'); return s? JSON.parse(s): {
    heroTitle:'Ravi Sharma Photo & Films', heroTag:'Cinematic wedding films & timeless photography — Anand',
    section1Title:'Wedding Filmmakers', section1Text:'We tell cinematic stories.', section2Title:'Candid Photographers', section2Text:'Unscripted moments captured.', section3Title:'Why hire us', section3Text:'We turn seconds into memories.',
    testimonials:[{author:'Soumil Patel',text:"One the best experiences i had with tasweer studio's photographer..absolutely professionals, they were beyond expectations."},{author:'Patel Paranj',text:'You were extremely professional and hard working and took some fantastic photos.'},{author:'Vrushali Shah',text:'He as an Artist works so amazing with beautiful Concepts.'},{author:'Vishva Patel',text:'Thank you for capturing these precious moments for us.'},{author:'Patel Kreena',text:'Fabulous editing and those poses also eventually your loving behavior made memorable days.'},{author:'Mohit Patel',text:'We were one of the first photoshoots they did and during that time we thought they were amazing.'}],
    counters:{cities:12,couples:1520,photos:120000,videos:3450},
    portfolioSections:['Wedding','Pre-Wedding','Haldi Vibes','Sangeet Chaos','Ring Ceremony'],
    images:[
      {id:1,src:'/assets/photo_1.jpg',category:'Wedding'},{id:2,src:'/assets/photo_2.jpg',category:'Pre-Wedding'},{id:3,src:'/assets/photo_3.jpg',category:'Haldi Vibes'},{id:4,src:'/assets/photo_4.jpg',category:'Sangeet Chaos'},{id:5,src:'/assets/photo_5.jpg',category:'Ring Ceremony'},{id:6,src:'/assets/photo_6.jpg',category:'Wedding'},{id:7,src:'/assets/photo_7.jpg',category:'Wedding'},{id:8,src:'/assets/photo_8.jpg',category:'Pre-Wedding'},{id:9,src:'/assets/photo_9.jpg',category:'Haldi Vibes'},{id:10,src:'/assets/photo_10.jpg',category:'Sangeet Chaos'}],
    videos:[{id:1,url:'https://www.youtube.com/embed/dGzyG4NqEYk',place:'Portfolio'},{id:2,url:'https://www.youtube.com/embed/dQw4w9WgXcQ',place:'Portfolio'},{id:3,url:'https://www.youtube.com/embed/ysz5S6PUM-U',place:'Films'},{id:4,url:'https://www.youtube.com/embed/ScMzIvxBSi4',place:'Films'}],
    logo:null,
    about:{title:'About Us',text:'We are a wedding photography and film studio based in Anand, capturing cinematic moments with passion and creativity.'},
    seo:{title:'Ravi Sharma Photo & Films',description:'Cinematic wedding photography and films in Anand',keywords:'wedding photography, wedding films'}
  }; });
  useEffect(()=>{ localStorage.setItem('ravisharm_full_admin_data', JSON.stringify(adminData)); },[adminData]);
  return (
    <Router>
      <div className="app-shell">
        <nav className="topnav">
          <div className="nav-left"><Link to="/" className="brand">{adminData.logo ? <img src={adminData.logo} alt="logo" style={{height:36}}/> : <span className="brand-text">Ravi Sharma Photo & Films</span>}</Link></div>
          <div className="nav-right">
            <button className="hamb-btn" id="hamb">☰</button>
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
          <Route path="/portfolio" element={<Portfolio adminData={adminData} />} />
          <Route path="/films" element={<Films adminData={adminData} />} />
          <Route path="/about" element={<About adminData={adminData} />} />
          <Route path="/contact" element={<Contact adminData={adminData} />} />
          <Route path="/admin" element={<AdminPanel adminData={adminData} setAdminData={setAdminData} />} />
        </Routes>
      </div>
    </Router>
  );
}
