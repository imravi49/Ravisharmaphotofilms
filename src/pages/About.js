import React from 'react';
export default function About({adminData}){
  return (<div className='container'><h2>{adminData.about.title}</h2><p>{adminData.about.text}</p><div style={{marginTop:20}}><button className='btn-primary'>Book an Inquiry</button></div></div>);
}