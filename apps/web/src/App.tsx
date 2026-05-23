import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '@simulasi-gempa/ui';
import ScenarioSelectionPageContainer from './pages/ScenarioSelectionPageContainer';
import SimulationParameterPage from './pages/SimulationParameterPage';
import SimulationPlaybackPageContainer from './pages/SimulationPlaybackPageContainer';
import ImpactAnalysisPageContainer from './pages/ImpactAnalysisPageContainer';
import ReflectionMitigationPageContainer from './pages/ReflectionMitigationPageContainer';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/simulasi" element={<ScenarioSelectionPageContainer />} />
      <Route path="/simulasi/parameter" element={<SimulationParameterPage />} />
      <Route path="/simulasi/jalankan" element={<SimulationPlaybackPageContainer />} />
      <Route path="/simulasi/dampak" element={<ImpactAnalysisPageContainer />} />
      <Route path="/simulasi/refleksi" element={<ReflectionMitigationPageContainer />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}