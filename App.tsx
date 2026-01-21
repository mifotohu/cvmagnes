
import React, { useState, useRef, useEffect } from 'react';
import { generateHRMaterials } from './services/geminiService';
import { ApplicationData, GenerationResult, StyleType, ToneType, AISkills, FileData, SkillMatch } from './types';
import SkillSlider from './components/SkillSlider';
import { 
  Send, 
  FileText, 
  Mail, 
  Copy, 
  Sparkles, 
  Cpu, 
  Building2, 
  UserCircle2,
  AlertCircle,
  Database,
  Zap,
  BookOpen,
  Target,
  Maximize2,
  Upload,
  X,
  FileCheck,
  RefreshCw,
  ShieldAlert,
  MessageSquare,
  Key,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  SearchCheck,
  CheckCircle2,
  BarChart3
} from 'lucide-react';

const STORAGE_KEY = 'hr_magnet_api_key';
const TIMESTAMP_KEY = 'hr_magnet_api_key_time';
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [userApiKey, setUserApiKey] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ApplicationData>({
    cvData: '',
    jdData: '',
    company: '',
    position: '',
    salary: '',
    style: StyleType.PROFESSIONAL,
    tone: ToneType.FORMAL,
    aiSkills: {
      llm: 3,
      prompting: 3,
      visualAI: 1,
      automation: 2,
      analysis: 3
    }
  });

  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    const savedTime = localStorage.getItem(TIMESTAMP_KEY);

    if (savedKey && savedTime) {
      const now = Date.now();
      if (now - parseInt(savedTime) < EXPIRY_MS) {
        setUserApiKey(savedKey);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TIMESTAMP_KEY);
      }
    }
  }, []);

  const handleApiKeyChange = (val: string) => {
    setUserApiKey(val);
    localStorage.setItem(STORAGE_KEY, val);
    localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
  };

  const handleInputChange = (field: keyof ApplicationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillChange = (skill: keyof AISkills, value: number) => {
    setFormData(prev => ({
      ...prev,
      aiSkills: { ...prev.aiSkills, [skill]: value }
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("A fájl mérete nem haladhatja meg a 3MB-ot.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setFormData(prev => ({
        ...prev,
        cvFile: {
          base64,
          mimeType: file.type || 'application/pdf',
          fileName: file.name
        },
        cvData: '' 
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFormData(prev => {
      const { cvFile, ...rest } = prev;
      return { ...rest, cvData: '' };
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.cvData && !formData.cvFile) {
      setError("Kérjük, adjon meg CV adatokat szövegesen vagy töltsön fel egy fájlt.");
      return;
    }
    if (!userApiKey) {
      setError("Kérjük, adja meg a Google API kulcsát a fejlécben a generáláshoz.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const materials = await generateHRMaterials({ ...formData, customApiKey: userApiKey });
      setResult(materials);
      if (window.innerWidth < 1024) {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error(err);
      setError("Hiba történt a generálás során. Ellenőrizze az API kulcsot és próbálja újra!");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Intelligens másolás funkció:
   * 1. Átalakítja a markdown boldokat (**szöveg**) HTML bolddá (<b>szöveg</b>).
   * 2. HTML formátumban másolja a vágólapra, így pl. Gmailbe/Outlookba illesztve megmarad a vastagítás.
   * 3. Sima szöveges változatból eltávolítja a csillagokat.
   */
  const copyFormattedToClipboard = async (text: string) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\n/g, '<br>');
    
    const plainText = text.replace(/\*\*/g, '');

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([plainText], { type: 'text/plain' });
        const data = [new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        })];
        await navigator.clipboard.write(data);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
    } catch (err) {
      console.error("Copy failed", err);
      // Fallback
      navigator.clipboard.writeText(plainText);
    }
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      {/* Security Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[12px] md:text-sm text-amber-200/80 leading-relaxed">
            <span className="font-bold text-amber-500 uppercase">Biztonsági tájékoztató:</span> A feltöltött adatokat mi nem tároljuk, viszont a háttérben futó mesterséges intelligencia az adatokat az adatbázis tanításához felhasználhatja, éppen ezért ennek ismeretében használja az applikációt. A funkciók, adatok bevitelével és az applikáció használatával ezekhez kifejezetten hozzájárul. A platform üzemeltetője a továbbiakban felelősségre nem vonható.
          </p>
        </div>
      </div>

      <header className="border-b border-white/5 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4 shrink-0">
             <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="hidden sm:inline">AI ENGINE READY</span>
              <span className="sm:hidden">READY</span>
            </div>
          </div>

          <div className="flex-grow max-w-2xl flex items-center gap-2 md:gap-4">
            <div className="relative flex-grow group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500/50 group-focus-within:text-blue-400 transition-colors">
                <Key className="w-5 h-5" />
              </div>
              <input 
                type="password"
                value={userApiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="Google API kulcs (AIza...)"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm md:text-base focus:ring-2 focus:ring-blue-500/50 transition-all outline-none font-mono placeholder:text-slate-700 shadow-inner"
              />
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 group/tooltip">
                <HelpCircle className="w-5 h-5 text-slate-600 hover:text-blue-400 cursor-help transition-colors" />
                <div className="invisible group-hover/tooltip:visible absolute right-0 top-full mt-4 w-72 md:w-80 p-6 glass border border-blue-500/30 rounded-2xl z-[60] shadow-2xl transition-all opacity-0 group-hover/tooltip:opacity-100 translate-y-2 group-hover/tooltip:translate-y-0">
                  <div className="flex items-center space-x-2 mb-4 text-blue-400">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="text-sm font-bold uppercase tracking-wider">Útmutató kezdőknek</h4>
                  </div>
                  <ul className="space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-500/20 text-blue-400 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold">1</span>
                      <span>Kattints az <strong>"Ingyenes kulcs kérése"</strong> gombra.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-500/20 text-blue-400 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold">2</span>
                      <span>Jelentkezz be a Google fiókoddal.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-500/20 text-blue-400 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold">3</span>
                      <span>Válaszd a <strong>"Create API key"</strong> lehetőséget.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-500/20 text-blue-400 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold">4</span>
                      <span>Másold ki az <strong>AIza...</strong> kezdetű kódot.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="hidden md:flex shrink-0 items-center space-x-2 px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl text-xs font-bold border border-blue-500/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-wide">
              <span>Kulcs kérése</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        <section className="glass p-8 md:p-10 rounded-3xl border border-blue-500/10 shadow-xl bg-gradient-to-br from-slate-900/50 via-slate-900/80 to-slate-950 flex flex-col md:flex-row md:items-center gap-10 overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2.5rem] shadow-2xl shadow-blue-900/40 shrink-0 self-start md:self-center">
            <Cpu className="w-16 h-16 text-white" />
          </div>
          <div className="space-y-3 relative z-10">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              HR Mágnes 2026
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
              Az Ön mesterséges intelligencia alapú pályázati asszisztense. 
              <span className="text-blue-400 font-semibold"> ATS-optimalizált</span>, megnyerő és jövőorientált anyagok pillanatok alatt.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="glass p-8 rounded-3xl space-y-6">
                <h2 className="flex items-center space-x-3 text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                  <Target className="w-5 h-5" />
                  <span>Pályázati Kontextus</span>
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cég neve</label>
                    <input required type="text" value={formData.company} onChange={(e) => handleInputChange('company', e.target.value)} placeholder="Pl. Future Ventures" className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500/50 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pozíció</label>
                    <input required type="text" value={formData.position} onChange={(e) => handleInputChange('position', e.target.value)} placeholder="Pl. AI Architect" className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500/50 transition-all outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Levél stílusa</label>
                    <select value={formData.style} onChange={(e) => handleInputChange('style', e.target.value as StyleType)} className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500/50 transition-all outline-none appearance-none cursor-pointer">
                      {Object.values(StyleType).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Levél hangneme</label>
                    <select value={formData.tone} onChange={(e) => handleInputChange('tone', e.target.value as ToneType)} className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500/50 transition-all outline-none appearance-none cursor-pointer">
                      {Object.values(ToneType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Bérigény (opcionális)</label>
                  <input type="text" value={formData.salary} onChange={(e) => handleInputChange('salary', e.target.value)} placeholder="Pl. 1.8M - 2.2M HUF + bónusz" className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500/50 transition-all outline-none" />
                </div>
              </div>

              <div className="glass p-8 rounded-3xl space-y-6">
                <h2 className="flex items-center space-x-3 text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                  <Sparkles className="w-5 h-5" />
                  <span>AI Kompetenciák (1-5)</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <SkillSlider label="Szöveges LLM" value={formData.aiSkills.llm} onChange={(v) => handleSkillChange('llm', v)} />
                  <SkillSlider label="Prompt Engineering" value={formData.aiSkills.prompting} onChange={(v) => handleSkillChange('prompting', v)} />
                  <SkillSlider label="Vizuális AI" value={formData.aiSkills.visualAI} onChange={(v) => handleSkillChange('visualAI', v)} />
                  <SkillSlider label="Automatizálás" value={formData.aiSkills.automation} onChange={(v) => handleSkillChange('automation', v)} />
                  <SkillSlider label="Adatelemzés" value={formData.aiSkills.analysis} onChange={(v) => handleSkillChange('analysis', v)} />
                </div>
              </div>

              <div className="glass p-8 rounded-3xl space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center space-x-3 text-sm font-bold text-slate-400 uppercase tracking-widest">
                      <UserCircle2 className="w-5 h-5" />
                      <span>Önéletrajz (CV)</span>
                    </h2>
                  </div>
                  {!formData.cvFile ? (
                    <div onClick={() => fileInputRef.current?.click()} className="group border-2 border-dashed border-white/5 hover:border-blue-500/50 rounded-2xl p-10 transition-all cursor-pointer bg-slate-900/30 flex flex-col items-center justify-center space-y-4">
                      <Upload className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                      <p className="text-base font-bold text-slate-300">Fájl feltöltése (PDF/DOCX)</p>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" />
                    </div>
                  ) : (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 flex items-center justify-between group">
                      <div className="flex items-center space-x-4">
                        <FileCheck className="w-6 h-6 text-blue-400" />
                        <div><p className="text-base font-bold text-slate-200">{formData.cvFile.fileName}</p></div>
                      </div>
                      <button type="button" onClick={removeFile} className="p-2.5 text-slate-500 hover:text-red-400 transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                  )}
                  <textarea rows={5} value={formData.cvData} onChange={(e) => handleInputChange('cvData', e.target.value)} disabled={!!formData.cvFile} placeholder={formData.cvFile ? "Fájl feltöltve..." : "Másolja be ide a CV tartalmát..."} className={`w-full bg-slate-900/50 border border-white/5 rounded-2xl p-5 text-base focus:ring-2 focus:ring-blue-500/50 transition-all outline-none resize-none placeholder:text-slate-700 ${formData.cvFile ? 'opacity-30' : ''}`} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center space-x-3 text-sm font-bold text-slate-400 uppercase tracking-widest">
                      <Building2 className="w-5 h-5" />
                      <span>Álláshirdetés</span>
                    </h2>
                  </div>
                  <textarea required rows={8} value={formData.jdData} onChange={(e) => handleInputChange('jdData', e.target.value)} placeholder="Másolja be az álláshirdetés szövegét (limit nélkül)..." className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-5 text-base focus:ring-2 focus:ring-blue-500/50 transition-all outline-none resize-none placeholder:text-slate-700" />
                </div>
              </div>

              <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black text-lg text-white transition-all flex items-center justify-center space-x-3 shadow-2xl tracking-widest ${loading ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.01]'}`}>
                {loading ? <> <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> <span>ELEMZÉS...</span> </> : <> <Zap className="w-6 h-6" /> <span>ATS OPTIMALIZÁLÁS INDÍTÁSA</span> </>}
              </button>
            </form>
          </div>

          <div id="result-section" className="lg:col-span-7 space-y-8">
            {!result && !error && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-16 border border-white/5 rounded-[3rem] bg-slate-900/20">
                <FileText className="w-12 h-12 text-slate-700 mb-8" />
                <h3 className="text-2xl font-bold text-slate-300">Várakozás adatokra</h3>
                <p className="text-slate-500 mt-3">Töltse fel adatait a pályázati anyagok létrehozásához.</p>
              </div>
            )}

            {error && (
              <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-start space-x-5 text-red-400">
                <AlertCircle className="w-7 h-7 shrink-0" />
                <div><h4 className="font-black uppercase text-sm">Rendszerhiba</h4><p className="mt-1">{error}</p></div>
              </div>
            )}

            {result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400" /> Generált Pályázati Csomag
                  </h3>
                  <button onClick={() => handleSubmit()} disabled={loading} className="flex items-center space-x-2.5 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-slate-300">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Frissítés</span>
                  </button>
                </div>

                <div className="glass p-8 rounded-3xl space-y-8 border-l-4 border-l-blue-400 shadow-2xl">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-black uppercase text-slate-500">Készség-Illeszkedési Elemzés</span>
                  </div>
                  <div className="space-y-6">
                    {result.skillAlignment.map((skill, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-black text-slate-400 uppercase">{skill.label}</span>
                          <span className="text-sm font-mono font-black text-blue-400">{skill.score}% MATCH</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${skill.score}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass p-8 rounded-3xl space-y-4 border-l-4 border-l-emerald-500 bg-emerald-500/5">
                   <div className="flex items-center space-x-3">
                    <SearchCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-black uppercase text-slate-500">CV Riport</span>
                  </div>
                  <div className="text-base text-slate-300 leading-relaxed whitespace-pre-wrap">{renderFormattedText(result.cvAnalysisReport)}</div>
                </div>

                <div className="glass p-8 rounded-3xl space-y-4 border-l-4 border-l-blue-500 shadow-xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-black uppercase text-slate-500">Email Tárgy</span>
                    </div>
                    <button onClick={() => copyFormattedToClipboard(result.subject)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 active:text-blue-400"><Copy className="w-5 h-5" /></button>
                  </div>
                  <div className="text-xl font-black text-slate-100 mono leading-tight">{result.subject}</div>
                </div>

                <div className="glass p-8 rounded-3xl space-y-5 border-l-4 border-l-indigo-500 shadow-xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <Send className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-black uppercase text-slate-500">Email Sablon ({formData.tone})</span>
                    </div>
                    <button onClick={() => copyFormattedToClipboard(result.emailTemplate)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 active:text-indigo-400"><Copy className="w-5 h-5" /></button>
                  </div>
                  <div className="bg-slate-900/80 rounded-2xl p-8 text-base leading-relaxed whitespace-pre-wrap text-slate-300 border border-white/5 font-mono shadow-inner max-h-[500px] overflow-y-auto">
                    {renderFormattedText(result.emailTemplate)}
                  </div>
                </div>

                <div className="glass p-8 rounded-3xl space-y-6 border-l-4 border-l-purple-500 shadow-xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      <span className="text-xs font-black uppercase text-slate-500">Motivációs Levél ({formData.tone})</span>
                    </div>
                    <button onClick={() => copyFormattedToClipboard(result.coverLetter + (result.salaryNote ? "\n\n" + result.salaryNote : ""))} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 active:text-purple-400"><Copy className="w-5 h-5" /></button>
                  </div>
                  <div className="bg-slate-900/80 rounded-2xl p-10 text-base leading-relaxed whitespace-pre-wrap text-slate-300 border border-white/5">
                    {renderFormattedText(result.coverLetter)}
                    {result.salaryNote && (
                      <div className="mt-10 pt-8 border-t border-white/5 text-slate-400 italic">
                        {renderFormattedText(result.salaryNote)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-16 border-t border-white/5 text-center mt-16">
        <p className="text-sm text-slate-400 font-bold">&copy; 2026. HR Mágnes - készítette: Práger Péter</p>
      </footer>
    </div>
  );
};

export default App;
