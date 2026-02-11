
import React, { useState, useEffect } from 'react';
import { Job, Candidate } from '../types';
// Fixed: Added 'Clock' to the import list from 'lucide-react'
import { ArrowLeft, User, Mail, Phone, FileText, Sparkles, Loader2, CheckCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp, MessageSquare, SortAsc, SortDesc, Clock } from 'lucide-react';
import { fetchCandidatesByJobId, updateCandidateAnalysis } from '../services/supabaseService';
import { analyzeCandidateMatch } from '../services/geminiService';

interface Props {
  job: Job;
  onBack: () => void;
}

const CandidateList: React.FC<Props> = ({ job, onBack }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCandidatesByJobId(job.id);
      setCandidates(data);
    } catch (err: any) {
      setError(err.message || "Não foi possível carregar a lista de candidatos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (job?.id) {
      loadCandidates();
    }
  }, [job?.id]);

  const sortedCandidates = [...candidates].sort((a, b) => {
    if (sortBy === 'score') {
      const scoreA = a.matchScore ?? -1;
      const scoreB = b.matchScore ?? -1;
      return scoreB - scoreA;
    }
    return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
  });

  const handleAnalyze = async (candidate: Candidate) => {
    setAnalyzingId(candidate.id);
    try {
      const simulatedResumeText = `Candidato ${candidate.name}. Interessado na vaga de ${job.title}. Possui experiência relevante na área conforme requisitos: ${job.techRequirements.join(', ')}.`;
      
      const allRequirements = [...job.techRequirements, ...job.behavioralRequirements];
      const result = await analyzeCandidateMatch(allRequirements, simulatedResumeText);
      
      if (result) {
        await updateCandidateAnalysis(candidate.id, result);
        setCandidates(prev => prev.map(c => c.id === candidate.id ? { 
          ...c, 
          matchScore: result.score, 
          matchReasoning: result.reasoning,
          missingSkills: result.missingSkills,
          interviewQuestions: result.interviewQuestions
        } : c));
        setExpandedId(candidate.id);
      }
    } catch (error) {
      alert("Erro na análise da IA.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined) return 'text-gray-400 bg-gray-100';
    if (score >= 75) return 'text-green-700 bg-green-100 border-green-200';
    if (score >= 40) return 'text-amber-700 bg-amber-100 border-amber-200';
    return 'text-red-700 bg-red-100 border-red-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Candidatos para {job.title}</h2>
            <p className="text-gray-500 text-sm">{candidates.length} talentos inscritos</p>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setSortBy('date')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${sortBy === 'date' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Clock className="w-3 h-3 mr-1.5" /> Recentemente
          </button>
          <button 
            onClick={() => setSortBy('score')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${sortBy === 'score' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Sparkles className="w-3 h-3 mr-1.5" /> Maior Match
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Sincronizando talentos...</p>
        </div>
      ) : sortedCandidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum candidato ainda</h3>
          <p className="text-gray-500">Divulgue o link da vaga para começar a receber currículos.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCandidates.map((candidate) => (
            <div 
              key={candidate.id} 
              className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                expandedId === candidate.id ? 'border-indigo-300 ring-1 ring-indigo-100 shadow-md scale-[1.01]' : 'border-gray-200 shadow-sm'
              }`}
            >
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    {candidate.matchScore && candidate.matchScore >= 80 && (
                      <div className="absolute -top-1 -right-1 bg-amber-400 p-1 rounded-full border-2 border-white shadow-sm" title="Top Talent">
                        <Sparkles className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{candidate.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                      <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1" /> {candidate.email}</span>
                      <span className="flex items-center font-medium"><CheckCircle className="w-3.5 h-3.5 mr-1 text-green-500" /> {new Date(candidate.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {candidate.matchScore !== undefined ? (
                    <div className={`px-4 py-2 rounded-xl border flex flex-col items-center justify-center min-w-[100px] ${getScoreColor(candidate.matchScore)} shadow-sm`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">AI Match</span>
                      <span className="text-xl font-black leading-tight">{candidate.matchScore}%</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAnalyze(candidate)}
                      disabled={analyzingId === candidate.id}
                      className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-sm disabled:opacity-50"
                    >
                      {analyzingId === candidate.id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-2" /> Analisar Match</>
                      )}
                    </button>
                  )}

                  <div className="flex items-center space-x-1">
                    <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                      <FileText className="w-5 h-5" />
                    </a>
                    <button onClick={() => setExpandedId(expandedId === candidate.id ? null : candidate.id)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                      {expandedId === candidate.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {expandedId === candidate.id && (
                <div className="px-5 pb-6 pt-0 border-t border-gray-100 bg-gray-50/50 animate-in slide-in-from-top-2 duration-300">
                  {candidate.matchScore !== undefined ? (
                    <div className="space-y-6 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                          <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 flex items-center">
                            <Sparkles className="w-3.5 h-3.5 mr-2" /> Justificativa Técnica
                          </h4>
                          <p className="text-gray-700 leading-relaxed text-sm">
                            {candidate.matchReasoning}
                          </p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                          <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center">
                            <AlertCircle className="w-3.5 h-3.5 mr-2" /> Gaps Identificados
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {candidate.missingSkills && candidate.missingSkills.length > 0 ? candidate.missingSkills.map((gap, i) => (
                              <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-[11px] font-bold border border-red-100">
                                {gap}
                              </span>
                            )) : (
                              <span className="text-green-600 text-sm font-medium flex items-center bg-green-50 px-3 py-1 rounded-md">
                                <CheckCircle className="w-4 h-4 mr-2" /> Candidato atende a todos os requisitos.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-100">
                        <h4 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2" /> Guia de Entrevista Sugerido pela IA
                        </h4>
                        <div className="space-y-3">
                          {candidate.interviewQuestions?.map((question, i) => (
                            <div key={i} className="flex items-start bg-white/10 p-3 rounded-lg border border-white/10 hover:bg-white/20 transition-all cursor-default group">
                              <span className="bg-white text-indigo-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mr-3 flex-shrink-0 mt-0.5 shadow-sm">
                                {i + 1}
                              </span>
                              <p className="text-sm font-medium leading-relaxed italic">"{question}"</p>
                            </div>
                          )) || <p className="text-white/60 text-sm">Análise pendente para gerar perguntas.</p>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-8 text-center bg-white rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-500 mb-4">A análise de IA ainda não foi realizada.</p>
                      <button onClick={() => handleAnalyze(candidate)} className="inline-flex items-center px-6 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all font-bold">
                        Iniciar Análise RAG
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateList;
