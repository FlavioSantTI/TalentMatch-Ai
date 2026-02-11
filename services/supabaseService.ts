
import { createClient } from '@supabase/supabase-js';
import { Job, Candidate } from '../types';

const supabaseUrl = 'https://vxjnbymflzepfupgzyyh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4am5ieW1mbHplcGZ1cGd6eXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTQ4MjAsImV4cCI6MjA4NDU5MDgyMH0.1P93j3orHVAngd90QzVv8DR9Go0441D3QtwZpUnaYeg';

export const supabase = createClient(supabaseUrl, supabaseKey);

const handleRLSError = (error: any) => {
  if (error.message?.includes('row-level security') || error.statusCode === '403') {
    return "Erro de Permissão (403): O RLS está bloqueando a operação. Verifique as políticas no Supabase.";
  }
  return error.message;
};

// Funções auxiliares para serializar/deserializar campos extras
const packRequirements = (tech: string[], beh: string[]) => `${tech.join(', ')}|||${beh.join(', ')}`;

const unpackRequirements = (str: string): { tech: string[], beh: string[] } => {
  if (!str) return { tech: [], beh: [] };
  if (str.includes('|||')) {
    const parts = str.split('|||');
    return {
      tech: parts[0] ? parts[0].split(', ').map(s => s.trim()).filter(s => s) : [],
      beh: parts[1] ? parts[1].split(', ').map(s => s.trim()).filter(s => s) : []
    };
  }
  return { tech: str.split(', ').map(s => s.trim()).filter(s => s), beh: [] };
};

const packProfile = (mission: string, culture: string) => `${mission}|||${culture}`;

const unpackProfile = (str: string): { mission: string, culture: string } => {
  if (!str) return { mission: '', culture: '' };
  if (str.includes('|||')) {
    const parts = str.split('|||');
    return { mission: parts[0] || '', culture: parts[1] || '' };
  }
  return { mission: str.trim(), culture: '' };
};

export const fetchAllJobs = async () => {
  const { data, error } = await supabase
    .from('vagas')
    .select(`*, candidatos(count)`)
    .order('created_at', { ascending: false });

  if (error) throw new Error(handleRLSError(error));
  
  return (data || []).map((item: any) => {
    const { tech, beh } = unpackRequirements(item.descricao_requisitos);
    const { mission, culture } = unpackProfile(item.perfil_desejado);
    return {
      id: item.id,
      title: item.titulo || 'Sem título',
      mission,
      techRequirements: tech,
      behavioralRequirements: beh,
      culture,
      validUntil: item.valid_until || new Date().toISOString(), 
      status: item.status ? 'active' : 'closed',
      createdAt: item.created_at || new Date().toISOString(),
      applicantCount: item.candidatos?.[0]?.count || 0,
    };
  }) as Job[];
};

export const saveJob = async (job: Omit<Job, 'id' | 'createdAt' | 'applicantCount'>) => {
  const { data, error } = await supabase
    .from('vagas')
    .insert([{
      titulo: job.title,
      descricao_requisitos: packRequirements(job.techRequirements, job.behavioralRequirements),
      perfil_desejado: packProfile(job.mission, job.culture),
      status: job.status === 'active',
      valid_until: job.validUntil
    }])
    .select();

  if (error) throw new Error(handleRLSError(error));
  return data?.[0];
};

export const updateJob = async (id: string, job: Partial<Job>) => {
  const updateData: any = {};
  if (job.title) updateData.titulo = job.title;
  if (job.techRequirements || job.behavioralRequirements) {
    updateData.descricao_requisitos = packRequirements(job.techRequirements || [], job.behavioralRequirements || []);
  }
  if (job.mission !== undefined || job.culture !== undefined) {
    updateData.perfil_desejado = packProfile(job.mission || '', job.culture || '');
  }
  if (job.status) updateData.status = job.status === 'active';
  if (job.validUntil) updateData.valid_until = job.validUntil;

  const { data, error } = await supabase.from('vagas').update(updateData).eq('id', id).select();
  if (error) throw new Error(handleRLSError(error));
  return data?.[0];
};

export const deleteJobFromDB = async (id: string) => {
  const { error } = await supabase.from('vagas').delete().eq('id', id);
  if (error) throw new Error(handleRLSError(error));
};

export const updateJobStatusInDB = async (id: string, status: 'active' | 'closed') => {
  const { error } = await supabase.from('vagas').update({ status: status === 'active' }).eq('id', id);
  if (error) throw new Error(handleRLSError(error));
};

// Candidatos
export const fetchCandidatesByJobId = async (jobId: string) => {
  const { data, error } = await supabase
    .from('candidatos')
    .select('*')
    .eq('vaga_id', jobId);

  if (error) throw new Error(handleRLSError(error));
  
  return (data || []).map((item: any) => ({
    id: item.id,
    jobId: item.vaga_id,
    name: item.nome_completo,
    email: item.email,
    phone: item.telefone,
    resumeUrl: item.url_cv_pdf,
    appliedAt: item.created_at || new Date().toISOString(),
    matchScore: item.match_score,
    matchReasoning: item.match_reasoning,
    missingSkills: item.missing_skills ? item.missing_skills.split('|||') : [],
    interviewQuestions: item.entrevista_perguntas ? item.entrevista_perguntas.split('|||') : []
  })) as Candidate[];
};

export const updateCandidateAnalysis = async (candidateId: string, analysis: { score: number, reasoning: string, missingSkills: string[], interviewQuestions: string[] }) => {
  const { error } = await supabase
    .from('candidatos')
    .update({
      match_score: analysis.score,
      match_reasoning: analysis.reasoning,
      missing_skills: analysis.missingSkills.join('|||'),
      entrevista_perguntas: analysis.interviewQuestions.join('|||')
    })
    .eq('id', candidateId);

  if (error) throw new Error(handleRLSError(error));
};

export const uploadResume = async (file: File) => {
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const { data, error } = await supabase.storage.from('curriculos_storage').upload(fileName, file);
  if (error) throw new Error(`Erro no Storage: ${handleRLSError(error)}`);
  const { data: { publicUrl } } = supabase.storage.from('curriculos_storage').getPublicUrl(fileName);
  return { url: publicUrl };
};

export const createCandidateInDB = async (candidateData: { jobId: string; name: string; email: string; phone: string; resumeUrl: string; }) => {
  const { data, error } = await supabase.from('candidatos').insert([{
    vaga_id: candidateData.jobId,
    nome_completo: candidateData.name,
    email: candidateData.email,
    telefone: candidateData.phone,
    url_cv_pdf: candidateData.resumeUrl,
  }]).select();
  if (error) throw new Error(`Erro no Banco: ${handleRLSError(error)}`);
  return data?.[0];
};
