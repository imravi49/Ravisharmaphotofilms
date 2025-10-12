import React, {useState,useEffect, useCallback} from 'react';
import { useDropzone } from 'react-dropzone';
import { signInWithGoogle, signOutUser, onAuthChange, uploadFile, firebaseApp } from '../firebaseClient';

export default function AdminPanel({adminData, setAdminData}){
  const [user,setUser] = useState(null);
  const [tab,setTab] = useState('general');

  useEffect(()=>{
    if(onAuthChange){
      const unsub = onAuthChange(u=> setUser(u));
      return ()=> unsub && unsub();
    }
  },[]);

  const update = (k,v)=> setAdminData({...adminData,[k]:v});
  const updateNested = (path, v)=>{ const copy = JSON.parse(JSON.stringify(adminData)); const keys = path.split('.'); let cur = copy; for(let i=0;i<keys.length-1;i++) cur = cur[keys[i]]; cur[keys[keys.length-1]] = v; setAdminData(copy); };

  const onImagesDrop = useCallback(async (files)=>{
    const added=[];
    for(const f of files){
      if(firebaseApp){
        try{ const url = await uploadFile(`images/${Date.now()}_${f.name}`, f); added.push({id:Date.now()+Math.random(), src:url, name:f.name, category:'Wedding'}); continue; }catch(e){ console.warn(e); }
      }
      const url = URL.createObjectURL(f);
      added.push({id:Date.now()+Math.random(), src:url, name:f.name, category:'Wedding'});
    }
    if(added.length) update('images', [...adminData.images, ...added]);
  },[adminData]);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop:onImagesDrop, multiple:true, accept:{'image/*':[]}});

  function removeImage(id){ update('images', adminData.images.filter(i=> i.id !== id)); }
  function changeImageCategory(id,cat){ update('images', adminData.images.map(i=> i.id===id? {...i,category:cat}: i)); }

  function addVideo(url, place){ update('videos', [...adminData.videos, {id:Date.now()+Math.random(), url, place}]); }
  function removeVideo(id){ update('videos', adminData.videos.filter(v=> v.id !== id)); }

  return (<div style={{padding:20,maxWidth:1100,margin:'24px auto',color:'#ddd'}}><h2>Admin Panel</h2>{!user? (<div><p>Sign in with Google (ravi.rv73838@gmail.com)</p><button className='btn-primary' onClick={()=>signInWithGoogle().catch(e=>alert(e.message))}>Sign in with Google</button></div>) : (<div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div>Signed in as {user.email}</div><div><button className='btn-ghost' onClick={()=>signOutUser().then(()=>setUser(null))}>Sign out</button></div></div><div style={{display:'flex',gap:8,marginTop:12}}>{['general','about','images','videos','seo'].map(t=>(<button key={t} onClick={()=>setTab(t)} className='btn-ghost'>{t.toUpperCase()}</button>))}<div style={{marginTop:12}}>{tab==='general' && (<div><label>Hero Title</label><input value={adminData.heroTitle} onChange={e=>update('heroTitle',e.target.value)} /><label>Hero Tag</label><input value={adminData.heroTag} onChange={e=>update('heroTag',e.target.value)} /></div>)}{tab==='about' && (<div><label>About Title</label><input value={adminData.about.title} onChange={e=>updateNested('about.title', e.target.value)} /><label>About Text</label><textarea value={adminData.about.text} onChange={e=>updateNested('about.text', e.target.value)} /></div>)}{tab==='images' && (<div><h3>Images</h3><div {...getRootProps()} style={{border:'2px dashed rgba(197,166,84,0.3)',padding:12,borderRadius:8,cursor:'pointer'}}><input {...getInputProps()} />{isDragActive? <p>Drop here</p>: <p>Drag & drop images or click to upload</p>}</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginTop:12}}>{adminData.images.map(img=>(<div key={img.id} style={{background:'#111',padding:8,borderRadius:8}}><div style={{height:120,backgroundImage:`url(${img.src})`,backgroundSize:'cover',backgroundPosition:'center',borderRadius:6}} /><div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}><select value={img.category} onChange={e=>changeImageCategory(img.id,e.target.value)}>{adminData.portfolioSections.map(s=>(<option key={s} value={s}>{s}</option>))}</select><button className='btn-ghost' onClick={()=>removeImage(img.id)}>Remove</button></div></div>))}</div></div>)}{tab==='videos' && (<div><h3>Videos</h3><VideoManager addVideo={addVideo} videos={adminData.videos} removeVideo={removeVideo} /></div>)}{tab==='seo' && (<div><label>Meta Title</label><input value={adminData.seo.title} onChange={e=>updateNested('seo.title', e.target.value)} /><label>Meta Description</label><textarea value={adminData.seo.description} onChange={e=>updateNested('seo.description', e.target.value)} /></div>)}</div></div>)}</div>);
}

function VideoManager({addVideo,videos,removeVideo}){
  const [url,setUrl] = React.useState('');
  const [place,setPlace] = React.useState('Portfolio');
  return (<div><div style={{display:'flex',gap:8,alignItems:'center'}}><input placeholder='YouTube URL' value={url} onChange={e=>setUrl(e.target.value)} style={{flex:1}} /><select value={place} onChange={e=>setPlace(e.target.value)}><option>Portfolio</option><option>Films</option></select><button className='btn-primary' onClick={()=>{ if(url) addVideo(url,place); setUrl(''); }}>Add</button></div><div style={{marginTop:12}}>{videos.map(v=>(<div key={v.id} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}><div style={{flex:1,wordBreak:'break-all'}}>{v.url}</div><div><button className='btn-ghost' onClick={()=>removeVideo(v.id)}>Remove</button></div></div>))}</div></div>);
}
