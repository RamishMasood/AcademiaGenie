import React, { useState, useRef, useMemo } from 'react';
import { LayoutDashboard, Search, Mail, Map, GraduationCap, ChevronRight, FileText, CheckCircle2, AlertCircle, ArrowRight, Zap, Target, BookOpen, Send, Download, Settings, Key, Cpu } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import CustomCursor from './CustomCursor';
import LandingPage from './LandingPage';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProfileAnalysis {
  profileStrengthScore: number;
  benchmark: string;
  strengths: string[];
  weaknesses: string[];
  actionableAdvice: string[];
}

interface Professor {
  name: string;
  university: string;
  researchArea: string;
  email: string | null;
  matchScore: number;
  universityType: 'Government' | 'Semi-Government' | 'Private' | string;
}

interface Suggestions {
  opportunities: { title: string; description: string }[];
  professors: Professor[];
}

interface RoadmapPhase {
  title: string;
  duration: string;
  goals: string[];
  resources: string[];
}

interface RoadmapResponse {
  overview: string;
  phases: RoadmapPhase[];
}

const COUNTRIES = [
  "Any Location", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [cvText, setCvText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [seenProfessorNames, setSeenProfessorNames] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [error, setError] = useState<{ message: string; isRateLimit: boolean } | null>(null);
  
  // Custom API Settings
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [targetCountry, setTargetCountry] = useState<string>('');
  const [selectedUniversityFilter, setSelectedUniversityFilter] = useState<string>('All');
  const [selectedUniversityTypeFilter, setSelectedUniversityTypeFilter] = useState<string>('All');

  const [selectedProfessorIdx, setSelectedProfessorIdx] = useState<number | ''>('');
  const [emailContent, setEmailContent] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: '1. Analysis Dashboard', icon: LayoutDashboard },
    { id: 'opportunities', label: '2. Matching & Professors', icon: Search },
    { id: 'email', label: '3. Cold Email Generator', icon: Mail },
    { id: 'roadmap', label: '4. Improvement Roadmap', icon: Target },
    { id: 'settings', label: 'AI Settings', icon: Settings },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsLoading(true);
    setAnalysis(null);
    setError(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    
    if (customApiKey) formData.append('customApiKey', customApiKey);
    if (selectedModel) formData.append('selectedModel', selectedModel);

    try {
        const response = await fetch('/api/analyze-cv', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });
        
        const responseText = await response.text();
        
        let isJson = false;
        let data;
        try {
            data = JSON.parse(responseText);
            isJson = true;
        } catch (e) {
            // Not JSON
        }
        
        if (!response.ok) {
            if (response.status === 413) {
                throw new Error("File is too large. Please upload a smaller PDF (< 1MB).");
            }
            if (response.status === 504) {
               throw new Error("The request timed out. The file might be too large or the server is busy.");
            }
            if (response.status === 429) {
                throw new Error("AI Quota/Rate limit exceeded. Model limit reached. Please try changing the AI Model in 'Settings' or provide your own Gemini API key to continue immediately.");
            }
            if (isJson && data.error) {
                throw new Error(data.error);
            }
            throw new Error(`Server Error (${response.status}): ${responseText.substring(0, 100)}...`);
        }
        
        if (!isJson) {
            if (responseText.includes('Cookie check') || responseText.includes('Cache-Control')) {
                throw new Error("Your session has expired. Please refresh the page. If the issue persists, try opening the application in a new tab using the icon in the top right.");
            }
            console.error("Failed to parse success response:", responseText.substring(0, 200));
            throw new Error("The server encountered an error and returned an invalid response. Please try again.");
        }
        
        setAnalysis(data.analysis);
        setCvText(data.cvText);
    } catch (error: any) {
        console.error('Error uploading:', error);
        setError({ 
          message: error.message || 'Error analyzing CV.', 
          isRateLimit: error.message?.includes('Rate limit') || error.message?.includes('429') 
        });
    } finally {
        setIsLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    if (!cvText) return;
    setIsLoading(true);
    setError(null);
    setSelectedUniversityFilter('All');
    setSelectedUniversityTypeFilter('All');
    try {
        const response = await fetch('/api/suggest-opportunities', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          credentials: 'include', 
          body: JSON.stringify({ 
            cvText, 
            country: targetCountry, 
            customApiKey, 
            selectedModel,
            excludedProfessors: seenProfessorNames // Send names to exclude
          }) 
        });
        const responseText = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          // If not JSON, handle as raw error
          setError({ 
            message: `Server Error (${response.status}): ${responseText.substring(0, 100)}`,
            isRateLimit: response.status === 429
          });
          return;
        }

        if (!response.ok) {
           setError({ 
             message: response.status === 429 ? "AI Quota/Rate limit exceeded. Try changing the AI Model in 'Settings' or provide your own Gemini API key." : (data.error || `Status ${response.status}`),
             isRateLimit: response.status === 429
           });
           return;
        }
        
        // If it's a re-search (suggestions already exists), append new ones
        if (suggestions) {
          const newProfessors = data.suggestions.professors.filter(
            (p: Professor) => !seenProfessorNames.includes(p.name)
          );
          
          setSuggestions({
            opportunities: [...suggestions.opportunities, ...data.suggestions.opportunities],
            professors: [...suggestions.professors, ...newProfessors]
          });
          
          const newNames = newProfessors.map((p: Professor) => p.name);
          setSeenProfessorNames(prev => [...prev, ...newNames]);
        } else {
          setSuggestions(data.suggestions);
          setSeenProfessorNames(data.suggestions.professors.map((p: Professor) => p.name));
        }
    } catch(e: any) { 
      setError({ message: e.message || 'Error fetching suggestions', isRateLimit: false });
    } finally { setIsLoading(false); }
  };

  const exportToCsv = () => {
    if (!suggestions) return;
    const headers = ['Type', 'Title/Name', 'University/Org', 'University Type', 'Match Score', 'Description/Research Area', 'Email'];
    const rows = [];
    
    // Add opportunities
    suggestions.opportunities.forEach(opp => {
      rows.push(['Opportunity', `"${opp.title.replace(/"/g, '""')}"`, '', '', '', `"${opp.description.replace(/"/g, '""')}"`, '']);
    });
    
    // Add professors
    filteredProfessors.forEach(prof => {
      rows.push(['Professor', `"${prof.name.replace(/"/g, '""')}"`, `"${prof.university.replace(/"/g, '""')}"`, `"${prof.universityType}"`, `"${prof.matchScore}%"`, `"${prof.researchArea.replace(/"/g, '""')}"`, `"${prof.email || ''}"`]);
    });
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "academia_genie_matches.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const universities = useMemo(() => {
    if (!suggestions?.professors) return [];
    return Array.from(new Set(suggestions.professors.map(p => p.university))).filter(Boolean).sort();
  }, [suggestions]);

  const filteredProfessors = useMemo(() => {
    if (!suggestions?.professors) return [];
    let filtered = suggestions.professors;
    if (selectedUniversityFilter !== 'All') {
      filtered = filtered.filter(p => p.university === selectedUniversityFilter);
    }
    if (selectedUniversityTypeFilter !== 'All') {
      filtered = filtered.filter(p => p.universityType?.toLowerCase() === selectedUniversityTypeFilter.toLowerCase());
    }
    return filtered;
  }, [suggestions, selectedUniversityFilter, selectedUniversityTypeFilter]);

  const fetchRoadmap = async () => {
    if (!cvText) return;
    setIsLoading(true);
    setError(null);
    try {
        const response = await fetch('/api/generate-roadmap', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          credentials: 'include', 
          body: JSON.stringify({ cvText, customApiKey, selectedModel }) 
        });
        const responseText = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          setError({ 
            message: `Server Error (${response.status}): ${responseText.substring(0, 100)}`,
            isRateLimit: response.status === 429
          });
          return;
        }

        if (!response.ok) {
           setError({ 
             message: response.status === 429 ? "AI Quota/Rate limit exceeded. Try changing the AI Model in 'Settings' or provide your own Gemini API key." : (data.error || `Status ${response.status}`),
             isRateLimit: response.status === 429
           });
           return;
        }
        setRoadmap(data.roadmap);
    } catch(e: any) { 
      setError({ message: e.message || 'Error fetching roadmap', isRateLimit: false });
    } finally { setIsLoading(false); }
  };

  const generateEmail = async () => {
      if (!cvText || selectedProfessorIdx === '' || !suggestions) return;
      setIsLoading(true);
      setError(null);
      try {
          const prof = suggestions.professors[selectedProfessorIdx as number];
          const response = await fetch('/api/generate-email', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            credentials: 'include', 
            body: JSON.stringify({ cvText, professor: prof, customApiKey, selectedModel }) 
          });
          const responseText = await response.text();
          let data: any = {};
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            setError({ 
              message: `Server Error (${response.status}): ${responseText.substring(0, 100)}`,
              isRateLimit: response.status === 429
            });
            return;
          }

          if (!response.ok) {
             setError({ 
               message: response.status === 429 ? "AI Quota/Rate limit exceeded. Try changing the AI Model in 'Settings' or provide your own Gemini API key." : (data.error || `Status ${response.status}`),
               isRateLimit: response.status === 429
             });
             return;
          }
          setEmailContent(data.email);
      } catch(e: any) { 
        setError({ message: e.message || 'Error generating email', isRateLimit: false });
      } finally { setIsLoading(false); }
  };

  const testApiKey = async () => {
    if (!customApiKey) return;
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const resp = await fetch('/api/test-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customApiKey, selectedModel })
      });
      const responseText = await resp.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        setTestResult({ 
          success: false, 
          message: `Server Error (${resp.status}): ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}` 
        });
        return;
      }
      
      if (resp.ok) {
        setTestResult({ success: true, message: "Connection successful! AI says: " + data.message });
      } else {
        setTestResult({ success: false, message: data.error || "Failed to verify key" });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || "Network error" });
    } finally {
      setIsTestingKey(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className={cn(
                  "p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 shadow-sm border",
                  error.isRateLimit ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-red-50 border-red-200 text-red-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className={cn("w-6 h-6 shrink-0", error.isRateLimit ? "text-amber-600" : "text-red-600")} />
                  <p className="font-semibold text-sm leading-relaxed">{error.message}</p>
                </div>
                {error.isRateLimit && (
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="md:ml-auto px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition-all shadow-sm"
                  >
                    Go to Settings
                  </button>
                )}
                {!error.isRateLimit && (
                   <button 
                    onClick={() => setError(null)}
                    className="md:ml-auto text-red-400 hover:text-red-600 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            )}
            <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-6 sm:p-12 flex flex-col items-center justify-center text-center transition-all hover:border-indigo-400 hover:bg-indigo-50">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                <FileText className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Upload your CV</h3>
              <p className="text-gray-600 max-w-md mb-8 text-lg">Drop your files here to ignite an AI-powered analysis of your academic profile.</p>
              <input type="file" multiple className="hidden" id="file-upload" onChange={handleFileUpload} />
              <label 
                htmlFor="file-upload"
                className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-5 h-5" /> Analyze My Profile
              </label>
            </div>
            
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-indigo-600 font-medium animate-pulse">Running advanced heuristics on your profile...</p>
              </div>
            )}
            
            {analysis && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10"></div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Strength Score</h4>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-6xl font-black text-indigo-600 leading-none">{analysis.profileStrengthScore}</span>
                        <span className="text-2xl font-bold text-gray-300 mb-1">/ 10</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{analysis.benchmark}</p>
                    </div>
                  </div>

                  <div className="col-span-1 border border-emerald-200 bg-emerald-50/30 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-bold text-emerald-900">Key Strengths</h4>
                    </div>
                    <ul className="space-y-3">
                      {analysis.strengths?.map((str, i) => (
                        <li key={i} className="flex gap-3 text-sm text-emerald-800 leading-snug">
                          <span className="text-emerald-400 mt-0.5">•</span> {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="col-span-1 border border-amber-200 bg-amber-50/30 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <h4 className="font-bold text-amber-900">Areas for Growth</h4>
                    </div>
                    <ul className="space-y-3">
                      {analysis.weaknesses?.map((wk, i) => (
                        <li key={i} className="flex gap-3 text-sm text-amber-800 leading-snug">
                          <span className="text-amber-400 mt-0.5">•</span> {wk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                   <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-indigo-600"/> Actionable Advice</h4>
                   <ul className="space-y-3">
                      {analysis.actionableAdvice?.map((adv, i) => (
                        <li key={i} className="flex gap-3 text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <span className="font-bold text-indigo-600">{i+1}.</span> <span className="flex-1">{adv}</span>
                        </li>
                      ))}
                    </ul>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => setActiveTab('opportunities')}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-md group"
                  >
                    Proceed to Step 2 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      case 'opportunities': return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Matching & Potential Advisors</h3>
                <p className="text-gray-500">Discover lab openings and professors whose research aligns with your profile.</p>
              </div>
              
              {cvText && !isLoading && (
                 <div className="flex flex-col md:flex-row md:items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Target Country</label>
                      <select 
                        className="w-full md:w-48 border-gray-300 border focus:border-indigo-500 focus:ring-indigo-500 rounded-lg p-2 text-sm bg-white"
                        value={targetCountry}
                        onChange={(e) => {
                          setTargetCountry(e.target.value);
                          setSuggestions(null); // Clear when country changes
                          setSeenProfessorNames([]);
                        }}
                      >
                        {COUNTRIES.map(country => (
                           <option key={country} value={country === "Any Location" ? "" : country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <button 
                        onClick={fetchSuggestions} 
                        className={cn(
                          "px-5 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap h-[40px]",
                          suggestions ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200" : "bg-indigo-600 text-white hover:bg-indigo-700"
                        )}
                      >
                        <Search className="w-4 h-4"/> {suggestions ? "Search Again" : "Discover"}
                      </button>
                      
                      {suggestions && (
                        <button onClick={exportToCsv} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap h-[40px]">
                          <Download className="w-4 h-4"/> Export CSV
                        </button>
                      )}
                    </div>
                 </div>
              )}
            </div>

            {!cvText && (
               <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                 <p className="text-gray-500 mb-4">Please upload a CV first in the Analysis Dashboard.</p>
                 <button onClick={() => setActiveTab('dashboard')} className="text-indigo-600 font-medium hover:underline">← Go Back</button>
               </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                 <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                 <p className="text-indigo-600 font-medium animate-pulse text-center max-w-sm">Scanning entire academic landscape for dozens of high-value matches...</p>
              </div>
            )}

            {suggestions && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-600"/> Recommended Opportunities</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {suggestions.opportunities?.map((opp, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-indigo-200 cursor-default">
                           <h5 className="font-bold text-gray-900 mb-2 leading-tight">{opp.title}</h5>
                           <p className="text-sm text-gray-600 leading-relaxed">{opp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-indigo-600"/> High-Match Professors</h4>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-medium text-gray-600">Type:</span>
                           <select 
                             className="border-gray-300 border focus:border-indigo-500 focus:ring-indigo-500 rounded-lg p-2 text-sm bg-white"
                             value={selectedUniversityTypeFilter}
                             onChange={(e) => setSelectedUniversityTypeFilter(e.target.value)}
                           >
                             <option value="All">All Types</option>
                             <option value="Government">Government</option>
                             <option value="Semi-Government">Semi-Government</option>
                             <option value="Private">Private</option>
                           </select>
                        </div>
                        {universities.length > 1 && (
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-medium text-gray-600">University:</span>
                             <select 
                               className="border-gray-300 border focus:border-indigo-500 focus:ring-indigo-500 rounded-lg p-2 text-sm bg-white"
                               value={selectedUniversityFilter}
                               onChange={(e) => setSelectedUniversityFilter(e.target.value)}
                             >
                               <option value="All">All Universities</option>
                               {universities.map(u => <option key={u} value={u}>{u}</option>)}
                             </select>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {filteredProfessors?.map((prof, i) => (
                        <div key={i} className="flex flex-col lg:flex-row lg:items-center justify-between bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm gap-4 transition-all hover:border-indigo-300">
                           <div className="flex-1 min-w-0">
                             <div className="flex items-start justify-between gap-4 mb-1">
                               <h5 className="font-bold text-gray-900 text-base sm:text-lg leading-tight truncate">
                                 {prof.name}
                               </h5>
                               <span className={cn(
                                 "text-[10px] sm:text-xs px-2 py-1 rounded-md font-bold shrink-0",
                                 prof.matchScore >= 85 ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                                 prof.matchScore >= 70 ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                 "bg-gray-100 text-gray-600 border border-gray-200"
                               )}>
                                 {prof.matchScore}% <span className="hidden xs:inline">Match</span>
                               </span>
                             </div>
                             <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                               <p className="text-xs sm:text-sm font-medium text-indigo-600 truncate">{prof.university}</p>
                               <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                 {prof.universityType}
                               </span>
                             </div>
                             <p className="text-xs sm:text-sm text-gray-600 line-clamp-2"><span className="font-medium">Research Area:</span> {prof.researchArea}</p>
                           </div>
                           <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                             {prof.email && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-800 truncate max-w-[150px] sm:max-w-none">{prof.email}</span>}
                             <button
                               onClick={() => {
                                 setSelectedProfessorIdx(suggestions.professors.findIndex(p => p.name === prof.name && p.university === prof.university));
                                 setActiveTab('email');
                               }} 
                               className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-xs sm:text-sm font-medium transition-colors border border-indigo-100 whitespace-nowrap"
                             >
                               Draft Email →
                             </button>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                    <button onClick={() => setActiveTab('dashboard')} className="text-gray-500 hover:text-gray-900 font-medium">← Back</button>
                    <button onClick={() => setActiveTab('email')} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-md group">
                      Proceed to Step 3 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
               </motion.div>
            )}
        </motion.div>
      );
      case 'email': return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Cold Email Generator</h3>
              <p className="text-gray-500">Craft a tailored, high-converting cold email specific to a professor.</p>
            </div>

            {!cvText ? (
               <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                 <p className="text-gray-500 mb-4">Please complete the previous steps first.</p>
                 <button onClick={() => setActiveTab('opportunities')} className="text-indigo-600 font-medium hover:underline">← Go Back</button>
               </div>
            ) : !suggestions ? (
               <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                 <p className="text-gray-500 mb-4">You must fetch professors in Step 2 before drafting an email.</p>
                 <button onClick={() => setActiveTab('opportunities')} className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium">Go to Step 2</button>
               </div>
            ) : (
                <div className="max-w-3xl space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Target Professor</label>
                      <select 
                        className="w-full border-gray-300 border focus:border-indigo-500 focus:ring-indigo-500 rounded-xl p-3 shadow-sm bg-white text-gray-900"
                        value={selectedProfessorIdx}
                        onChange={(e) => setSelectedProfessorIdx(e.target.value === '' ? '' : Number(e.target.value))}
                      >
                        <option value="" disabled>Select a professor fetched from Step 2</option>
                        {suggestions.professors?.map((prof, i) => (
                           <option key={i} value={i}>{prof.name} ({prof.university})</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      onClick={generateEmail} 
                      disabled={selectedProfessorIdx === '' || isLoading}
                      className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                      {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
                      Generate Academic Email
                    </button>

                    <AnimatePresence>
                      {emailContent && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6">
                              <div className="relative bg-gray-900 text-gray-100 rounded-2xl p-5 sm:p-8 shadow-xl">
                                <button className="absolute top-4 right-4 px-3 py-1.5 bg-gray-800 text-gray-300 hover:text-white rounded-md text-[10px] sm:text-xs font-medium border border-gray-700 hover:border-gray-500 transition-colors z-10"
                                onClick={() => navigator.clipboard.writeText(emailContent)}>
                                  Copy to Clipboard
                                </button>
                                <textarea 
                                  className="w-full bg-transparent border-none outline-none resize-y text-sm sm:text-base text-gray-100 font-sans pt-10 sm:pt-0"
                                  value={emailContent}
                                  onChange={(e) => setEmailContent(e.target.value)}
                                  rows={18}
                                />
                             </div>
                           
                           <div className="flex justify-end pt-8">
                            <button onClick={() => setActiveTab('roadmap')} className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 border border-gray-200 rounded-xl font-medium hover:bg-gray-200 transition-all">
                              Skip to Step 4 <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
      );
      case 'roadmap': return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Improvement Roadmap</h3>
                <p className="text-gray-500">A structured plan tailored for bridging gaps in your profile to secure top-tier opportunities.</p>
              </div>
              {cvText && !roadmap && !isLoading && (
                <button onClick={fetchRoadmap} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md transition-all">
                  Generate Roadmap
                </button>
              )}
            </div>

            {!cvText && (
               <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                 <p className="text-gray-500 mb-4">You need to upload your CV to receive a personalized roadmap.</p>
                 <button onClick={() => setActiveTab('dashboard')} className="text-indigo-600 font-medium hover:underline">← Go Back</button>
               </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                 <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            )}

            {roadmap && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 filter blur-3xl"></div>
                    <h4 className="text-xl font-bold mb-3 flex items-center gap-2"><Target className="w-6 h-6 text-indigo-400"/> Strategic Overview</h4>
                    <p className="text-indigo-100 leading-relaxed text-base sm:text-lg">{roadmap.overview}</p>
                  </div>
                  
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px lg:before:mx-auto lg:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
            {roadmap.phases?.map((phase, idx) => (
              <div key={idx} className="relative flex items-center justify-between lg:justify-normal lg:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-600 shadow shrink-0 lg:order-1 lg:group-odd:-translate-x-1/2 lg:group-even:translate-x-1/2 relative z-10 text-white font-bold">
                  {idx + 1}
                </div>
                <div className="w-[calc(100%-4rem)] lg:w-[calc(50%-2.5rem)] bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all ml-6 lg:ml-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <h5 className="font-bold text-gray-900 text-lg leading-tight">{phase.title}</h5>
                    <span className="text-[10px] font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full w-fit">{phase.duration}</span>
                  </div>
                          
                          <div className="mb-4">
                            <h6 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Goals</h6>
                            <ul className="space-y-2">
                              {phase.goals?.map((goal, gidx) => (
                                <li key={gidx} className="flex gap-2 text-sm text-gray-700">
                                  <span className="text-emerald-500 mt-0.5">✓</span> {goal}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {phase.resources && phase.resources.length > 0 && (
                            <div className="pt-3 border-t border-gray-100">
                              <h6 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resources</h6>
                              <div className="flex flex-wrap gap-2">
                                {phase.resources.map((res, ridx) => (
                                  <span key={ridx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                    {res}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
               </motion.div>
            )}
        </motion.div>
      );
      case 'settings': return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-2xl">
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Configuration</h3>
            <p className="text-gray-500">Customize the underlying intelligence. By default, we use our highly optimized global agent with standard models.</p>
          </div>

          <div className="space-y-6 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
             <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-5 h-5 text-indigo-600" />
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Custom Gemini API Key (Optional)</label>
                </div>
                <input 
                  type="password" 
                  placeholder="Paste your Google AI Studio key here"
                  className="w-full border-gray-200 border rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-sm"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                />
                <p className="text-xs text-gray-400 leading-relaxed italic">If provided, we'll use your personal key. Otherwise, we'll use our built-in system key with your selected model below.</p>
             </div>

             <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Model Selection</label>
                </div>
                <select 
                  className="w-full border-gray-200 border rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white font-semibold text-gray-700"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <optgroup label="Recommended">
                    <option value="gemini-3-flash-preview">Gemini 3 Flash (Next-Gen)</option>
                    <option value="gemini-3.1-flash-lite">Gemini Flash Lite (Fastest)</option>
                  </optgroup>
                  <optgroup label="Advanced">
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Elite Reasoning)</option>
                    <option value="gemini-flash-latest">Gemini Flash (Latest)</option>
                  </optgroup>
                </select>
                <p className="text-xs text-gray-400 leading-relaxed italic">This model choice applies regardless of whether you use a custom key or the system key.</p>
             </div>
             
              {customApiKey && (
               <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={testApiKey}
                      disabled={isTestingKey}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isTestingKey ? "Verifying..." : "Verify Connection"}
                    </button>
                    
                    {testResult && (
                      <div className={cn(
                        "p-4 rounded-xl text-sm border",
                        testResult.success ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
                      )}>
                        {testResult.message}
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-800">Custom API integration active. The app will now use your provided credentials. <strong>Note:</strong> Ensure your key has access to the selected model.</p>
                  </div>
               </div>
             )}
          </div>
        </motion.div>
      );
      default:
        return null;
    }
  };

  if (showLanding) {
    return (
      <>
        <CustomCursor />
        <LandingPage onStart={() => setShowLanding(false)} />
      </>
    );
  }

  return (
    <>
    <CustomCursor />
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowLanding(true)}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
             <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-gray-900">Academia<span className="text-indigo-600 font-medium">Genie</span></h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 border border-gray-200 rounded-lg text-gray-600"
        >
          {isSidebarOpen ? <CheckCircle2 className="w-6 h-6 rotate-45" /> : <LayoutDashboard className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-gray-200 p-6 flex flex-col z-50 shadow-sm transition-transform duration-300 lg:translate-x-0 h-full",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div 
          className="hidden lg:flex items-center gap-3 mb-12 mt-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setShowLanding(true)}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
             <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Academia<span className="text-indigo-600 font-medium">Genie</span></h1>
        </div>
        
        <nav className="flex-1 space-y-3 relative">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all relative overflow-hidden group",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {isActive && (
                  <motion.div layoutId="activeTabMarker" className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-md" />
                )}
                <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600")} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-8 border-t border-gray-100">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100/50">
             <p className="text-xs font-bold text-indigo-900 tracking-wider uppercase mb-1">Status</p>
             <p className="text-sm text-indigo-700 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Applet Ready
             </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative h-[calc(100vh-64px)] lg:h-full">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10 border-b border-indigo-50/20"></div>
        <div className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12">
          <div className="min-h-[500px]">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
