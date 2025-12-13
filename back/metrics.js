const determineStage = (pr) => {
    const reviews = pr.reviews.nodes;
    const latestReview = reviews.length > 0 ? reviews[reviews.length - 1] : null;
    const ciStatus = pr.commits.nodes[0]?.commit?.statusCheckRollup?.state;

    if (ciStatus === 'FAILURE' || ciStatus === 'ERROR') return 'CI_FAIL';
    if (ciStatus === 'PENDING') return 'WAITING_CI';
    
    if (!latestReview) return 'WAITING_REVIEW';     
    if (latestReview.state === 'CHANGES_REQUESTED') return 'WAITING_AUTHOR';
    if (latestReview.state === 'APPROVED') return 'READY_TO_MERGE';
    
    return 'WAITING_REVIEW';
};

module.exports = { determineStage };