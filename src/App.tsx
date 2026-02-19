import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Landing from '@/pages/Landing';
import CourseViewer from '@/pages/CourseViewer';
import CourseManager from '@/pages/CourseManager';
import BundleManager from '@/pages/BundleManager';
import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Full layout with sidebar */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/course/:lessonId" element={<CourseViewer />} />
        <Route path="/manage" element={<CourseManager />} />
        <Route path="/bundles" element={<BundleManager />} />
      </Route>

      {/* Standalone pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}