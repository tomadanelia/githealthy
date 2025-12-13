import React from "react";
import { useStore } from "../store/useStore";
const STATUS_CONFIG = {
  WAITING_REVIEW: {
    color: "bg-yellow-400",
    label: "Waiting for review",
    icon: "🟡",
  },
  CHANGES_REQUESTED: {
    color: "bg-blue-400",
    label: "Changes requested",
    icon: "🔵",
  },
  CI_FAILED: {
    color: "bg-red-400",
    label: "CI failed",
    icon: "🔴",
  },
  READY_TO_MERGE: {
    color: "bg-yellow-400",
    label: "Ready to merge",
    icon: "🟡",
  },
};

function PRRow({ pr }) {
  const { expandedPrNumber, toggleExpandedPr } = useStore();
  const isExpanded = expandedPrNumber === pr.number;
  const config = STATUS_CONFIG[pr.status] || {
    color: "bg-gray-400",
    label: "Unknown",
    icon: "⚪",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition">
      <button
        onClick={() => toggleExpandedPr(pr.number)}
        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition text-left"
      >
        <span className="text-2xl">{config.icon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono text-gray-500">#{pr.number}</span>
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {pr.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${config.color} transition-all`}
                style={{ width: "75%" }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              Age: {pr.age}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">{config.label}</span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">
                Timeline
              </h4>
              <div className="relative">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-300"></div>
                
                <div className="space-y-3 relative">
                  <TimelineEvent
                    icon="🟢"
                    label="Created"
                    date={new Date(pr.createdAt).toLocaleDateString()}
                    time={new Date(pr.createdAt).toLocaleTimeString()}
                  />
                  <TimelineEvent
                    icon={config.icon}
                    label={config.label}
                    date="Now"
                    highlight
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-600">
                  Author: <span className="font-medium">{pr.author}</span>
                </p>
              </div>
              <a
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View on GitHub →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineEvent({ icon, label, date, time, highlight }) {
  return (
    <div className="flex items-start gap-3 pl-1">
      <div
        className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs ${
          highlight ? "bg-white ring-2 ring-blue-400" : "bg-white"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 pb-1">
        <p className={`text-sm ${highlight ? "font-semibold text-gray-900" : "text-gray-700"}`}>
          {label}
        </p>
        <p className="text-xs text-gray-500">
          {date} {time && `at ${time}`}
        </p>
      </div>
    </div>
  );
}

function PRList({ bottlenecks }) {
  if (!bottlenecks || bottlenecks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No Bottlenecks Found!
        </h3>
        <p className="text-sm text-gray-600">
          All PRs are moving smoothly through the pipeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          PR Bottlenecks ({bottlenecks.length})
        </h2>
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <span>🟡</span> Waiting
          </span>
          <span className="flex items-center gap-1">
            <span>🔵</span> Changes
          </span>
          <span className="flex items-center gap-1">
            <span>🔴</span> Failed
          </span>
          <span className="flex items-center gap-1">
            <span>🟢</span> Healthy
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        {bottlenecks.map((pr) => (
          <PRRow key={pr.number} pr={pr} />
        ))}
      </div>
    </div>
  );
}

export default PRList;