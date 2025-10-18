import React, { useState, useCallback } from 'react';
import type { PersonaProfile, ImageAnalysis } from '../types';
import { questionnaireQuestions } from '../constants';
import { analyzeImagesForPersona, generateFinalPersona, fileToDataUrl } from '../services/geminiService';
import Spinner from './Spinner';

interface OnboardingProps {
  onPersonaCreated: (persona: PersonaProfile) => void;
}

const PhotoUploadStep: React.FC<{ onNext: (files: File[], analysis: ImageAnalysis, avatarUrl: string) => void }> = ({ onNext }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files).slice(0, 5);
      setFiles(selectedFiles);
      const newPreviews = selectedFiles.map((file: File) => URL.createObjectURL(file));
      setPreviews(newPreviews);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Please upload at least one photo.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const analysis = await analyzeImagesForPersona(files);
      const avatarDataUrl = await fileToDataUrl(files[0]);
      onNext(files, analysis, avatarDataUrl);
    } catch (e) {
      setError('Could not analyze images. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">Step 1: Share Your Vibe</h2>
      <p className="text-slate-400 mb-6">Upload 1-5 photos. Our AI will analyze your style and interests.</p>
      <div className="mb-4">
        <label htmlFor="photo-upload" className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          Select Photos
        </label>
        <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          {previews.map((src, index) => <img key={index} src={src} className="w-full h-32 object-cover rounded-lg" alt={`Preview ${index}`} />)}
        </div>
      )}
      {isLoading ? <Spinner text="Analyzing your essence..." /> : <button onClick={handleSubmit} disabled={files.length === 0} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-slate-500">Next Step</button>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

const QuestionnaireStep: React.FC<{ onNext: (answers: Record<string, string>) => void }> = ({ onNext }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleInputChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = () => {
    onNext(answers);
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">Step 2: A Few Quick Questions</h2>
      <p className="text-slate-400 mb-6">This helps us understand your preferences.</p>
      <div className="space-y-6 text-left">
        {questionnaireQuestions.map(q => (
          <div key={q.id}>
            <label className="block text-slate-300 font-semibold mb-2">{q.text}</label>
            {q.options ? (
              <select onChange={(e) => handleInputChange(q.id, e.target.value)} defaultValue="" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 focus:ring-rose-500 focus:border-rose-500">
                <option value="" disabled>Select an option</option>
                {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input type="text" onChange={(e) => handleInputChange(q.id, e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 focus:ring-rose-500 focus:border-rose-500" />
            )}
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} className="w-full mt-8 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">Next Step</button>
    </div>
  );
};


const ProfileTextStep: React.FC<{ onSubmit: (bio: string, name: string, age: number) => void, structuredAnalysis: ImageAnalysis }> = ({ onSubmit, structuredAnalysis }) => {
    const [bio, setBio] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState<number | ''>('');

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Step 3: Tell Us About You</h2>
            <p className="text-slate-400 mb-6">Our AI has crafted a starting point from your photos. Add your own voice!</p>
            <div className="bg-slate-800 p-4 rounded-lg mb-6 border border-slate-700 text-left space-y-3">
                <h3 className="font-bold text-slate-300 text-center text-lg mb-3">AI Photo Analysis</h3>
                <div>
                  <h4 className="font-semibold text-rose-400">Vibe:</h4>
                  <p className="text-slate-300">{structuredAnalysis.vibe}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-rose-400">Fashion Sense:</h4>
                  <p className="text-slate-300">{structuredAnalysis.fashionSense}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-rose-400">Potential Interests:</h4>
                  <ul className="list-disc list-inside text-slate-300">
                      {structuredAnalysis.potentialInterests.map((interest, i) => <li key={i}>{interest}</li>)}
                  </ul>
                </div>
                 <div className="pt-3 mt-2 border-t border-slate-700">
                  <p className="text-slate-400 italic">"{structuredAnalysis.summary}"</p>
                </div>
            </div>
            <div className="space-y-4 text-left">
                <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3" />
                <input type="number" placeholder="Your Age" value={age} onChange={e => setAge(parseInt(e.target.value) || '')} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3" />
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Add your own bio or anything else you'd like to share..." rows={5} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3"></textarea>
            </div>
            <button onClick={() => onSubmit(bio, name, age as number)} className="w-full mt-8 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">Create My Persona</button>
        </div>
    );
};


const Onboarding: React.FC<OnboardingProps> = ({ onPersonaCreated }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<Partial<PersonaProfile>>({});

  const handlePhotoStep = (files: File[], analysis: ImageAnalysis, avatarUrl: string) => {
    setProfileData(prev => ({ 
        ...prev, 
        imageAnalysis: analysis.summary, 
        structuredImageAnalysis: analysis,
        avatarUrl 
    }));
    setStep(2);
  };

  const handleQuizStep = (answers: Record<string, string>) => {
    setProfileData(prev => ({ ...prev, quizAnswers: answers }));
    setStep(3);
  };
  
  const handleFinalStep = async (bio: string, name: string, age: number) => {
    setIsLoading(true);
    const fullData = { ...profileData, bio, name, age };
    const finalPersonaText = await generateFinalPersona(name, age, fullData.imageAnalysis!, fullData.quizAnswers!, bio);
    onPersonaCreated({ ...fullData, finalPersona: finalPersonaText } as PersonaProfile);
    setIsLoading(false);
  };


  const renderStep = () => {
    if (isLoading) return <Spinner text="Crafting your unique persona..." />;
    switch (step) {
      case 1:
        return <PhotoUploadStep onNext={handlePhotoStep} />;
      case 2:
        return <QuestionnaireStep onNext={handleQuizStep} />;
      case 3:
        return <ProfileTextStep onSubmit={handleFinalStep} structuredAnalysis={profileData.structuredImageAnalysis!} />;
      default:
        return <PhotoUploadStep onNext={handlePhotoStep} />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700">
        {renderStep()}
    </div>
  );
};

export default Onboarding;