import { Task } from "../types/task.ts";

type Props = {
  tasks: Task[];
};

export default function TaskList({ tasks }: Props) {
  return (
    <ul class="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          class={`p-2 rounded border ${
            task.completed ? "line-through text-gray-500" : ""
          }`}
        >
          {task.text}
        </li>
      ))}
    </ul>
  );
}
