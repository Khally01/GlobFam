import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-gradient rounded-full mb-4">
            <span className="text-3xl">🌍</span>
          </div>
          <h1 className="text-3xl font-bold bg-primary-gradient bg-clip-text text-transparent">
            GlobFam
          </h1>
          <p className="text-neutral-gray mt-2">Global Families, Local Wisdom</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}