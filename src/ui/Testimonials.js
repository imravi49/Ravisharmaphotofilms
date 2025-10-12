import React, {useState,useEffect} from 'react';
export default function Testimonials({list}){
  const [i,setI]=useState(0);
  useEffect(()=>{ const t=setInterval(()=>setI(s=> (s+1)%list.length),4000); return ()=>clearInterval(t); },[list.length]);
  return (
    <div className='test-wrap'>
      <div className='test-track' style={{transform:`translateX(-${i*100}%)`}}>
        {list.map((t,idx)=>(
          <div key={idx} className='test-card'>
            <div className='stars'>★★★★★</div>
            <p>{t.text}</p>
            <div style={{marginTop:8,fontWeight:700}}>— {t.author}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:12}}>
        <button className='btn-primary small' onClick={()=>setI(i=> (i-1+list.length)%list.length)}>Prev</button>
        <button className='btn-primary small' onClick={()=>setI(i=> (i+1)%list.length)}>Next</button>
      </div>
    </div>
  );
}