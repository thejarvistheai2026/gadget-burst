import { ActionOptions } from "gadget-server";

/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
  logger.info("Starting enrollment count fix for all bursts");
  
  let totalBurstsProcessed = 0;
  let totalBurstsUpdated = 0;
  
  // Fetch all bursts with pagination
  let hasMore = true;
  let cursor = undefined;
  
  while (hasMore) {
    const bursts = await api.burst.findMany({
      first: 250,
      after: cursor,
      select: {
        id: true,
        name: true,
        numberOfEnrolledContacts: true
      }
    });
    
    for (const burst of bursts) {
      totalBurstsProcessed++;
      
      // Count actual enrollments for this burst
      let enrollmentCount = 0;
      let hasMoreEnrollments = true;
      let enrollmentCursor = undefined;
      
      while (hasMoreEnrollments) {
        const enrollments = await api.enrollment.findMany({
          first: 250,
          after: enrollmentCursor,
          filter: {
            burstId: { equals: burst.id }
          },
          select: {
            id: true
          }
        });
        
        enrollmentCount += enrollments.length;
        
        if (enrollments.hasNextPage) {
          enrollmentCursor = enrollments.endCursor;
        } else {
          hasMoreEnrollments = false;
        }
      }
      
      // Update if counts don't match
      if (burst.numberOfEnrolledContacts !== enrollmentCount) {
        await api.burst.update(burst.id, {
          numberOfEnrolledContacts: enrollmentCount
        });
        
        logger.info(`Updated burst "${burst.name}" (${burst.id}): ${burst.numberOfEnrolledContacts} -> ${enrollmentCount}`);
        totalBurstsUpdated++;
      }
    }
    
    if (bursts.hasNextPage) {
      cursor = bursts.endCursor;
    } else {
      hasMore = false;
    }
  }
  
  const summary = {
    totalBurstsProcessed,
    totalBurstsUpdated
  };
  
  logger.info("Enrollment count fix completed", summary);
  
  return summary;
};

/** @type { ActionOptions } */
export const options = {
  triggers: {
    api: true
  }
};
