import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PublicLayout, DashboardLayout } from './layouts/Layouts';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SearchPage from './pages/SearchPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyCoursesPage from './pages/student/MyCoursesPage';
import CoursePlayerPage from './pages/student/CoursePlayerPage';
import WishlistPage from './pages/student/WishlistPage';
import CertificatesPage from './pages/student/CertificatesPage';
import QuizPage from './pages/student/QuizPage';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCoursesPage from './pages/instructor/InstructorCoursesPage';
import CourseFormPage from './pages/instructor/CourseFormPage';
import InstructorAnalyticsPage from './pages/instructor/InstructorAnalyticsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminApprovalsPage from './pages/admin/AdminApprovalsPage';

// Common Pages
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

// Route Guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* ── Public Routes (Navbar + Footer) ── */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/search" element={<SearchPage />} />
            </Route>

            {/* ── Protected Dashboard Routes ── */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

              {/* Common */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* ── Student ── */}
              <Route path="/student/dashboard" element={
                <ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>
              } />
              <Route path="/my-courses" element={
                <ProtectedRoute allowedRoles={['STUDENT']}><MyCoursesPage /></ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute allowedRoles={['STUDENT']}><WishlistPage /></ProtectedRoute>
              } />
              <Route path="/certificates" element={
                <ProtectedRoute allowedRoles={['STUDENT']}><CertificatesPage /></ProtectedRoute>
              } />
              <Route path="/quizzes/:id" element={
                <ProtectedRoute allowedRoles={['STUDENT']}><QuizPage /></ProtectedRoute>
              } />
              <Route path="/lessons/:id/watch" element={
                <ProtectedRoute><CoursePlayerPage /></ProtectedRoute>
              } />

              {/* ── Instructor ── */}
              <Route path="/instructor/dashboard" element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR']}><InstructorDashboard /></ProtectedRoute>
              } />
              <Route path="/instructor/courses" element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR']}><InstructorCoursesPage /></ProtectedRoute>
              } />
              <Route path="/instructor/courses/new" element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR']}><CourseFormPage /></ProtectedRoute>
              } />
              <Route path="/instructor/courses/:id/edit" element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR']}><CourseFormPage /></ProtectedRoute>
              } />
              <Route path="/instructor/analytics" element={
                <ProtectedRoute allowedRoles={['INSTRUCTOR']}><InstructorAnalyticsPage /></ProtectedRoute>
              } />

              {/* ── Admin ── */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>
              } />
              <Route path="/admin/approvals" element={
                <ProtectedRoute allowedRoles={['ADMIN']}><AdminApprovalsPage /></ProtectedRoute>
              } />

            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
