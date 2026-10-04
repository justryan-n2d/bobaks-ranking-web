/** Cloudflare Worker entry point that delegates to vinext. */
import type { ExecutionContext, Fetcher } from "@cloudflare/workers-types";
import handler from "vinext/server/fetch-handler";

interface Env {
  ASSETS: Fetcher;
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return handler.fetch(request, env, ctx);
  },
};
