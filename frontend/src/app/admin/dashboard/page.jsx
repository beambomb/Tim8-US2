"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import {Panel,Loading,Alert,Button,errorText} from "@/components/admin/UI";
import {adminService} from "@/features/admin/services/adminService";
export default function Dashboard(){const [data,setData]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 const load=async()=>{setLoading(true);setError("");try{setData((await adminService.getStats()).data)}catch(e){setError(errorText(e))}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const cards=data?[{name:"Total pengguna",value:data.users?.total},{name:"Pencari kos",value:data.users?.pencari},{name:"Pemilik kos",value:data.users?.pemilik},{name:"Administrator",value:data.users?.admin},{name:"Total properti",value:data.kos?.total},{name:"Menunggu verifikasi",value:data.kos?.pending},{name:"Disetujui",value:data.kos?.approved},{name:"Ditolak",value:data.kos?.rejected}]:[];
 return <AdminShell title="Dashboard Administrator" subtitle="Pantau aktivitas pengguna dan status verifikasi kos secara langsung."><div className="flex justify-end mb-4"><Button variant="outline" onClick={load} disabled={loading}>Muat ulang</Button></div>{error&&<Alert>{error}</Alert>}{loading?<Loading/>:data?<><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{cards.map((c,i)=><Panel key={c.name}><p className="text-sm text-slate-500">{c.name}</p><p className={`mt-3 text-3xl font-extrabold ${i===5?"text-amber-600":"text-blue-800"}`}>{c.value??0}</p></Panel>)}</div><div className="grid sm:grid-cols-2 gap-4 mt-6"><Link href="/admin/submissions" className="rounded-2xl bg-blue-700 text-white p-6 hover:bg-blue-800"><h2 className="text-xl font-bold">Verifikasi pengajuan →</h2><p className="mt-2 text-blue-100">Tinjau {data.kos?.pending??0} pengajuan yang menunggu keputusan.</p></Link><Link href="/admin/users" className="rounded-2xl bg-slate-900 text-white p-6 hover:bg-slate-800"><h2 className="text-xl font-bold">Kelola pengguna →</h2><p className="mt-2 text-slate-200">Lihat akun dan atur peran pengguna.</p></Link></div></>:!error&&<p>Data tidak tersedia.</p>}</AdminShell>;
}
