import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ERPProvider } from '@/context/ERPContext';

export function ERPLayout() {
  return (
    <ERPProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ERPProvider>
  );
}
