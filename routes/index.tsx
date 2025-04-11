import { Handlers, PageProps } from "$fresh/server.ts";
import TaskInput from "../islands/TaskInput.tsx";
import { getTasks } from "../utils/kv.ts";
import { Task } from "../types/task.ts";

type Data = {
  tasks: Task[];
};

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const tasks = await getTasks();
    return ctx.render({ tasks });
  },
};

export default function Home({ data }: PageProps<Data>) {
  return (
    <main class="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 class="text-3xl font-bold text-green-800">Fairway Tasks</h1>
      <p class="text-gray-600">
        A collaborative to-do list powered by Deno, Fresh, KV store, and SSE.
      </p>
      <TaskInput initial={data.tasks} />
    </main>
  );
}
