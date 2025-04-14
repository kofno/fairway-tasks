import { useEffect, useRef, useState } from "preact/hooks";
import { sseEventDecoder, Task } from "../types/task.ts";

export default function TaskInput({ initial }: { initial: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initial);
  const inputRef = useRef<HTMLInputElement>(null);

  function add(text: string) {
    fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  function complete(id: string) {
    fetch("/api/tasks", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    });
  }

  function remove(id: string) {
    fetch(`/api/tasks?id=${id}`, {
      method: "DELETE",
    });
  }

  useEffect(() => {
    const sse = new EventSource("/api/stream");
    sse.onmessage = (msg) => {
      sseEventDecoder.decodeJson(msg.data).cata({
        Ok: (event) => {
          if (event.type === "add") {
            setTasks((prev) => [...prev, event.task]);
          } else if (event.type === "complete") {
            setTasks((prev) =>
              prev.map((t) => t.id === event.id ? { ...t, completed: true } : t)
            );
          } else if (event.type === "delete") {
            setTasks((prev) => prev.filter((t) => t.id !== event.id));
          }
        },
        Err: (err) => {
          console.error(err);
        },
      });
    };
    return () => sse.close();
  }, []);

  return (
    <div class="space-y-4 mt-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = inputRef.current?.value.trim();
          if (value) {
            add(value);
            inputRef.current!.value = "";
          }
        }}
        class="flex gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Add a task..."
          class="border px-2 py-1 rounded flex-1"
        />
        <button type="submit" class="bg-green-600 text-white px-3 py-1 rounded">
          Add
        </button>
      </form>

      <ul class="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            class={`p-2 rounded border flex justify-between items-center ${
              task.completed ? "text-gray-500" : ""
            }`}
          >
            <span class={task.completed ? "line-through" : ""}>
              {task.text}
            </span>
            {!task.completed && (
              <button
                type="button"
                onClick={() => complete(task.id)}
                class="text-xs text-blue-600"
                alt="Complete"
              >
                ✅ Complete
              </button>
            )}
            {task.completed && (
              <button
                type="button"
                onClick={() => remove(task.id)}
                class="text-xs text-red-600"
                alt="Delete"
              >
                🗑️ Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
