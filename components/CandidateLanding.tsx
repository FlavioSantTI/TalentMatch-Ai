
import React, { useState } from 'react';
import { Job } from '../types';
import { Upload, FileText, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadResume, createCandidateInDB } from '../services/supabaseService';

interface Props {
  jobs: Job[];
}

const CandidateLanding: React.FC<Props> = ({ jobs }) => {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Apenas arquivos PDF são permitidos.');
        setFile(null);
      } else {
        setError('');
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedJobId) {
      setError('Por favor, selecione uma vaga e anexe seu currículo.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      console.log("Iniciando processo de candidatura...");
      
      // 1. Upload do Arquivo
      const { url } = await uploadResume(file);

      // 2. Salvar Candidato
      await createCandidateInDB({
        jobId: selectedJobId,
        name: personalData.name,
        email: personalData.email,
        phone: personalData.phone,
        resumeUrl: url
      });

      console.log("Processo finalizado com sucesso!");
      setSubmitted(true);
    } catch (err: any) {
      console.error("Falha na candidatura:", err);
      // Extrai a mensagem de erro da forma mais completa possível
      const msg = err.message || (typeof err === 'string' ? err : 'Erro desconhecido');
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center animate-in zoom-in duration-300">
          <div className="bg-green-100 p-4 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidatura Enviada!</h2>
          <p className="text-gray-600 mb-8">
            Sucesso! Seu currículo foi recebido e será analisado por nossa inteligência artificial.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setPersonalData({ name: '', email: '', phone: '' });
              setFile(null);
              setSelectedJobId('');
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            Fazer outra inscrição
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-64px)]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            Candidate-se agora
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Preencha seus dados e anexe seu currículo em PDF.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start text-red-800 text-sm animate-in fade-in duration-300">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-red-500" />
                <div className="flex-1">
                  <p className="font-bold">Não foi possível enviar:</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vaga de Interesse</label>
              <select
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white cursor-pointer"
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
              >
                <option value="">Escolha uma oportunidade...</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  value={personalData.name}
                  onChange={e => setPersonalData(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                  <input
                    required
                    type="email"
                    placeholder="joao@exemplo.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={personalData.email}
                    onChange={e => setPersonalData(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp / Telefone</label>
                  <input
                    required
                    type="tel"
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={personalData.phone}
                    onChange={e => setPersonalData(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Currículo (Formato PDF)</label>
              <div 
                className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center transition-all ${
                  file ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="flex flex-col items-center text-center">
                    <FileText className="w-12 h-12 text-indigo-600 mb-2" />
                    <span className="text-sm font-bold text-gray-900">{file.name}</span>
                    <span className="text-xs text-indigo-500 mt-1 font-medium">Arquivo selecionado. Clique para trocar.</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Arraste seu PDF aqui ou clique</span>
                    <span className="text-xs text-gray-400 mt-1">Limite de 10MB</span>
                  </div>
                )}
              </div>
            </div>

            <button
              disabled={isSubmitting || !file || !selectedJobId}
              className={`w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all active:scale-[0.98] ${
                isSubmitting || !file || !selectedJobId 
                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-3 h-5 w-5 text-white" />
                  Salvando Candidatura...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Finalizar Candidatura
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CandidateLanding;
