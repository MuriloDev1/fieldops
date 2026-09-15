import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout = () => {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="main-panel">
        <Topbar />
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};
