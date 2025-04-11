import {
  boolean,
  createDecoderFromStructure,
  Decoder,
  InferType,
  safeStringify,
  string,
  stringLiteral,
} from "npm:jsonous";
import { err } from "npm:resulty";

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
type AddEvent = InferType<typeof sseAddEventDecoder>;

const sseCompleteEventDecoder = createDecoderFromStructure({
  type: stringLiteral("complete"),
  id: string,
});
type CompleteEvent = InferType<typeof sseCompleteEventDecoder>;

export type SseEvent = AddEvent | CompleteEvent;

export const sseEventDecoder = new Decoder<SseEvent>((value) => {
  const addResult = sseAddEventDecoder.decodeAny(value);
  if (addResult.isOk()) {
    return addResult;
  }
  const completeResult = sseCompleteEventDecoder.decodeAny(value);
  if (completeResult.isOk()) {
    return completeResult;
  }
  return err(`Invalid event: ${safeStringify(value)}`);
});
