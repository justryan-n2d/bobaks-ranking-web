import handler from "vinext/server/app-router-entry";
import type { ExecutionContext } from "@cloudflare/workers-types";

type HeadElement = {
  append(content: string, options: { html: true }): unknown;
};

type HTMLRewriterInstance = {
  on(
    selector: string,
    handler: { element(element: HeadElement): void },
  ): HTMLRewriterInstance;
  transform(response: Response): Response;
};

declare const HTMLRewriter: new () => HTMLRewriterInstance;

const GOOGLE_VERIFICATION_TAG =
  '<meta name="google-site-verification" content="sUJWU9x32VR0FEnIqkOXVa76kUGKqjTllt-_0ZLiSOA">';

interface WorkerEnv {
  BOBAKS_DEPLOYMENT_ENV?: string;
  ASSETS?: {
    fetch(request: Request): Promise<Response> | Response;
  };
}

export default {
  async fetch(
    request: Request,
    env: WorkerEnv,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const response = await handler.fetch(request, env, ctx);
    const url = new URL(request.url);
    const contentType = response.headers.get("content-type") ?? "";

    if (
      request.method === "GET" &&
      url.pathname === "/" &&
      env.BOBAKS_DEPLOYMENT_ENV !== "preview" &&
      response.status === 200 &&
      contentType.toLowerCase().includes("text/html")
    ) {
      return new HTMLRewriter()
        .on("head", {
          element(element) {
            element.append(GOOGLE_VERIFICATION_TAG, { html: true });
          },
        })
        .transform(response);
    }

    return response;
  },
};
