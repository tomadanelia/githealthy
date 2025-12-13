import React, { useState, useEffect } from "react";
import { useStore } from "./store/useStore";
import RepoInput from "./components/RepoInput";
import PRList from "./components/PRList";
import HealthMetrics from "./components/HealthMetrics";
import './index.css';

function App() {
  const {
    repoInfo,
    dashboardData,
    isLoading,
    error,
    fetchDashboardData,
    reset,
  } = useStore();

  const [inputError, setInputError] = useState(null);

  useEffect(() => {
    if (repoInfo && !dashboardData) {
      handleAnalyze(repoInfo.owner, repoInfo.repo);
    }
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                GitHub PR Analyzer
              </h1>
              {repoInfo && (
                <p className="text-sm text-gray-600 mt-1">
                  {repoInfo.owner}/{repoInfo.repo}
                </p>
              )}
            </div>
            {dashboardData && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Analyze Different Repo
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!dashboardData ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Understand Your PR Workflow
              </h2>
              <p className="text-sm text-gray-600">
                Visualize where PRs get stuck, how long reviews take, and overall team delivery health.
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
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">
              Analyzing repository...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;