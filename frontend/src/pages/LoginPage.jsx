import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import aaiLogo from "../assets/aai-logo.jpg";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
  sessionStorage.removeItem("cameFromLogin");
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      sessionStorage.setItem("cameFromLogin", "true");
      navigate("/home");
    } else {
      toast.error("Incorrect username or password");
    }
  } catch (err) {
    toast.error("Something went wrong");
  }
};

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a1128]">
      {/* Ambient radar sweep backdrop */}
      <div className="absolute inset-0 [background:radial-gradient(circle_at_50%_50%,rgba(46,77,158,0.25),transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.15] [background-image:repeating-radial-gradient(circle_at_center,transparent_0,transparent_60px,rgba(120,150,220,0.5)_61px,transparent_62px)]" />
      <div className="absolute top-1/2 left-1/2 w-[140vmax] h-[140vmax] -translate-x-1/2 -translate-y-1/2 animate-[spin_14s_linear_infinite] [background:conic-gradient(from_0deg,rgba(120,160,255,0.18),transparent_25%)]" />

      {/* Flight path accent line */}
      <svg
        className="absolute bottom-0 left-0 w-full opacity-30"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0,150 C300,50 900,250 1200,80"
          fill="none"
          stroke="#5b7fd6"
          strokeWidth="1.5"
          strokeDasharray="6 8"
        />
      </svg>

      {/* Card */}
      <div className="relative z-10 w-full max-w-3xl mx-4 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-xl bg-white/[0.04] border border-white/10">
        <div className="grid md:grid-cols-2">
          {/* Left - brand panel */}
          <div className="hidden md:flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-[#13205c] to-[#0a1128] p-10 border-r border-white/10">
            <div className="rounded-full bg-white/95 p-10 shadow-lg">
              <img src={aaiLogo} alt="Airports Authority of India" className="w-32 h-auto" />
            </div>
            <div className="text-center">
              <p className="text-white/90 font-semibold tracking-wide text-sm uppercase">
                ATM Complaint Management System
              </p>
              <p className="text-white/40 text-xs mt-1 tracking-wider">
                Airports Authority of India
              </p>
            </div>
          </div>

          {/* Right - form panel */}
          <div className="flex flex-col justify-center p-10 bg-white/[0.02]">
            <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">
              Sign in
            </h1>
            <p className="text-white/40 text-sm mb-8">
              Enter your credentials to continue
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 tracking-wide">
                  USERNAME
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#5b7fd6] focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 tracking-wide">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#5b7fd6] focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#2e4d9e] hover:bg-[#3a5cb8] text-white font-medium py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#2e4d9e]/40 active:scale-[0.98]"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;