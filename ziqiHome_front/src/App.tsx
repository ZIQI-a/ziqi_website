import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { BlogPage } from "./pages/BlogPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { LatestPage } from "./pages/LatestPage";
import { ProjectsPage } from "./pages/ProjectsPage";

const AdminLayout = lazy(async () => {
  const module = await import("./components/AdminLayout");
  return { default: module.AdminLayout };
});

const AdminHomePage = lazy(async () => {
  const module = await import("./pages/AdminHomePage");
  return { default: module.AdminHomePage };
});

const AdminBlogsPage = lazy(async () => {
  const module = await import("./pages/AdminBlogsPage");
  return { default: module.AdminBlogsPage };
});

const AdminProjectsPage = lazy(async () => {
  const module = await import("./pages/AdminProjectsPage");
  return { default: module.AdminProjectsPage };
});

const AdminContactLinksPage = lazy(async () => {
  const module = await import("./pages/AdminContactLinksPage");
  return { default: module.AdminContactLinksPage };
});

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/latest" element={<LatestPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <Suspense fallback={null}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={null}>
              <AdminHomePage />
            </Suspense>
          }
        />
        <Route
          path="blogs"
          element={
            <Suspense fallback={null}>
              <AdminBlogsPage />
            </Suspense>
          }
        />
        <Route
          path="projects"
          element={
            <Suspense fallback={null}>
              <AdminProjectsPage />
            </Suspense>
          }
        />
        <Route
          path="contact-links"
          element={
            <Suspense fallback={null}>
              <AdminContactLinksPage />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
