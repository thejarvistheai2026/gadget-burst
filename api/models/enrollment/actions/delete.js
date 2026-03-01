import { deleteRecord, ActionOptions } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api }) => {
  await preventCrossUserDataAccess(params, record);
  
  const burstId = record.burstId;
  
  await deleteRecord(record);
  
  if (burstId) {
    try {
      const burst = await api.burst.findOne(burstId);
      if (burst) {
        await api.burst.update(burstId, {
          numberOfEnrolledContacts: Math.max(0, (burst.numberOfEnrolledContacts || 0) - 1)
        });
      }
    } catch (error) {
      logger.error({ error, burstId }, 'Failed to decrement enrollment count');
    }
  }
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
