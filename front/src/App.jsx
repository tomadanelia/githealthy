import React, { useState, useEffect } from "react";
import { useStore } from "./store/useStore";
import RepoInput from "./components/RepoInput";
import PRList from "./components/PRList";
import HealthMetrics from "./components/HealthMetrics";
import './index.css';

function AuthButton() {
  const { user, logout } = useStore();
  
  if (user) {
    return (
      <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
        <img src={user.avatar_url} className="w-6 h-6 rounded-full" alt="" />
        <span className="text-sm font-semibold text-gray-700">{user.username}</span>
        <button onClick={logout} className="text-xs text-red-600 hover:text-red-800 font-medium ml-2">
          Sign Out
        </button>
      </div>
    );
  }
  return (
    <a
      href="https://flowcheck-nd7a.onrender.com/auth/github"
      className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      Login with GitHub
    </a>
  );
}

function App() {
  const {
    repoInfo,
    dashboardData,
    isLoading,
    error,
    fetchDashboardData,
    reset,
    checkSession,
    user
  } = useStore();

  const [inputError, setInputError] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const handleAnalyze = async (owner, repo) => {
    setInputError(null);
    if (!owner?.trim() || !repo?.trim()) {
      setInputError("Please enter both owner and repository name");
      return;
    }
    try {
      await fetchDashboardData(owner, repo);
    } catch (err) {
      setInputError(err.message);
    }
  };

  const handleReset = () => {
    reset();
    setInputError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <h1 className="text-2xl font-bold text-gray-900">
                GitHub PR Analyzer
              </h1>
              {dashboardData && (
                <button
                  onClick={handleReset}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Analyze another
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!dashboardData ? (
          <div className="max-w-md mx-auto mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 text-center border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Analyze Workflow Health
              </h2>
              <p className="text-gray-600 text-sm">
                Login to analyze <strong>Private Repositories</strong>, or just enter a public repo below.
              </p>
            </div>
             <RepoInput
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              error={inputError || error}
              defaultOwner={repoInfo?.owner}
              defaultRepo={repoInfo?.repo}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <HealthMetrics data={dashboardData} />
            <PRList bottlenecks={dashboardData.bottlenecks} />
          </div>
        )}
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="flex flex-col">
              <span className="text-gray-900 font-medium">Analyzing Repository...</span>
              <span className="text-xs text-gray-500">Fetching PRs, Reviews & CI Status</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;