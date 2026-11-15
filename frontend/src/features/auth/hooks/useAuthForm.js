"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {useAuth,homeForRole} from "@/context/AuthContext";
export function useAuthForm(mode="login") {
 const router=useRouter();const {login,register}=useAuth();
 const [formData,setFormData]=useState({nama:"",email:"",password:"",noHp:"",role:"PENCARI_KOS"});
 const [isLoading,setIsLoading]=useState(false);const [error,setError]=useState(null);const [successMessage,setSuccessMessage]=useState(null);
 const handleChange=e=>{setFormData(old=>({...old,[e.target.name]:e.target.value}));setError(null);};
 const handleSubmit=async e=>{e.preventDefault();setIsLoading(true);setError(null);setSuccessMessage(null);
 try {if(mode==="login"){const user=await login(formData.email.trim(),formData.password);router.replace(homeForRole(user.role));}
 else {await register({...formData,nama:formData.nama.trim(),email:formData.email.trim(),noHp:formData.noHp.trim()});setSuccessMessage("Pendaftaran berhasil. Silakan masuk menggunakan akun baru.");router.push("/auth/login?registered=1");}}
 catch(err){setError(err.response?.data?.message || err.message || "Terjadi kesalahan. Silakan coba lagi.");}finally{setIsLoading(false);}};
 return {formData,isLoading,error,successMessage,handleChange,handleSubmit};
}
