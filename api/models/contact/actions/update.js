import { applyParams, save, ActionOptions } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api }) => {
  await preventCrossUserDataAccess(params, record);
  
  const previousStatus = record.status;
  applyParams(params, record);
  await save(record);
  
  // If status changed to 'Replied', remove from all bursts
  if (previousStatus !== 'Replied' && record.status === 'Replied') {
    logger.info({ contactId: record.id }, 'Contact marked as replied - removing from bursts');
    
    try {
      const enrollments = await api.enrollment.findMany({
        filter: { contactId: { equals: record.id } },
        select: { id: true }
      });
      
      for (const enrollment of enrollments) {
        await api.enrollment.delete(enrollment.id);
        logger.info({ enrollmentId: enrollment.id }, 'Enrollment deleted due to contact reply');
      }
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to remove contact from bursts');
    }
  }
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
};
