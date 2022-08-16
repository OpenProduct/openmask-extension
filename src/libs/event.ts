// export type EventMessage = {
//   method: Property in keyof Methods;
//   id?: number;
//   params: Methods[Property];
// }

export type Event<Key extends string, Payload = void> = {
  id?: number;
  method: Key;
  params: Payload;
};

export type EventMessage =
  | ResponseMessage
  | Event<"isLock">
  | Event<"tryToUnlock", string>
  | Event<"unlock">
  | Event<"lock">
  | Event<"locked">
  | Event<"getPassword">
  | Event<"setPassword", string>;

export type ResponseMessage<Payload = void> = {
  method: "Response";
  id?: number;
  params?: Payload;
};

export const toResponseMessage = <Payload>(
  id?: number,
  params?: Payload
): ResponseMessage<Payload> => ({
  method: "Response",
  id,
  params,
});
