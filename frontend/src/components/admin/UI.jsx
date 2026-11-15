export function Alert({children,type="error"}){return <div role="alert" className={`rounded-xl border px-4 py-3 text-sm ${type==="error"?"bg-red-50 border-red-200 text-red-700":"bg-green-50 border-green-200 text-green-800"}`}>{children}</div>}
export function Panel({children,className=""}){return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>}
export function Loading(){return <p role="status" className="p-8 text-center text-slate-500">Memuat data dari server...</p>}
export function Button({children,variant="primary",...props}){return <button {...props} className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${variant==="danger"?"bg-red-600 hover:bg-red-700 text-white":variant==="outline"?"border border-slate-300 bg-white hover:bg-slate-50":"bg-blue-700 hover:bg-blue-800 text-white"} ${props.className||""}`}>{children}</button>}
export const roleLabel={ADMIN:"Administrator",PEMILIK_KOS:"Pemilik Kos",PENCARI_KOS:"Pencari Kos"};
export const errorText=e=>e.response?.data?.message||e.message||"Terjadi kesalahan jaringan";
