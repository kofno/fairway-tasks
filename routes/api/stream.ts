import { Handlers } from "$fresh/server.ts";
import { SseEvent } from "../../types/task.ts";

/**
 * A set that holds `WritableStreamDefaultWriter` instances representing
 * connected clients. Each client in the set can be used to write data
 * to its respective writable stream.
 */
const clients = new Set<WritableStreamDefaultWriter>();

/**
 * Handles Server-Sent Events (SSE) for the GET request.
 *
 * This handler establishes a streaming connection with the client using the
 * `text/event-stream` content type. It sends periodic keep-alive messages
 * and allows other parts of the application to push data to connected clients.
 *
 * The connection is terminated when the client aborts the request.
 *
 * @property GET - Handles the GET request to establish an SSE connection.
 * @param req - The incoming request object.
 * @returns A `Response` object with a readable stream for SSE.
 *
 * Stream Details:
 * - Sends a keep-alive message (`:\n\n`) every 10 seconds.
 * - Allows other parts of the application to enqueue data to the stream.
 * - Cleans up resources (interval and client writer) when the request is aborted.
 */
export const handler: Handlers = {
  GET(req) {
    const body = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const keepAlive = setInterval(() => {
          controller.enqueue(encoder.encode(":\n\n")); // comment line = keep-alive
        }, 10000);

        const writer = new WritableStream({
          write: (chunk) => controller.enqueue(chunk),
        }).getWriter();
        clients.add(writer);

        req.signal.addEventListener("abort", () => {
          clearInterval(keepAlive);
          clients.delete(writer);
        });
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  },
};

/**
 * Broadcasts a message to all connected clients.
 *
 * This function takes an input `data`, serializes it to a JSON string,
 * and sends it to all clients currently connected via a writable stream.
 *
 * @param data - The data to be broadcasted to all clients. It must be an SseEvent.
 */
export function broadcast(data: SseEvent) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const writer of clients) {
    writer.write(new TextEncoder().encode(msg));
  }
}
