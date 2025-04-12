import { Handlers } from "$fresh/server.ts";
import { Task } from "../../types/task.ts";
import { addTask, completeTask, deleteTask, getTasks } from "../../utils/kv.ts";
import { broadcast } from "./stream.ts";

export const handler: Handlers = {
  async GET(_req) {
    const tasks = await getTasks();
    return new Response(JSON.stringify(tasks), {
      headers: { "Content-Type": "application/json" },
    });
  },

  async POST(req) {
    const body = await req.json();
    const task: Task = {
      id: crypto.randomUUID(),
      text: body.text ?? "",
      completed: false,
    };

    await addTask(task);
    broadcast({ type: "add", task });

    return new Response(JSON.stringify(task), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    });
  },

  async PATCH(req) {
    const body = await req.json();
    const id = body.id;
    if (!id) {
      return new Response("Missing ID", { status: 400 });
    }

    await completeTask(id);
    broadcast({ type: "complete", id });

    return new Response(null, { status: 204 });
  },

  async DELETE(req) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response("Missing ID", { status: 400 });
    }
    await deleteTask(id);
    broadcast({ type: "delete", id });

    return new Response(null, { status: 204 });
  },
};
