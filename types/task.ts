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

const sseDeleteEventDecoder = createDecoderFromStructure({
  type: stringLiteral("delete"),
  id: string,
});
type DeleteEvent = InferType<typeof sseDeleteEventDecoder>;

export type SseEvent = AddEvent | CompleteEvent | DeleteEvent;

export const sseEventDecoder = new Decoder<SseEvent>((value) => {
  const addResult = sseAddEventDecoder.decodeAny(value);
  if (addResult.isOk()) {
    return addResult;
  }
  const completeResult = sseCompleteEventDecoder.decodeAny(value);
  if (completeResult.isOk()) {
    return completeResult;
  }
  const deleteResult = sseDeleteEventDecoder.decodeAny(value);
  if (deleteResult.isOk()) {
    return deleteResult;
  }
  // If none of the decoders succeeded, return an error
  return err(`Invalid event: ${safeStringify(value)}`);
});
