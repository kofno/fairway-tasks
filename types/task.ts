import {
  boolean,
  createDecoderFromStructure,
  discriminatedUnion,
  InferType,
  string,
  stringLiteral,
} from "npm:jsonous@12.0.0";

const taskDecoder = createDecoderFromStructure({
  id: string,
  text: string,
  completed: boolean,
});
export type Task = InferType<typeof taskDecoder>;

const sseAddEventDecoder = createDecoderFromStructure({
  type: stringLiteral("add"),
  task: taskDecoder,
});

const sseCompleteEventDecoder = createDecoderFromStructure({
  type: stringLiteral("complete"),
  id: string,
});

const sseDeleteEventDecoder = createDecoderFromStructure({
  type: stringLiteral("delete"),
  id: string,
});

export const sseEventDecoder = discriminatedUnion("type", {
  add: sseAddEventDecoder,
  complete: sseCompleteEventDecoder,
  delete: sseDeleteEventDecoder,
});
export type SseEvent = InferType<typeof sseEventDecoder>;
