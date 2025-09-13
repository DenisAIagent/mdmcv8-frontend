import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              MDMC Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestion des campagnes publicitaires musicales
            </p>
          </div>
          <div className="mt-8">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-mdmc-red to-red-700 flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-4xl font-bold mb-4">MDMC Music Ads</h2>
            <p className="text-xl opacity-90">Dashboard de performance</p>
          </div>
        </div>
      </div>
    </div>
  );
}