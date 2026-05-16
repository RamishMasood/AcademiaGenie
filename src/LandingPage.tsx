import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowRight, Zap, GraduationCap, Map, Target, Bot, CheckCircle2, FileText, Search, Sparkles, Database, Mail, XCircle } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingProps) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const [activePage, setActivePage] = useState<string | null>(null);

  const legalContent: Record<string, { title: string; content: string }> = {
    privacy: {
      title: "Privacy Policy",
      content: "At AcademiaGenie, we prioritize the confidentiality of your academic data. When you upload your CV or transcript, our AI processes the text specifically to generate matching suggestions and roadmaps. We do not sell your personal data. CV content is processed via the Google Gemini API in a secure environment. We recommend removing highly sensitive personal details (like home addresses) from documents before upload."
    },
    terms: {
      title: "Terms of Service",
      content: "By using AcademiaGenie, you acknowledge that all AI-generated suggestions, matched professors, and email drafts are illustrative and should be verified independently. AcademiaGenie is a tool for academic discovery and profiling; we do not guarantee admission or employment. Users are responsible for the accuracy of the data they provide and the professional conduct of their outreach."
    },
    support: {
      title: "Help & Support",
      content: "Our team is here to help you navigate your academic journey. For technical issues, feedback, or partnership inquiries, reach out to us at support@academiagenie.ai. We typically respond within 24-48 business hours. You can also connect with us on scholars-first academic forums."
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      
      {/* Legal Overlay */}
      <AnimatePresence>
        {activePage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-md"
            onClick={() => setActivePage(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl rounded-full"></div>
              <button 
                onClick={() => setActivePage(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10 group"
              >
                <div className="text-xl group-hover:scale-110 transition-transform">✕</div>
              </button>
              <h2 className="text-3xl font-black mb-6 text-indigo-400">{legalContent[activePage].title}</h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>{legalContent[activePage].content}</p>
                <p>Last updated: May 2026</p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5">
                <button 
                  onClick={() => setActivePage(null)}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-sm transition-all"
                >
                  Close Document
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-indigo-900/10 blur-[150px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/10 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDelay: '3s' }}></div>
        <motion.div style={{ y }} className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></motion.div>
        
        {/* Animated grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center p-0.5 shadow-lg shadow-indigo-500/20">
               <div className="bg-[#020617] w-full h-full rounded-[6px] sm:rounded-[10px] flex items-center justify-center">
                 <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
               </div>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">Academia<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Genie</span></span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="hidden lg:block text-sm font-medium text-slate-300 hover:text-white transition-colors" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
            <button className="hidden lg:block text-sm font-medium text-slate-300 hover:text-white transition-colors" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it Works</button>
            <button onClick={onStart} className="px-4 pr-3 sm:px-6 py-2 sm:py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm sm:text-base font-medium shadow-lg shadow-indigo-500/25 transition-all backdrop-blur-sm border border-indigo-400/50 flex items-center gap-1">
              Launch App <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-28 sm:pt-32 lg:pt-48 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium text-xs sm:text-sm mb-6 sm:mb-8 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
          >
            <Sparkles className="w-4 h-4" /> Academia's First AI Matchmaker
          </motion.div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 sm:mb-8 leading-[1.1] sm:leading-[1.05]">
            Secure your <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient bg-300%">Dream Lab</span> effortlessly.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Stop manually scraping faculty pages and sending generic emails. AcademiaGenie analyzes your academic profile and orchestrates your entire PhD or RA search using advanced heuristics.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onStart} className="group relative px-8 py-4 bg-white text-[#020617] rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95 w-full sm:w-auto">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start for free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-transparent border border-slate-700 text-slate-300 rounded-full font-bold text-lg hover:bg-slate-800 transition-colors w-full sm:w-auto">
              See How It Works
            </button>
          </div>
        </motion.div>

        {/* Problem vs Solution Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
          className="w-full mt-24 mb-16 relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 w-full text-left">
            {/* The Problem (Manual Process) */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-red-900/30 rounded-[2rem] p-8 lg:p-12 relative overflow-hidden transition-all hover:border-red-500/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-900/50 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-100">The Manual Grind</h3>
              </div>
              
              <ul className="space-y-6">
                <li className="flex gap-4">
                   <div className="mt-1"><XCircle className="w-5 h-5 text-red-500/50"/></div>
                   <div>
                     <h4 className="font-bold text-white mb-1">Endless University Scouring</h4>
                     <p className="text-slate-400 text-sm leading-relaxed">Opening hundreds of university tabs to find professors who align with your specific research interests manually.</p>
                   </div>
                </li>
                <li className="flex gap-4">
                   <div className="mt-1"><XCircle className="w-5 h-5 text-red-500/50"/></div>
                   <div>
                     <h4 className="font-bold text-white mb-1">Generic Cold Emails</h4>
                     <p className="text-slate-400 text-sm leading-relaxed">Sending the same copy-pasted template to 50 professors, resulting in zero replies and marked as spam.</p>
                   </div>
                </li>
                <li className="flex gap-4">
                   <div className="mt-1"><XCircle className="w-5 h-5 text-red-500/50"/></div>
                   <div>
                     <h4 className="font-bold text-white mb-1">Uncertain Profile Gaps</h4>
                     <p className="text-slate-400 text-sm leading-relaxed">Applying blindly without knowing if your CV actually meets the standard of the target lab.</p>
                   </div>
                </li>
              </ul>
            </div>

            {/* The Solution (AcademiaGenie) */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-indigo-500/30 rounded-[2rem] p-8 lg:p-12 relative overflow-hidden transition-all hover:border-indigo-400/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-indigo-100">The AcademiaGenie Advantage</h3>
              </div>
              
              <ul className="space-y-6 relative z-10">
                <li className="flex gap-4">
                   <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-indigo-400"/></div>
                   <div>
                     <h4 className="font-bold text-white mb-1">Instant Precision Matching</h4>
                     <p className="text-slate-400 text-sm leading-relaxed">Upload your CV and instantly get matched with professors actively researching your exact sub-niche globally.</p>
                   </div>
                </li>
                <li className="flex gap-4">
                   <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-indigo-400"/></div>
                   <div>
                     <h4 className="font-bold text-white mb-1">Hyper-Personalized Outreach</h4>
                     <p className="text-slate-400 text-sm leading-relaxed">Generate bespoke cold emails referencing the professor's latest papers and how your unique skills align.</p>
                   </div>
                </li>
                <li className="flex gap-4">
                   <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-indigo-400"/></div>
                   <div>
                     <h4 className="font-bold text-white mb-1">Strategic Roadmap Planning</h4>
                     <p className="text-slate-400 text-sm leading-relaxed">Receive a highly targeted, step-by-step roadmap to bridge your skill gaps before you even apply.</p>
                   </div>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>
      
      {/* High-Tech Feature Grid */}
      <section id="features" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Engineered for Academic Success</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">We mapped the cognitive process of finding a PhD advisor and fully automated it using LLMs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
           
           <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="col-span-1 md:col-span-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 hover:border-indigo-500/30 rounded-3xl p-8 hover:bg-slate-800/50 transition-all overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-700"></div>
             <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center mb-6 relative z-10">
               <Database className="w-6 h-6 text-indigo-400" />
             </div>
             <h3 className="text-3xl font-bold text-white mb-4 relative z-10">Intelligent Matchmaking</h3>
             <p className="text-slate-400 leading-relaxed max-w-md relative z-10 text-lg">Our engine processes your CV using GenAI, extracting your implicit skills, and matches them natively against research profiles worldwide. Filter by any country instantly.</p>
           </motion.div>

           <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="col-span-1 md:col-span-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 hover:border-purple-500/30 rounded-3xl p-8 hover:bg-slate-800/50 transition-all group overflow-hidden relative">
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>
             <div className="w-12 h-12 bg-purple-500/10 rounded-2xl border border-purple-500/20 flex items-center justify-center mb-6 relative z-10">
               <Bot className="w-6 h-6 text-purple-400" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-4 relative z-10">CV Benchmarking</h3>
             <p className="text-slate-400 leading-relaxed relative z-10">Instantly gauge how your profile holds up to IVY league standard requirements.</p>
           </motion.div>

           <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="col-span-1 md:col-span-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 hover:border-pink-500/30 rounded-3xl p-8 hover:bg-slate-800/50 transition-all group overflow-hidden relative">
             <div className="w-12 h-12 bg-pink-500/10 rounded-2xl border border-pink-500/20 flex items-center justify-center mb-6 relative z-10">
               <Mail className="w-6 h-6 text-pink-400" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-4 relative z-10">1-Click Cold Emails</h3>
             <p className="text-slate-400 leading-relaxed relative z-10">Auto-generate highly technical emails specific to each professor's recent publications.</p>
           </motion.div>

           <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="col-span-1 md:col-span-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 hover:border-emerald-500/30 rounded-3xl p-8 hover:bg-slate-800/50 transition-all overflow-hidden relative group">
             <div className="absolute top-1/2 right-10 w-full max-w-sm h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
             <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mb-6 relative z-10">
               <Target className="w-6 h-6 text-emerald-400" />
             </div>
             <h3 className="text-3xl font-bold text-white mb-4 relative z-10">Strategic Roadmap Planner</h3>
             <p className="text-slate-400 leading-relaxed max-w-md relative z-10 text-lg">Falling short? Get an AI-designed, timeline-based strategy of certifications, projects, and reading materials specifically curated to bridge your skill gaps.</p>
           </motion.div>

        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-32 bg-[#050B20] border-y border-white/5">
         <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-black text-center mb-12 md:mb-24">The 4-Step Academic Pipeline</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8 relative">
               {/* Connecting Line */}
               <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 z-0"></div>

               {[
                 { step: "01", title: "Upload Profile", desc: "Drag and drop your CV/Resume as a PDF.", icon: FileText },
                 { step: "02", title: "Analyze Gaps", desc: "Get an instant heuristic breakdown of your strengths.", icon: Search },
                 { step: "03", title: "Find PI Matches", desc: "Discover active professors worldwide.", icon: Map },
                 { step: "04", title: "Automate Outreach", desc: "Draft cold emails that won't go to spam.", icon: Mail }
               ].map((s, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: idx * 0.15 }}
                    className="relative z-10 flex flex-col items-center text-center"
                  >
                     <div className="w-24 h-24 rounded-full bg-[#020617] border border-indigo-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative group">
                        <s.icon className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform"/>
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                          {s.step}
                        </div>
                     </div>
                     <h4 className="text-xl font-bold mb-3">{s.title}</h4>
                     <p className="text-slate-400 text-sm max-w-[200px]">{s.desc}</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>
      
      {/* Final CTA Section */}
      <section className="relative z-10 py-20 sm:py-32 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden backdrop-blur-sm">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
             
             <h2 className="text-3xl md:text-6xl font-black mb-6 sm:mb-8">Ready to accelerate your <br className="hidden sm:block"/>academic career?</h2>
             <p className="text-lg sm:text-xl text-indigo-200/80 mb-8 sm:mb-10 max-w-2xl mx-auto">Join the new wave of researchers who secure fully-funded positions dynamically, without the manual grind.</p>
             <button onClick={onStart} className="px-8 sm:px-10 py-4 sm:py-5 bg-white text-[#020617] rounded-full font-bold text-lg sm:text-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] active:scale-95 inline-flex items-center gap-3">
               Launch Application <Zap className="w-5 h-5 sm:w-6 sm:h-6"/>
             </button>
          </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-slate-800/50 relative z-10 bg-[#020617] mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between">
           <div className="flex items-center gap-2 mb-4 md:mb-0">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
               <GraduationCap className="w-5 h-5 text-white" />
             </div>
             <span className="font-bold text-slate-300">AcademiaGenie AI</span>
           </div>
           
           <div className="flex gap-8 text-sm font-medium text-slate-500">
             <button onClick={() => setActivePage('privacy')} className="hover:text-indigo-400 transition-colors">Privacy Policy</button>
             <button onClick={() => setActivePage('terms')} className="hover:text-indigo-400 transition-colors">Terms of Service</button>
             <button onClick={() => setActivePage('support')} className="hover:text-indigo-400 transition-colors">Contact Support</button>
           </div>
        </div>
      </footer>
    </div>
  );
}
