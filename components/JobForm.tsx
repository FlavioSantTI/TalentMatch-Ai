
import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { X, Calendar, Target, Briefcase, Users, Heart, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import ChipInput from './ChipInput';

interface Props {
  initialData?: Job;
  onCancel: () => void;
  onSubmit: (job: Job) => Promise<void>;
}

const JobForm: React.FC<Props> = ({ initialData, onCancel, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    mission: initialData?.mission || '',
    techRequirements: initialData?.techRequirements || [],
    behavioralRequirements: initialData?.behavioralRequirements || [],
    culture: initialData?.culture || '',
    validUntil: initialData?.validUntil ? new Date(initialData.validUntil).toISOString().split('T')[0] : '',
  });

  // Garante que o estado do formulário seja atualizado se initialData mudar (embora seja montado fresco pelo Dashboard)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        mission: initialData.mission || '',
        techRequirements: initialData.techRequirements || [],
        behavioralRequirements: initialData.behavioralRequirements || [],
        culture: initialData.culture || '',
        validUntil: initialData.validUntil ? new Date(initialData.validUntil).toISOString().split('T')[0] : '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const jobPayload: Job = {
        ...formData,
        id: initialData?.id || '',
        status: initialData?.status || 'active',
        createdAt: initialData?.createdAt || new Date().toISOString(),
        applicantCount: initialData?.applicantCount || 0,
      };
      
      await onSubmit(jobPayload);
      setIsSuccess(true);
      setTimeout(() => onCancel(), 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao processar vaga.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-green-200 p-12 text-center animate-in zoom-in-95 duration-300">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Vaga {initialData ? 'Atualizada' : 'Publicada'}!</h3>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
          {initialData ? 'Editar Vaga' : 'Cadastrar Nova Vaga'}
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600" disabled={isSubmitting}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {errorMessage && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-start text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Vaga</label>
              <input
                required
                disabled={isSubmitting}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-shadow disabled:bg-gray-50"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <Target className="w-4 h-4 mr-1 text-gray-400" />
                Missão do Cargo
              </label>
              <textarea
                required
                disabled={isSubmitting}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none disabled:bg-gray-50"
                value={formData.mission}
                onChange={e => setFormData(prev => ({ ...prev, mission: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                Data de Validade
              </label>
              <input
                required
                disabled={isSubmitting}
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-gray-50"
                value={formData.validUntil}
                onChange={e => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <Users className="w-4 h-4 mr-1 text-gray-400" />
                Requisitos Técnicos (Hard Skills)
              </label>
              <ChipInput 
                chips={formData.techRequirements}
                onChange={chips => setFormData(prev => ({ ...prev, techRequirements: chips }))}
                color="indigo"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <Users className="w-4 h-4 mr-1 text-gray-400" />
                Requisitos Comportamentais (Soft Skills)
              </label>
              <ChipInput 
                chips={formData.behavioralRequirements}
                onChange={chips => setFormData(prev => ({ ...prev, behavioralRequirements: chips }))}
                color="emerald"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <Heart className="w-4 h-4 mr-1 text-gray-400" />
                Cultura da Empresa
              </label>
              <textarea
                required
                disabled={isSubmitting}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none disabled:bg-gray-50"
                value={formData.culture}
                onChange={e => setFormData(prev => ({ ...prev, culture: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm flex items-center min-w-[140px] justify-center"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (initialData ? 'Salvar Alterações' : 'Publicar Vaga')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;
