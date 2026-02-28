
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface AuthPageProps {
  onLogin: (user: UserProfile) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation d'authentification
    const user: UserProfile = {
      name: isLogin ? 'Utilisateur' : name,
      email: email,
      allergies: [],
      isLoggedIn: true
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-emerald-50">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-emerald-600 p-10 text-white text-center">
          <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
             <i className="fa-solid fa-leaf text-4xl"></i>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">ZOGDIDA</h1>
          <p className="text-emerald-100 text-sm font-medium">Gérez votre frigo à la tunisienne</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-4">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${isLogin ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
            >CONNEXION</button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${!isLogin ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
            >INSCRIPTION</button>
          </div>

          {!isLogin && (
            <div className="animate-in slide-in-from-top-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nom complet</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                placeholder="Ahmed Ben Ali"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
              placeholder="ahmed@mail.tn"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mot de passe</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black shadow-xl shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95 flex items-center justify-center gap-3"
          >
            {isLogin ? 'SE CONNECTER' : 'CRÉER MON COMPTE'}
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </form>
      </div>
      <p className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest">© 2025 Zogdida Tunisia</p>
    </div>
  );
};

export default AuthPage;
