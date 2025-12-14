import React, { useState, useEffect } from "react";

function RepoInput({ onAnalyze, isLoading, error, defaultOwner, defaultRepo }) {
  const [owner, setOwner] = useState(defaultOwner || "");
  const [repo, setRepo] = useState(defaultRepo || "");

  useEffect(() => {
    if (defaultOwner) setOwner(defaultOwner);
    if (defaultRepo) setRepo(defaultRepo);
  }, [defaultOwner, defaultRepo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze(owner, repo);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Analyze Repository
      </h2>
 
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="owner"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Repository Owner
          </label>
          <input
            id="owner"
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="e.g., golang"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="repo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Repository Name
          </label>
          <input
            id="repo"
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="e.g., mobile"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {isLoading ? "Analyzing..." : "Analyze Public Repo"}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {isLoading ? "Analyzing..." : "Analyze Private"}
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Popular ones:</p>
        <div className="flex flex-wrap gap-2 ">
          {[
            { owner: "facebook", repo: "react" },
            { owner: "ocaml", repo: "ocaml" },
            { owner: "vercel", repo: "next.js" },
          ].map((example) => (
            <button
              key={`${example.owner}/${example.repo}`}
              onClick={() => {
                setOwner(example.owner);
                setRepo(example.repo);
              }}
              className="text-xs text-gray-800 px-2 py-1 bg-yellow-100 hover:bg-green-200 rounded text-gray-700 transition"
              disabled={isLoading}
            >
              {example.owner}/{example.repo}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RepoInput;