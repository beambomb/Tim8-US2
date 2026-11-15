"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {useEffect} from "react";
import {useAuth} from "@/context/AuthContext";
const nav=[{href:"/admin/dashboard",label:"Ringkasan"},{href:"/admin/submissions",label:"Verifikasi Kos"},{href:"/admin/users",label:"Pengguna"}];
export default function AdminShell({children,title,subtitle}){
 const {user,loading,logout}=useAuth();const pathname=usePathname();const router=useRouter();
 useEffect(()=>{if(!loading && !user)router.replace("/auth/login");else if(!loading && user?.role!=="ADMIN")router.replace("/");},[loading,user,router]);
 if(loading || !user || user.role!=="ADMIN")return <div className="min-h-screen grid place-items-center text-slate-500">Memeriksa akses administrator...</div>;
 return <div className="min-h-screen bg-slate-50"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-8"><div className="flex flex-wrap items-center justify-between gap-4 mb-8"><Link href="/" className="font-black text-2xl text-blue-700">CariKos <span className="text-slate-600 text-sm font-semibold">/ Admin</span></Link><div className="flex items-center gap-4 text-sm"><span className="text-slate-600">{user.nama}</span><button onClick={logout} className="rounded-lg border border-slate-300 bg-white px-4 py-2 hover:bg-slate-100">Keluar</button></div></div><div className="grid gap-7 md:grid-cols-[220px_1fr]"><nav aria-label="Navigasi administrator" className="flex md:flex-col gap-2 overflow-x-auto">{nav.map(n=><Link key={n.href} href={n.href} className={`whitespace-nowrap rounded-xl px-4 py-3 font-medium text-sm ${pathname===n.href?"bg-blue-700 text-white":"bg-white text-slate-700 border border-slate-200 hover:bg-blue-50"}`}>{n.label}</Link>)}</nav><main className="min-w-0"><header className="mb-7"><h1 className="text-3xl font-bold text-slate-900">{title}</h1><p className="text-slate-500 mt-2">{subtitle}</p></header>{children}</main></div></div></div>;
}
