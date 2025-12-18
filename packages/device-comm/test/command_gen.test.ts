import {
  generateCommand,
  IRawCommand,
  validateParams,
} from "../src/command_gen.ts";
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
  expect(validateParams(command.type, command.params)).toBe(true);
});

test("SetScale generation", function set_scale() {
  let command: IRawCommand = {
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

  command.params.resolution = 129;
  console.log(command.params.upperThreshold > 3300);
  expect(validateParams(command.type, command.params)).toBe(
    "Invalid resolution!",
  );
});

test("Request Measurement generation", function request_measurement() {
  const command: IRawCommand = {
    id: 1,
    type: "REQUEST_MEASUREMENT",
    params: {
      timestamp: Date.parse("2025-11-28T00:00:00Z") / 1000,
      continue_with_full_channel: true,
      header_packet: true,
    },
  };

  const expected = "070100E62869C011";
  const actual = generateCommand(command);

  expect(actual).toEqual(expected);

  command.params.continue_with_full_channel = 129;
  expect(validateParams(command.type, command.params)).toBe(
    "Invalid continue with full channel!",
  );
});

test("Request Selftest generation", function request_selftest() {
  const command: IRawCommand = {
    id: 1,
    type: "REQUEST_SELFTEST",
    params: {
      timestamp: Date.parse("2025-11-28T00:00:00Z") / 1000,
    },
  };

  const expected = "060100E62869000E";
  const actual = generateCommand(command);

  expect(actual).toEqual(expected);

  delete command.params.timestamp;
  expect(validateParams(command.type, command.params)).toBe(
    "Invalid timestamp!",
  );
});

test("Reset generation", function reset() {
  const command: IRawCommand = {
    id: 1,
    type: "RESET",
    params: {},
  };

  const expected = "0F01000000000005";
  const actual = generateCommand(command);

  expect(actual).toEqual(expected);
});

test("Restart generation", function restart() {
  const command: IRawCommand = {
    id: 1,
    type: "RESTART",
    params: {},
  };

  const expected = "0E01000000000004";
  const actual = generateCommand(command);

  expect(actual).toEqual(expected);
});

test("Save generation", function save() {
  const command: IRawCommand = {
    id: 1,
    type: "SAVE",
    params: {},
  };

  const expected = "AA01000000000005";
  const actual = generateCommand(command);

  expect(actual).toEqual(expected);
});

test("Stop generation", function stop() {
  const command: IRawCommand = {
    id: 1,
    type: "STOP",
    params: {},
  };

  const expected = "BB01000000000007";
  const actual = generateCommand(command);

  expect(actual).toEqual(expected);
});
