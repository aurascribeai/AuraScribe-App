import React, { useState } from 'react';
import {
  Stethoscope,
  Mail,
  Lock,
  Building2,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Loader2,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';
import Logo from './Logo';

interface AuthProps {
  onLogin: (user: User) => void;
  lang: 'fr' | 'en';
}

const Auth: React.FC<AuthProps> = ({ onLogin, lang }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    clinicName: '',
    licenseNumber: '',
    email: '',
    password: '',
    role: 'Physician'
  });

  const roles = [
    { id: 'Physician', label: lang === 'fr' ? 'Médecin de Famille' : 'Family Physician' },
    { id: 'Specialist', label: lang === 'fr' ? 'Médecin Spécialiste' : 'Specialist' },
    { id: 'Nurse', label: lang === 'fr' ? 'Infirmier(ère) Praticien(ne)' : 'Nurse Practitioner' },
    { id: 'Resident', label: lang === 'fr' ? 'Résident en Médecine' : 'Medical Resident' },
    { id: 'Admin', label: lang === 'fr' ? 'Administrateur Clinique' : 'Clinic Admin' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        fullName: formData.fullName || 'Dr. Julien Rousseau',
        clinicName: formData.clinicName || 'Clinique Aura',
        licenseNumber: formData.licenseNumber || '123456',
        email: formData.email,
        role: formData.role
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-slate-200/50 dark:border-slate-800/50">
        
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-10">
            <Stethoscope size={300} strokeWidth={1} />
          </div>
          
          <div className="relative z-10">
            <div className="mb-8">
               <Logo className="w-20 h-20" theme="light" showText={false} />
            </div>
            <h1 className="text-5xl font-black heading-font tracking-tighter italic leading-none">AuraScribe</h1>
            <p className="text-indigo-100 mt-6 text-lg max-w-sm leading-relaxed font-medium">
              {lang === 'fr' 
                ? "L'intelligence clinique au service du temps médical. Générez vos notes SOAP, facturez à la RAMQ et gérez vos tâches en un clic."
                : "Clinical intelligence for medical time. Generate SOAP notes, bill RAMQ, and manage tasks in one click."}
            </p>
          </div>

          <div className="relative z-10 space-y-6">
             <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
               <div className="w-10 h-10 bg-emerald-400/20 rounded-full flex items-center justify-center text-emerald-300">
                 <ShieldCheck size={20} />
               </div>
               <div>
                 <p className="font-bold text-sm uppercase tracking-wider">Loi 25 Compliant</p>
                 <p className="text-xs text-indigo-100 opacity-80">Données cryptées & hébergées au Québec</p>
               </div>
             </div>
             
             <div className="flex items-center gap-2 text-xs font-medium text-indigo-200 opacity-60">
                <span>v2.4.0</span>
                <span>•</span>
                <span>Gemini 3 Pro Inside</span>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-10 md:p-16 flex flex-col justify-center">
           <div className="mb-10">
             <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">
               {mode === 'login' 
                 ? (lang === 'fr' ? 'Connexion Sécurisée' : 'Secure Login')
                 : (lang === 'fr' ? 'Créer un compte' : 'Create Account')}
             </h2>
             <p className="text-slate-500 text-sm">
               {mode === 'login'
                 ? (lang === 'fr' ? 'Accédez à votre espace clinique Aura.' : 'Access your Aura clinical workspace.')
                 : (lang === 'fr' ? 'Rejoignez le réseau AuraScribe.' : 'Join the AuraScribe network.')}
             </p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
             {mode === 'signup' && (
               <>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                     {lang === 'fr' ? 'Nom Complet' : 'Full Name'}
                   </label>
                   <div className="relative">
                     <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input 
                       type="text" 
                       required
                       value={formData.fullName}
                       onChange={e => setFormData({...formData, fullName: e.target.value})}
                       className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                       placeholder="Dr. Julien Rousseau"
                     />
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                       {lang === 'fr' ? 'Clinique' : 'Clinic'}
                     </label>
                     <div className="relative">
                       <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <input 
                         type="text" 
                         value={formData.clinicName}
                         onChange={e => setFormData({...formData, clinicName: e.target.value})}
                         className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                         placeholder="Clinique Aura"
                       />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                       {lang === 'fr' ? 'Licence' : 'License'}
                     </label>
                     <div className="relative">
                       <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <input 
                         type="text" 
                         value={formData.licenseNumber}
                         onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
                         className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                         placeholder="123456"
                       />
                     </div>
                   </div>
                 </div>
               </>
             )}

             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                 {lang === 'fr' ? 'Email Professionnel' : 'Work Email'}
               </label>
               <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="email" 
                   required
                   value={formData.email}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                   placeholder="dr.rousseau@clinique.ca"
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                 {lang === 'fr' ? 'Mot de passe' : 'Password'}
               </label>
               <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="password" 
                   required
                   value={formData.password}
                   onChange={e => setFormData({...formData, password: e.target.value})}
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                   placeholder="••••••••"
                 />
               </div>
             </div>

             <button 
               type="submit" 
               disabled={isLoading}
               className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
             >
               {isLoading ? <Loader2 size={20} className="animate-spin" /> : (mode === 'login' ? (lang === 'fr' ? 'Connexion' : 'Login') : (lang === 'fr' ? 'S\'inscrire' : 'Sign Up'))}
               {!isLoading && <ArrowRight size={18} />}
             </button>
           </form>

           <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
             <p className="text-xs text-slate-500 mb-2">
               {mode === 'login' ? (lang === 'fr' ? 'Pas encore de compte ?' : "Don't have an account?") : (lang === 'fr' ? 'Déjà un compte ?' : "Already have an account?")}
             </p>
             <button 
               onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
               className="text-sm font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-tight flex items-center justify-center gap-1 mx-auto"
             >
               {mode === 'login' ? (lang === 'fr' ? 'Créer un compte clinique' : 'Create clinical account') : (lang === 'fr' ? 'Se connecter' : 'Log In')}
               <ChevronRight size={14} />
             </button>
           </div>
           
           <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
             <ShieldCheck size={12} />
             <span>
               {lang === 'fr' ? 'Connexion sécurisée et conforme Loi 25.' : 'Secure connection, Law 25 compliant.'}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;