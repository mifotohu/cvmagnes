import React, { useState, useRef } from 'react';
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
  Zap,
  BookOpen,
  Target,
  Upload,
  X,
  FileCheck,
  RefreshCw,
  ShieldAlert,
  BarChart3,
  SearchCheck
} from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
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

    setLoading(true);
    setError(null);
    try {
      const materials = await generateHRMaterials(formData);
      setResult(materials);
      if (window.innerWidth < 1024) {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error(err);
      setError("Hiba történt a generálás során. Kérjük, próbálja újra!");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[12px] md:text-sm text-amber-200/80 leading-relaxed">
            <span className="font-bold text-amber-500 uppercase">Biztonsági tájékoztató:</span> A feltöltött adatokat nem tároljuk, de az AI az adatbázis tanításához felhasználhatja. Az app használatával ehhez hozzájárul.
          </p>
        </div>
      </div>

      <header className="border-b border-white/5 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>AI ENGINE ACTIVE</span>
            </div>
          </div>
          <div className="text-blue-400 font-black tracking-tighter text-xl">HR MÁGNES 2026</div>
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
              <span className="text-blue-400 font-semibold"> ATS-optimalizált</span> anyagok pillanatok alatt.
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
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Stílus</label>
                    <select value={formData.style} onChange={(e) => handleInputChange('style', e.target.value as StyleType)} className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500/50 transition-all outline-none appearance-none cursor-pointer">
                      {Object.values(StyleType).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hangnem</label>
                    <select value={formData.tone} onChange={(e) => handleInputChange('tone', e.target.value as ToneType)} className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500/50 transition-all outline-none appearance-none cursor-pointer">
                      {Object.values(ToneType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Bérigény</label>
                  <input type="text" value={formData.salary} onChange={(e) => handleInputChange('salary', e.target.value)} placeholder="Pl. 1.8M HUF" className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500/50 transition-all outline-none" />
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
                  <h2 className="flex items-center space-x-3 text-sm font-bold text-slate-400 uppercase tracking-widest">
                    <UserCircle2 className="w-5 h-5" />
                    <span>Önéletrajz (CV)</span>
                  </h2>
                  {!formData.cvFile ? (
                    <div onClick={() => fileInputRef.current?.click()} className="group border-2 border-dashed border-white/5 hover:border-blue-500/50 rounded-2xl p-10 transition-all cursor-pointer bg-slate-900/30 flex flex-col items-center justify-center space-y-4">
                      <Upload className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                      <p className="text-base font-bold text-slate-300">Fájl feltöltése</p>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" />
                    </div>
                  ) : (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 flex items-center justify-between group">
                      <div className="flex items-center space-x-4">
                        <FileCheck className="w-6 h-6 text-blue-400" />
                        <p className="text-base font-bold text-slate-200">{formData.cvFile.fileName}</p>
                      </div>
                      <button type="button" onClick={removeFile} className="p-2.5 text-slate-500 hover:text-red-400 transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                  )}
                  <textarea rows={5} value={formData.cvData} onChange={(e) => handleInputChange('cvData', e.target.value)} disabled={!!formData.cvFile} placeholder={formData.cvFile ? "Fájl feltöltve..." : "Vagy másolja be ide a CV tartalmát..."} className={`w-full bg-slate-900/50 border border-white/5 rounded-2xl p-5 text-base focus:ring-2 focus:ring-blue-500/50 transition-all outline-none resize-none ${formData.cvFile ? 'opacity-30' : ''}`} />
                </div>

                <div className="space-y-3">
                  <h2 className="flex items-center space-x-3 text-sm font-bold text-slate-400 uppercase tracking-widest">
                    <Building2 className="w-5 h-5" />
                    <span>Álláshirdetés</span>
                  </h2>
                  <textarea required rows={8} value={formData.jdData} onChange={(e) => handleInputChange('jdData', e.target.value)} placeholder="Másolja be az álláshirdetés szövegét..." className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-5 text-base focus:ring-2 focus:ring-blue-500/50 transition-all outline-none resize-none" />
                </div>
              </div>

              <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black text-lg text-white transition-all flex items-center justify-center space-x-3 shadow-2xl tracking-widest ${loading ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.01]'}`}>
                {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                <span>{loading ? 'ELEMZÉS...' : 'ATS OPTIMALIZÁLÁS'}</span>
              </button>
            </form>
          </div>

          <div id="result-section" className="lg:col-span-7 space-y-8">
            {!result && !error && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-16 border border-white/5 rounded-[3rem] bg-slate-900/20">
                <FileText className="w-12 h-12 text-slate-700 mb-8" />
                <h3 className="text-2xl font-bold text-slate-300">Várakozás adatokra</h3>
                <p className="text-slate-500 mt-3">Töltse fel adatait a generáláshoz.</p>
              </div>
            )}

            {error && (
              <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-start space-x-5 text-red-400">
                <AlertCircle className="w-7 h-7 shrink-0" />
                <div><h4 className="font-black uppercase text-sm">Hiba</h4><p className="mt-1">{error}</p></div>
              </div>
            )}

            {result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12">
                <div className="glass p-8 rounded-3xl space-y-8 border-l-4 border-l-blue-400 shadow-2xl">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-black uppercase text-slate-500">Skill Match</span>
                  </div>
                  <div className="space-y-6">
                    {result.skillAlignment.map((skill, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-black text-slate-400 uppercase">{skill.label}</span>
                          <span className="text-sm font-mono font-black text-blue-400">{skill.score}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600" style={{ width: `${skill.score}%` }}></div>
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
                  <div className="text-base text-slate-300 whitespace-pre-wrap">{renderFormattedText(result.cvAnalysisReport || '')}</div>
                </div>

                <div className="glass p-8 rounded-3xl space-y-4 border-l-4 border-l-blue-500 shadow-xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-black uppercase text-slate-500">Email Tárgy</span>
                    </div>
                    <button onClick={() => copyFormattedToClipboard(result.subject)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><Copy className="w-5 h-5" /></button>
                  </div>
                  <div className="text-xl font-black text-slate-100">{result.subject}</div>
                </div>

                <div className="glass p-8 rounded-3xl space-y-5 border-l-4 border-l-indigo-500 shadow-xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <Send className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-black uppercase text-slate-500">Email Sablon</span>
                    </div>
                    <button onClick={() => copyFormattedToClipboard(result.emailTemplate)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><Copy className="w-5 h-5" /></button>
                  </div>
                  <div className="bg-slate-900/80 rounded-2xl p-8 text-base leading-relaxed whitespace-pre-wrap text-slate-300 font-mono">
                    {renderFormattedText(result.emailTemplate)}
                  </div>
                </div>

                <div className="glass p-8 rounded-3xl space-y-6 border-l-4 border-l-purple-500 shadow-xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      <span className="text-xs font-black uppercase text-slate-500">Motivációs Levél</span>
                    </div>
                    <button onClick={() => copyFormattedToClipboard(result.coverLetter + (result.salaryNote ? "\n\n" + result.salaryNote : ""))} className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><Copy className="w-5 h-5" /></button>
                  </div>
                  <div className="bg-slate-900/80 rounded-2xl p-10 text-base leading-relaxed whitespace-pre-wrap text-slate-300">
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