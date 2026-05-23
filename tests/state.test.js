const assert = require('assert');
const { createInitialState, applyAction, summarizeVote, replaceMemberForSeat } = require('../src/shared/state');

function test(name, fn) {
  try { fn(); console.log('✓ ' + name); }
  catch (err) { console.error('✗ ' + name); console.error(err.stack || err); process.exitCode = 1; }
}

test('nameplate toggle only allows one live nameplate at a time', function () {
  let state = createInitialState();
  state = applyAction(state, { type: 'SHOW_NAMEPLATE', memberId: 'm1' });
  assert.strictEqual(state.liveNameplateMemberId, 'm1');
  state = applyAction(state, { type: 'SHOW_NAMEPLATE', memberId: 'm2' });
  assert.strictEqual(state.liveNameplateMemberId, 'm2');
  state = applyAction(state, { type: 'SHOW_NAMEPLATE', memberId: 'm2' });
  assert.strictEqual(state.liveNameplateMemberId, null);
});

test('active agenda item persists until the next item is selected', function () {
  let state = createInitialState();
  state = applyAction(state, { type: 'SET_AGENDA_ITEM', agendaItemId: 'a1' });
  state = applyAction(state, { type: 'SHOW_NAMEPLATE', memberId: 'm1' });
  state = applyAction(state, { type: 'SHOW_NAMEPLATE', memberId: 'm1' });
  assert.strictEqual(state.activeAgendaItemId, 'a1');
  state = applyAction(state, { type: 'SET_AGENDA_ITEM', agendaItemId: 'a2' });
  assert.strictEqual(state.activeAgendaItemId, 'a2');
});

test('clear all resets non-persistent live graphics including agenda for panic', function () {
  let state = createInitialState();
  state = applyAction(state, { type: 'SET_AGENDA_ITEM', agendaItemId: 'a1' });
  state = applyAction(state, { type: 'SHOW_NAMEPLATE', memberId: 'm1' });
  state = applyAction(state, { type: 'SHOW_VOTE_RESULT', result: { yes: 10, no: 5, abstain: 1 } });
  state = applyAction(state, { type: 'CLEAR_ALL' });
  assert.strictEqual(state.activeAgendaItemId, null);
  assert.strictEqual(state.liveNameplateMemberId, null);
  assert.strictEqual(state.voteResult, null);
});

test('vote summary totals votes and groups distribution by party', function () {
  const members = [
    { id: 'm1', partyId: 's' }, { id: 'm2', partyId: 's' }, { id: 'm3', partyId: 'm' }
  ];
  const votes = { m1: 'yes', m2: 'no', m3: 'abstain' };
  const summary = summarizeVote(members, votes);
  assert.deepStrictEqual(summary.totals, { yes: 1, no: 1, abstain: 1, absent: 0, cast: 3 });
  assert.deepStrictEqual(summary.byParty.s, { yes: 1, no: 1, abstain: 0, absent: 0 });
  assert.deepStrictEqual(summary.byParty.m, { yes: 0, no: 0, abstain: 1, absent: 0 });
});

test('replacement swaps a seated ordinary member for a substitute', function () {
  const seats = [{ seat: 1, memberId: 'ordinary' }, { seat: 2, memberId: 'other' }];
  const next = replaceMemberForSeat(seats, 1, 'substitute');
  assert.deepStrictEqual(next, [{ seat: 1, memberId: 'substitute', replacedMemberId: 'ordinary' }, { seat: 2, memberId: 'other' }]);
});
