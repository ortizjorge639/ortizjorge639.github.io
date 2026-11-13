import test from 'node:test';
import assert from 'node:assert/strict';
import { StoryClock } from '../src/story-clock.ts';

test('story clock starts paused, advances exactly, and holds the final frame', () => {
  const clock = new StoryClock([8, 9, 7]);
  clock.advance(4);
  assert.equal(clock.position().time, 0);
  clock.play();
  clock.advance(8);
  assert.deepEqual(clock.position(), { time: 8, total: 24, index: 1, offset: 0, playing: true });
  clock.advance(30);
  assert.deepEqual(clock.position(), { time: 24, total: 24, index: 2, offset: 7, playing: false });
  clock.play();
  assert.equal(clock.position().time, 0);
});

test('seeking and manual scene changes are bounded and pause playback', () => {
  const clock = new StoryClock([8, 9, 7]);
  clock.play(); clock.goTo(1);
  assert.equal(clock.position().time, 8);
  assert.equal(clock.position().playing, false);
  clock.seek(10.25);
  assert.equal(clock.position().offset, 2.25);
  clock.goTo(99);
  assert.equal(clock.position().index, 2);
  clock.goTo(-1);
  assert.equal(clock.position().index, 0);
  clock.seek(-5);
  assert.equal(clock.position().time, 0);
  for (const value of [NaN, Infinity]) assert.throws(() => clock.seek(value));
  assert.throws(() => clock.advance(-1));
  assert.throws(() => new StoryClock([]));
  assert.throws(() => new StoryClock([0]));
});
