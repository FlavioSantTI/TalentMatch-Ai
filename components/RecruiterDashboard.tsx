
import React, { useState } from 'react';
import { Job } from '../types';
import { Plus, Search, CheckCircle, XCircle, Clock, Edit2, Trash2, AlertTriangle, Loader2, Eye, Users, TrendingUp, Briefcase } from 'lucide-react';
import JobForm from './JobForm';
import JobViewModal from './JobViewModal';
import CandidateList from './CandidateList';
import { deleteJobFromDB, updateJob } from '../services/supabaseService';

interface Props {
  jobs: Job[];
  onAddJob: (job: Job) => Promise<boolean>;
  onUpdateJobStatus: (id: string, status: 'active' | 'closed') => void;
  onRefresh: () => void;
}

const RecruiterDashboard: React.FC<Props> = ({ jobs, onAddJob, onUpdateJobStatus, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [activeCandidatesJob, setActiveCandidatesJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalVagas: jobs.length,
    vagasAtivas: jobs.filter(j => j.status === 'active').length,
    totalCandidatos: jobs.reduce((acc, curr) => acc + curr.applicantCount, 0),
  };

  const handleDelete = async (job: Job) => {
    if (job.applicantCount > 0) {
      alert("Não é possível excluir uma vaga que já possui candidatos inscritos.");
      return;
    }
    if (!confirm(`Tem certeza que deseja excluir a vaga "${job.title}"?`)) return;
    setIsDeleting(job.id);
    try {
      await deleteJobFromDB(job.id);
      onRefresh();
    } catch (error: any) {
      alert("Erro ao excluir vaga: " + error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditSubmit = async (updatedJob: Job) => {
    try {
      await updateJob(updatedJob.id, updatedJob);
      onRefresh();
    } catch (error: any) {
      throw error;
    }
  };

  if (activeCandidatesJob) {
    return (
      <CandidateList job={activeCandidatesJob} onBack={() => { setActiveCandidatesJob(null); onRefresh(); }} />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {viewingJob && <JobViewModal job={viewingJob} onClose={() => setViewingJob(null)} />}

      {/* Analytics Summary */}
      {!showForm && !editingJob && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="bg-indigo-50 p-3 rounded-xl"><Briefcase className="w-6 h-6 text-indigo-600" /></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vagas Ativas</p>
              <h4 className="text-2xl font-black text-gray-900">{stats.vagasAtivas}</h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="bg-emerald-50 p-3 rounded-xl"><Users className="w-6 h-6 text-emerald-600" /></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Candidatos Totais</p>
              <h4 className="text-2xl font-black text-gray-900">{stats.totalCandidatos}</h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="bg-amber-50 p-3 rounded-xl"><TrendingUp className="w-6 h-6 text-amber-600" /></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Conversão Match</p>
              <h4 className="text-2xl font-black text-gray-900">High</h4>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Vagas</h2>
          <p className="text-gray-500">Acompanhe e otimize seu fluxo de contratação.</p>
        </div>
        {!showForm && !editingJob && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold"
          >
            <Plus className="w-5 h-5 mr-2" /> Nova Vaga
          </button>
        )}
      </div>

      {(showForm || editingJob) ? (
        <div className="mb-8">
          <JobForm 
            initialData={editingJob || undefined}
            onCancel={() => { setShowForm(false); setEditingJob(null); }} 
            onSubmit={editingJob ? handleEditSubmit : async (newJob) => {
              const success = await onAddJob(newJob);
              if (success) setShowForm(false);
            }} 
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por título..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-xs text-gray-400 font-medium hidden sm:block">
              Total: {filteredJobs.length} vagas
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vaga</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Candidatos</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Validade</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gerenciar</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">
                      Nenhuma vaga cadastrada.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{job.title}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{job.id.split('-')[0]}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setActiveCandidatesJob(job)}
                          className="group/btn relative bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all flex items-center shadow-sm"
                        >
                          <Users className="w-3.5 h-3.5 mr-2" />
                          {job.applicantCount} Inscritos
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                        {new Date(job.validUntil).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => onUpdateJobStatus(job.id, job.status === 'active' ? 'closed' : 'active')}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {job.status === 'active' ? 'Ativa' : 'Fincada'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewingJob(job)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Ver Vaga"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => setEditingJob(job)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Editar"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(job)} disabled={job.applicantCount > 0 || isDeleting === job.id} className={`p-2 rounded-lg transition-all ${job.applicantCount > 0 ? 'text-gray-200 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`} title="Excluir">
                            {isDeleting === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
