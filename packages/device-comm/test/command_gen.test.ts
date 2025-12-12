import { generateCommand, IRawCommand } from "../src/command_gen.ts";
import { assert, expect, test } from "vitest";

test("SetDuration generation", function set_dur() {
  const command: IRawCommand = {
    id: 1,
    type: "SET_DURATION",
    params: {
      duration: 1000,
      mode: "MAX_HITS",
      okaying: false,
      breaktime: 10,
      repetitions: 5,
    },
  };

  const expected = "E0011603E8000A0F";
  const actual = generateCommand(command);

  expect(actual).toEqual(expected);
});

test("SetScale generation", function set_scale() {
  const command: IRawCommand = {
    id: 1,
    type: "SET_SCALE",
    params: {
      lowerThreshold: 186,
      upperThreshold: 3300,
      resolution: 128,
      sample: 3,
    },
  };

  const expected = "D0010E6FFF100318";
  const actual = generateCommand(command);

  expect(actual).toEqual(expected);
});
