# -*- coding: utf-8 -*-
from pathlib import Path
path = Path('AuraScribe_Frontend/components/SessionViewer.tsx')
text = path.read_text()
start = text.index('  const renderMADOForm = () => {')
end = text.index('  const ContentArea =', start)
old_block = text[start:end]
replacement = """  const renderMADOForm = () => {
    const data = session.madoData;
    if (!data) return null;

    const mask = (value?: string) => (isPrivacyMode ? '████████' : value || 'Non disponible');
    const patient = data.patient;
    const reporter = data.reporter;
    const clinical = data.clinicalContext;
    const municipality = patient.municipality || 'Montréal';
    const onsetDate = clinical.onsetDate || 'À confirmer';
    const exposures = data.exposures?.join(', ') || 'À préciser';
    const narrative = clinical.narrative || session.transcript?.slice(0, 400) || 'Détails cliniques non fournis.';
    const instructions = data.instructions || 'Confirmer le formulaire AS-770 officiel.';
    const emergencyFlag = data.isEmergency ? 'OUI' : 'NON';
    const urgency = data.urgency || 'Standard';

    return (
      <div className="bg-white p-12 shadow-2xl border-2 border-slate-900 text-slate-900 font-serif max-w-5xl mx-auto space-y-6 print:shadow-none print:border-none">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-slate-900 pb-4">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tight">AS-770 (Déclaration MADO)</h1>
            <p className="text-[10px] font-bold">Direction de la santé publique • Québec</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-lg font-bold text-amber-700 uppercase">MADO / Déclaration obligatoire</p>
            <p className="text-[10px] text-slate-500">{data.publicHealthUnit}</p>
          </div>
        </div>

        <section className="grid lg:grid-cols-2 gap-4 text-[11px]">
          <div className="border border-slate-900 p-4 rounded-2xl space-y-1">
            <p className="text-[10px] uppercase font-black tracking-tight text-slate-500">1. Identification du patient</p>
            <p className="font-bold text-lg">{mask(patient.fullName)}</p>
            <p>RAMQ : <span className="font-mono">{mask(patient.ramq)}</span></p>
            <p>Date de naissance : {mask(patient.dob)}</p>
            <p>Code postal : {mask(patient.postalCode)}</p>
            <p>Municipalité : {mask(municipality)}</p>
          </div>
          <div className="border border-slate-900 p-4 rounded-2xl space-y-1">
            <p className="text-[10px] uppercase font-black tracking-tight text-slate-500">2. Détails de la maladie</p>
            <p className="font-bold text-lg">{data.disease.name}</p>
            <p>Code clinique : {data.disease.code}</p>
            <p>Urgence déclarée : <span className="font-semibold text-amber-600">{emergencyFlag}</span></p>
            <p>Priorité Aura : {urgency}</p>
            <p>Date présumée d'apparition : {onsetDate}</p>
            <p>Symptômes clés : {clinical.symptoms}</p>
          </div>
        </section>

        <section className="border border-slate-900 p-4 rounded-2xl space-y-4 text-[11px]">
          <p className="text-[10px] uppercase font-black tracking-tight text-slate-500">3. Contexte clinique et expositions</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold">Résumé clinique</p>
              <p className="text-sm leading-relaxed">{narrative}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold">Expositions</p>
              <p className="text-sm leading-relaxed">{exposures}</p>
              <p className="mt-3 text-xs uppercase text-slate-500 font-semibold">Instructions</p>
              <p className="text-sm leading-relaxed">{instructions}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-[10px]">
            <div className="rounded-2xl border border-slate-200 p-3 text-slate-600">
              <p className="font-bold text-slate-800">Gravité</p>
              <p>{clinical.severity || 'À préciser'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3 text-slate-600">
              <p className="font-bold text-slate-800">Hospitalisation</p>
              <p>{clinical.hospitalization || 'À préciser'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3 text-slate-600">
              <p className="font-bold text-slate-800">Déclaration requise</p>
              <p>{data.reportRequired ? 'Oui' : 'Non'}</p>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-4 text-[11px]">
          <div className="border border-slate-900 p-4 rounded-2xl space-y-1">
            <p className="text-[10px] uppercase font-black tracking-tight text-slate-500">4. Déclarant</p>
            <p className="font-bold">{reporter.fullName}</p>
            <p>Clinique : {reporter.clinicName}</p>
            <p>Licence : {reporter.licenseNumber}</p>
          </div>
          <div className="border border-slate-900 p-4 rounded-2xl space-y-1">
            <p className="text-[10px] uppercase font-black tracking-tight text-slate-500">5. Contact</p>
            <p>Téléphone : {reporter.phone}</p>
            <p>Courriel : {reporter.email}</p>
            <p>Référence session : {session.id}</p>
            <p>Date/heure de la déclaration : {new Date(data.timestamp).toLocaleString('fr-CA', { dateStyle: 'short', timeStyle: 'short' })}</p>
          </div>
        </section>

        <section className="border border-slate-900 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between text-[10px]">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">6. Signature</p>
            <p className="font-serif text-lg tracking-widest">{reporter.fullName}</p>
            <p className="text-[10px] text-slate-500">électronique • conforme Loi 25</p>
          </div>
          <div className="w-full md:w-48 border-t-2 border-slate-900 text-center pt-3 font-mono text-xs uppercase tracking-widest">
            Signature du déclarant
          </div>
        </section>
      </div>
    );
  };
"""

text = text.replace(old_block, replacement, 1)
path.write_text(text, encoding='utf-8')
