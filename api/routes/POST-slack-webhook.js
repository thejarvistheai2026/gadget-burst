import { RouteHandler } from "gadget-server";

const route = async ({ request, reply }) => {
  await reply.type("application/json").send({ hello: "world" });
};

export default route;
