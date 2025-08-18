import SignInForm from './SignInForm';

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl"></div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Modern Header */}
        <header className="flex-shrink-0 pt-12 pb-8">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent mb-2">
                MSGC Transport
              </h1>
              <p className="text-slate-600 font-medium text-lg">
                Management System
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="w-full max-w-md">
            <SignInForm />
            {/* Signup Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-slate-600 mb-2">
                Need to create a new user?
              </p>
              <a
                href="/signup"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200 hover:underline"
              >
                Create New User Account
              </a>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 pb-6">
          <div className="text-center">
            <p className="text-sm text-slate-500">
              © 2025 MSGC Transport. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuthPage; 