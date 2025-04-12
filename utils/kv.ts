import { Task } from "../types/task.ts";

/**
 * An instance of Deno's key-value store (`Deno.openKv()`), which provides
 * a simple and efficient way to store and retrieve data persistently.
 *
 * @see {@link https://deno.land/api?v=1.36.0&s=Deno.openKv | Deno.openKv Documentation}
 */
const kv = await Deno.openKv();

/**
 * Retrieves a list of tasks from the key-value store.
 *
 * This function asynchronously iterates over all entries in the key-value store
 * with a prefix of "tasks" and collects their values into an array.
 *
 * @returns {Promise<Task[]>} A promise that resolves to an array of tasks.
 */
export async function getTasks(): Promise<Task[]> {
  const entries = [];
  for await (const entry of kv.list<Task>({ prefix: ["tasks"] })) {
    entries.push(entry.value);
  }
  return entries;
}

/**
 * Adds a task to the key-value store.
 *
 * @param task - The task object to be added. It must include an `id` property
 *               that uniquely identifies the task.
 * @returns A promise that resolves when the task has been successfully added.
 */
export async function addTask(task: Task): Promise<void> {
  await kv.set(["tasks", task.id], task);
}

/**
 * Marks a task as completed in the key-value store.
 *
 * @param id - The unique identifier of the task to be marked as completed.
 * @returns A promise that resolves when the task is successfully updated.
 *
 * @remarks
 * This function retrieves the task from the key-value store using the provided `id`.
 * If the task exists, it updates the task's `completed` property to `true` and saves it back.
 *
 * @throws Will throw an error if the task cannot be retrieved or updated in the key-value store.
 */
export async function completeTask(id: string): Promise<void> {
  const key = ["tasks", id];
  const task = await kv.get<Task>(key);
  if (task.value) {
    await kv.set(key, { ...task.value, completed: true });
  }
}

/**
 * Deletes a task from the key-value store.
 *
 * @param id - The unique identifier of the task to be deleted.
 * @returns A promise that resolves when the task is successfully deleted.
 */
export async function deleteTask(id: string): Promise<void> {
  await kv.delete(["tasks", id]);
}
