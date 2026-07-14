import React, { useState } from "react";
import { User, Mail, ShieldCheck, Lock, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { api } from "../api";

interface LoginRegisterProps {
  onSuccess: (user: any) => void;
  onNavigate: (view: string) => void;
}

export default function LoginRegister({ onSuccess, onNavigate }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await api.auth.login(email, password);
      } else {
        data = await api.auth.register(name, email, password);
      }
      onSuccess(data.user);
      onNavigate("home");
    } catch (err: any) {
      setError(err.message || "Authentication credentials failed");
    } finally {
      setLoading(false);
    }
  };

  // Demo testing accounts
  const loginAsDemo = async (role: "admin" | "customer") => {
    setError("");
    setLoading(true);
    const demoEmail = role === "admin" ? "admin@merkato.com" : "customer@merkato.com";
    const demoPassword = "password123";
    try {
      const data = await api.auth.login(demoEmail, demoPassword);
      onSuccess(data.user);
      onNavigate("home");
    } catch (err: any) {
      setError(err.message || "Failed to log in as demo account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="merkato-auth" className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-dark-900">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {isLogin ? "Welcome Back to MERKATO" : "Create Shopper Account"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isLogin ? "Selaam! Sign in to continue your secure shopping journey." : "Join Africa's absolute premier full-stack marketplace."}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-800 dark:bg-red-950/20 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <span className="font-semibold text-gray-500">Full Name:</span>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Almaz Kebede"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 outline-none focus:border-amber-500 dark:border-gray-800 dark:bg-dark-800 dark:text-white"
                />
                <User size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-gray-500">Email Address:</span>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="e.g. almaz@merkato.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 outline-none focus:border-amber-500 dark:border-gray-800 dark:bg-dark-800 dark:text-white"
              />
              <Mail size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-gray-500">Password:</span>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 outline-none focus:border-amber-500 dark:border-gray-800 dark:bg-dark-800 dark:text-white"
              />
              <Lock size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-sm font-semibold text-white shadow hover:from-amber-600 hover:to-yellow-600 transition-all"
          >
            {loading ? "Authenticating security credentials..." : isLogin ? "Sign In Securely" : "Register Shopper"}
          </button>

        </form>

        {/* Mode Toggle link */}
        <p className="mt-4 text-center text-[11px] text-gray-400">
          {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-amber-500 hover:underline"
          >
            {isLogin ? "Create account" : "Sign in here"}
          </button>
        </p>

        {/* Fast-Track Demo Buttons */}
        <div className="mt-8 border-t border-gray-100 pt-6 dark:border-gray-800">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-3">
            Fast-Track Testing profiles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => loginAsDemo("customer")}
              className="rounded-lg border border-gray-200 p-2.5 text-center hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 transition-colors"
            >
              <p className="text-xs font-bold text-gray-900 dark:text-white">Customer Demo</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Test cart & dashboard</p>
            </button>
            <button
              onClick={() => loginAsDemo("admin")}
              className="rounded-lg border border-red-200 bg-red-50/5 p-2.5 text-center hover:bg-red-50 dark:border-red-900/10 dark:hover:bg-red-950/20 transition-colors"
            >
              <p className="text-xs font-bold text-red-600 dark:text-red-400">Admin Demo</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Test CRUD & statistics</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
