const getHoursDiff = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(d2 - d1) / 36e5;
};

const formatDuration = (hours) => {
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
};

const processRepoStats = (rawData) => {
  const prs = rawData.repository.pullRequests.nodes;

  let totalMergeTimeHours = 0;
  let mergedPrCount = 0;
  let totalReviewTimeHours = 0;
  let reviewedPrCount = 0;
  
  const teamStats = {};
  const bottlenecks = [];
  
  const processedPRs = prs.map((pr) => {
    const createdAt = new Date(pr.createdAt);
    const now = pr.closedAt ? new Date(pr.closedAt) : new Date();
    const ageHours = getHoursDiff(createdAt, now);
    
    const authorName = pr.author?.login || "Unknown";
    if (!teamStats[authorName]) teamStats[authorName] = { opened: 0, reviewed: 0 };
    teamStats[authorName].opened += 1;

    const reviews = pr.reviews?.nodes || [];
    const firstReview = reviews[0];
    const latestReview = reviews[reviews.length - 1];

    reviews.forEach(r => {
      const reviewerName = r.author?.login;
      if (reviewerName && reviewerName !== authorName) {
        if (!teamStats[reviewerName]) teamStats[reviewerName] = { opened: 0, reviewed: 0 };
        teamStats[reviewerName].reviewed += 1;
      }
    });

    let timeToReview = null;
    if (firstReview) {
      timeToReview = getHoursDiff(createdAt, firstReview.submittedAt);
      totalReviewTimeHours += timeToReview;
      reviewedPrCount++;
    }

    if (pr.state === 'MERGED' && pr.mergedAt) {
      const mergeTime = getHoursDiff(createdAt, pr.mergedAt);
      totalMergeTimeHours += mergeTime;
      mergedPrCount++;
    }

    let bottleneckStatus = null;
    let bottleneckReason = null;

    if (pr.state === 'OPEN') {
      const ciStatus = pr.commits?.nodes[0]?.commit?.statusCheckRollup?.state;
      if (ciStatus === 'FAILURE' || ciStatus === 'ERROR') {
        bottleneckStatus = 'CI_FAILED';
        bottleneckReason = 'CI checks failed';
      } 
      else if (!latestReview) {
        if (ageHours > 24) {
          bottleneckStatus = 'WAITING_REVIEW';
          bottleneckReason = 'No reviews for > 24h';
        }
      } 
      else if (latestReview.state === 'CHANGES_REQUESTED') {
        bottleneckStatus = 'CHANGES_REQUESTED';
        bottleneckReason = 'Waiting for author updates';
      } 
      else if (latestReview.state === 'APPROVED') {
        if (ageHours - getHoursDiff(createdAt, latestReview.submittedAt) > 24) {
          bottleneckStatus = 'READY_TO_MERGE';
          bottleneckReason = 'Approved but not merged > 24h';
        }
      }
    }

    if (bottleneckStatus) {
      bottlenecks.push({
        number: pr.number,
        title: pr.title,
        author: authorName,
        url: pr.url || `https://github.com/${rawData.repository.owner}/${rawData.repository.name}/pull/${pr.number}`,
        createdAt: pr.createdAt,
        age: formatDuration(ageHours),
        ageHours: ageHours,
        status: bottleneckStatus,
        reason: bottleneckReason,
      });
    }

    return {
      number: pr.number,
      state: pr.state,
      ageHours
    };
  });

  const avgMergeTime = mergedPrCount > 0 ? (totalMergeTimeHours / mergedPrCount) : 0;
  const avgReviewTime = reviewedPrCount > 0 ? (totalReviewTimeHours / reviewedPrCount) : 0;

  let score = 100;
  if (avgReviewTime > 24) score -= 15;
  if (avgMergeTime > 48) score -= 15;

  const longRunningPrs = bottlenecks.filter(b => b.status === 'WAITING_REVIEW').length;
  score -= (longRunningPrs * 5);

  const ciFailures = bottlenecks.filter(b => b.status === 'CI_FAILED').length;
  score -= (ciFailures * 5);

  score = Math.max(0, Math.min(100, score));

  let healthLabel = 'Excellent';
  if (score < 80) healthLabel = 'Good';
  if (score < 60) healthLabel = 'Needs Attention';
  if (score < 40) healthLabel = 'Critical';

  const leaderboard = Object.entries(teamStats)
    .map(([user, stats]) => ({ user, ...stats }))
    .sort((a, b) => b.reviewed - a.reviewed)
    .slice(0, 5);

  return {
    repo: rawData.repository.name,
    health: {
      score: Math.round(score),
      label: healthLabel,
    },
    metrics: {
      avgMergeTimeHours: Math.round(avgMergeTime),
      avgReviewTimeHours: Math.round(avgReviewTime),
      openPrCount: prs.filter(p => p.state === 'OPEN').length,
      bottleneckCount: bottlenecks.length
    },
    bottlenecks,
    leaderboard
  };
};

module.exports = { processRepoStats };
