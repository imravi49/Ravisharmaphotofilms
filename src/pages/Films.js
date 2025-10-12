import React from 'react';
export default function Films({adminData}){
  const vids = adminData.videos.filter(v=>v.place==='Films').map(v=>v.url);
  return (<div className='container'><h2>Films</h2><div className='videos-grid-full'>{vids.map((v,i)=>(<div className='vid-full' key={i}><iframe src={v} title={'f'+i} frameBorder='0' allowFullScreen></iframe></div>))}</div></div>);
}