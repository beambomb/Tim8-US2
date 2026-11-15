import {Suspense} from "react";
import AuthForm from "@/components/auth/AuthForm";
export const metadata={title:"Masuk - CariKos"};
export default function Page(){return <Suspense fallback={<p className="p-8">Memuat formulir...</p>}><AuthForm mode="login"/></Suspense>}
