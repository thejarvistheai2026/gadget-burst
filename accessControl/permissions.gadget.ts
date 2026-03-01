import type { GadgetPermissions } from "gadget-server";

/**
 * This metadata describes the access control configuration available in your application.
 * Grants that are not defined here are set to false by default.
 *
 * View and edit your roles and permissions in the Gadget editor at https://burst.gadget.app/edit/settings/permissions
 */
export const permissions: GadgetPermissions = {
  type: "gadget/permissions/v1",
  roles: {
    "signed-in": {
      storageKey: "signed-in",
      default: {
        read: true,
        action: true,
      },
      models: {
        burst: {
          read: {
            filter:
              "accessControl/filters/burst/signed-in-read.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        contact: {
          read: {
            filter:
              "accessControl/filters/contact/signed-in-read.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        emailTemplate: {
          read: {
            filter:
              "accessControl/filters/emailTemplate/signed-in-read.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        enrollment: {
          read: {
            filter:
              "accessControl/filters/enrollment/signed-in-read.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        sentEmail: {
          read: {
            filter:
              "accessControl/filters/sentEmail/signed-in-read.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        user: {
          read: {
            filter: "accessControl/filters/user/tenant.gelly",
          },
          actions: {
            changePassword: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
            signOut: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
            update: {
              filter: "accessControl/filters/user/tenant.gelly",
            },
          },
        },
        userSettings: {
          read: {
            filter:
              "accessControl/filters/userSettings/signed-in-read.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        churnEvent: {
          read: {
            filter: "accessControl/filters/churnEvent/signed-in-read.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        churnTemplate: {
          read: {
            filter: "accessControl/filters/churnTemplate/signed-in-read.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
      },
      actions: {
        checkForReplies: true,
        fixEnrollmentCounts: true,
        receiveChurnWebhook: true,
      },
    },
    unauthenticated: {
      storageKey: "unauthenticated",
      models: {
        user: {
          actions: {
            resetPassword: true,
            sendResetPassword: true,
            sendVerifyEmail: true,
            signIn: true,
            signUp: true,
            verifyEmail: true,
          },
        },
      },
    },
  },
};
