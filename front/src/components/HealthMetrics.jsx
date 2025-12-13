import React from "react";

function HealthMetrics({ data }) {
  const { health, metrics } = data;

  const getHealthColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    if (score >= 40) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getHealthRing = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Health Score */}
        <div className="md:col-span-1 flex flex-col items-center justify-center">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(health.score / 100) * 251.2} 251.2`}
                className={getHealthRing(health.score)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {health.score}
              </span>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p
              className={`text-sm font-semibold px-3 py-1 rounded-full ${getHealthColor(
                health.score
              )}`}
            >
              {health.label}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Avg Review Time"
            value={`${metrics.avgReviewTimeHours}h`}
            subtitle="Time to first review"
            icon="👀"
            warning={metrics.avgReviewTimeHours > 24}
          />
          <MetricCard
            label="Avg Merge Time"
            value={`${metrics.avgMergeTimeHours}h`}
            subtitle="Created to merged"
            icon="🔀"
            warning={metrics.avgMergeTimeHours > 48}
          />
          <MetricCard
            label="Open PRs"
            value={metrics.openPrCount}
            subtitle="Currently open"
            icon="📋"
          />
          <MetricCard
            label="Bottlenecks"
            value={metrics.bottleneckCount}
            subtitle="Need attention"
            icon="⚠️"
            warning={metrics.bottleneckCount > 0}
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtitle, icon, warning }) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        warning
          ? "bg-yellow-50 border-yellow-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {warning && (
          <span className="text-yellow-600 text-xs font-medium">⚠️</span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs font-medium text-gray-700 mb-1">{label}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

export default HealthMetrics;