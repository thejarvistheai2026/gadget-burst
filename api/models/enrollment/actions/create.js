import { applyParams, save, ActionOptions } from "gadget-server";
import { preventCrossUserDataAccess } from "gadget-server/auth";

export const run = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossUserDataAccess(params, record);
  await save(record);
  
  // Update the burst's enrolled contact count
  if (record.burstId) {
    try {
      const burst = await api.burst.findOne(record.burstId);
      if (burst) {
        await api.burst.update(record.burstId, {
          numberOfEnrolledContacts: (burst.numberOfEnrolledContacts || 0) + 1
        });
      }
    } catch (error) {
      logger.error({ error, burstId: record.burstId }, 'Failed to update burst contact count');
    }
  }
};

export const options = {
  actionType: "create",
};
