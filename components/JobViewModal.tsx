
import React from 'react';
import { Job } from '../types';
import { X, Calendar, Target, Briefcase, Users, Heart, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Props {
  job: Job;
  onClose: () => void;
}

const JobViewModal: React.FC<Props> = ({ job, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
              <div className="flex items-center mt-1 space-x-3 text-xs">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                  job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {job.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  {job.status === 'active' ? 'Ativa' : 'Encerrada'}
                </span>
                <span className="flex items-center text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  Criada em: {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  Válida até: {new Date(job.validUntil).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-8">
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center mb-3">
              <Target className="w-4 h-4 mr-2" />
              Missão do Cargo
            </h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 leading-relaxed">
              {job.mission || "Nenhuma missão informada."}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center mb-3">
                <Users className="w-4 h-4 mr-2" />
                Hard Skills (Técnicos)
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.techRequirements.length > 0 ? job.techRequirements.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100">
                    {skill}
                  </span>
                )) : <span className="text-gray-400 italic text-sm">Nenhum requisito listado.</span>}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center mb-3">
                <Users className="w-4 h-4 mr-2" />
                Soft Skills (Comportamentais)
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.behavioralRequirements.length > 0 ? job.behavioralRequirements.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-100">
                    {skill}
                  </span>
                )) : <span className="text-gray-400 italic text-sm">Nenhum requisito listado.</span>}
              </div>
            </section>
          </div>

          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center mb-3">
              <Heart className="w-4 h-4 mr-2" />
              Cultura Organizacional
            </h3>
            <div className="bg-pink-50/30 p-4 rounded-xl border border-pink-100 text-gray-700 leading-relaxed italic">
              "{job.culture || "Informação de cultura não disponível."}"
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500 font-medium">
            Total de {job.applicantCount} candidatos inscritos até o momento.
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobViewModal;
