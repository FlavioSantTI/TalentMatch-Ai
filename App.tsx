
import React, { useState, useEffect } from 'react';
import { ViewMode, Job } from './types';
import RecruiterDashboard from './components/RecruiterDashboard';
import CandidateLanding from './components/CandidateLanding';
import { Layout, Briefcase, UserCircle, Loader2, AlertTriangle } from 'lucide-react';
import { fetchAllJobs, saveJob, updateJobStatusInDB } from './services/supabaseService';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.RECRUITER);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);

  const loadJobs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setSetupError(null);
      const data = await fetchAllJobs();
      setJobs(data);
    } catch (error: any) {
      console.error("Erro ao carregar vagas:", error);
      if (error.code === 'PGRST205') {
        setSetupError("A tabela 'vagas' não foi encontrada no seu banco de dados.");
      } else {
        setSetupError(error.message || "Erro de conexão com o Supabase.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const addJob = async (newJobData: Job): Promise<boolean> => {
    try {
      await saveJob(newJobData);
      await loadJobs(true); 
      return true;
    } catch (error: any) {
      console.error("Erro ao salvar vaga:", error);
      throw error;
    }
  };

  const updateJobStatus = async (id: string, status: 'active' | 'closed') => {
    try {
      await updateJobStatusInDB(id, status);
      setJobs(prev => prev.map(job => job.id === id ? { ...job, status } : job));
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">TalentMatch AI</h1>
            </div>
            
            <nav className="flex space-x-4">
              <button
                onClick={() => setViewMode(ViewMode.RECRUITER)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === ViewMode.RECRUITER 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Recrutador</span>
              </button>
              <button
                onClick={() => setViewMode(ViewMode.CANDIDATE)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === ViewMode.CANDIDATE 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <UserCircle className="w-4 h-4" />
                <span>Candidato</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Setup Error Banner */}
      {setupError && (
        <div className="bg-red-50 border-b border-red-100 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center text-red-700 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>{setupError}</span>
            </div>
            <button 
              onClick={() => loadJobs()}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
            <p className="text-gray-500 font-medium">Conectando ao banco...</p>
          </div>
        ) : (
          viewMode === ViewMode.RECRUITER ? (
            <RecruiterDashboard 
              jobs={jobs} 
              onAddJob={addJob} 
              onUpdateJobStatus={updateJobStatus} 
              onRefresh={() => loadJobs(true)}
            />
          ) : (
            <CandidateLanding jobs={jobs.filter(j => j.status === 'active')} />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; 2024 TalentMatch AI. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default App;
