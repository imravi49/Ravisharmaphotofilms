import React, {useState,useEffect} from 'react';
import Testimonials from '../ui/Testimonials';
import Counters from '../ui/Counters';
import InquiryModal from '../ui/InquiryModal';

export default function Home({adminData}){
  const [open,setOpen] = useState(false);
  const img1 = adminData.images[0] ? adminData.images[0].src : '/assets/photo_1.jpg';
  const img2 = adminData.images[1] ? adminData.images[1].src : '/assets/photo_2.jpg';
  const img3 = adminData.images[2] ? adminData.images[2].src : '/assets/photo_3.jpg';
  useEffect(()=>{
    const btn = document.getElementById('hamb');
    const menu = document.getElementById('menu');
    if(btn && menu) btn.onclick = ()=> menu.classList.toggle('open');
    const onScroll = ()=>{
      const sc = window.scrollY;
      const el1 = document.querySelectorAll('.parallax-left')[0];
      const el2 = document.querySelectorAll('.parallax-right')[0];
      const el3 = document.querySelectorAll('.parallax-left')[1];
      if(el1) el1.style.transform = `translateX(${Math.min(0, sc * -0.05)}px)`;
      if(el2) el2.style.transform = `translateX(${Math.max(0, sc * 0.05)}px)`;
      if(el3) el3.style.transform = `translateX(${Math.min(0, sc * -0.03)}px) scale(${1 - Math.min(0.2, sc/5000)})`;
      const third = document.querySelectorAll('.parallax-left')[1];
      if(third){ const blur = Math.min(6, sc/120); third.style.filter = `blur(${blur}px)`; }
    };
    window.addEventListener('scroll', onScroll);
    return ()=> window.removeEventListener('scroll', onScroll);
  },[]);
  return (<main><div className='cinematic-bg' /><section className='hero'><div className='hero-inner'><div className='logo-text shiny'>{adminData.heroTitle}</div><div className='hero-tag'>{adminData.heroTag}</div><div style={{marginTop:18}}><button className='btn-primary' onClick={()=>setOpen(true)}>Book an Inquiry</button></div><div className='hero-image' style={{backgroundImage:`url(${img1})`}} /></div></section><section className='split'><div className='split-image parallax-left' style={{backgroundImage:`url(${img1})`}} /><div className='split-text'><h3 className='shiny'>{adminData.section1Title}</h3><p>{adminData.section1Text}</p></div></section><section className='split reverse'><div className='split-image parallax-right' style={{backgroundImage:`url(${img2})`}} /><div className='split-text'><h3 className='shiny'>{adminData.section2Title}</h3><p>{adminData.section2Text}</p></div></section><section className='split'><div className='split-image parallax-left blur-on-scroll' style={{backgroundImage:`url(${img3})`}} /><div className='split-text'><h3 className='shiny'>{adminData.section3Title}</h3><p>{adminData.section3Text}</p></div></section><div className='container'><h2>Testimonials</h2><Testimonials list={adminData.testimonials} /><Counters counters={adminData.counters} /></div><div style={{padding:40}}><iframe src='https://widgets.sociablekit.com/google-reviews/iframe/25609141' frameBorder='0' width='100%' height='600' title='google-reviews'></iframe></div>{open && <InquiryModal onClose={()=>setOpen(false)} />}</main>); }