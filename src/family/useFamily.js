import {useState,useEffect,useCallback} from 'react';
import {loadFamily} from './familyStore.js';
export function useFamily(){
 const [data,setData]=useState({learners:[],works:[],plans:[]}),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{const loaded=await loadFamily();setData(loaded);return loaded;},[]);
 useEffect(()=>{let active=true;loadFamily().then(d=>{if(active)setData(d);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 const run=async action=>{if(busy)return;setBusy(true);setError('');try{await action();await refresh();}catch(e){setError(e.message||'Could not save locally. Check storage or try a smaller file.');}finally{setBusy(false);}};
 return {data,error,setError,busy,loading,run,refresh};
}
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
