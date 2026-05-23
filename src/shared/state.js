function createInitialState(overrides) {
  return Object.assign({
    workspaceId: 'dingle-demo',
    activeAgendaItemId: null,
    liveNameplateMemberId: null,
    voteResult: null,
    voteDraft: {},
    seats: []
  }, overrides || {});
}

function applyAction(state, action) {
  var next = Object.assign({}, state);
  if (!action || !action.type) return next;
  switch (action.type) {
    case 'SET_AGENDA_ITEM':
      next.activeAgendaItemId = action.agendaItemId || null;
      return next;
    case 'SHOW_NAMEPLATE':
      next.liveNameplateMemberId = state.liveNameplateMemberId === action.memberId ? null : action.memberId;
      return next;
    case 'CLEAR_NAMEPLATE':
      next.liveNameplateMemberId = null;
      return next;
    case 'SET_VOTE':
      next.voteDraft = Object.assign({}, state.voteDraft || {});
      if (!action.vote) delete next.voteDraft[action.memberId];
      else next.voteDraft[action.memberId] = action.vote;
      return next;
    case 'SHOW_VOTE_RESULT':
      next.voteResult = action.result || null;
      return next;
    case 'CLEAR_VOTE_RESULT':
      next.voteResult = null;
      return next;
    case 'REPLACE_SEAT_MEMBER':
      next.seats = replaceMemberForSeat(state.seats || [], action.seat, action.substituteMemberId);
      return next;
    case 'CLEAR_ALL':
      next.activeAgendaItemId = null;
      next.liveNameplateMemberId = null;
      next.voteResult = null;
      return next;
    default:
      return next;
  }
}

function summarizeVote(members, votes) {
  var totals = { yes: 0, no: 0, abstain: 0, absent: 0, cast: 0 };
  var byParty = {};
  (members || []).forEach(function (member) {
    var partyId = member.partyId || 'unknown';
    if (!byParty[partyId]) byParty[partyId] = { yes: 0, no: 0, abstain: 0, absent: 0 };
    var vote = (votes || {})[member.id] || 'absent';
    if (vote !== 'yes' && vote !== 'no' && vote !== 'abstain') vote = 'absent';
    totals[vote] += 1;
    byParty[partyId][vote] += 1;
    if (vote !== 'absent') totals.cast += 1;
  });
  return { totals: totals, byParty: byParty };
}

function replaceMemberForSeat(seats, seatNumber, substituteMemberId) {
  return (seats || []).map(function (seat) {
    if (seat.seat !== seatNumber) return seat;
    return Object.assign({}, seat, {
      memberId: substituteMemberId,
      replacedMemberId: seat.replacedMemberId || seat.memberId
    });
  });
}

if (typeof module !== 'undefined') {
  module.exports = { createInitialState: createInitialState, applyAction: applyAction, summarizeVote: summarizeVote, replaceMemberForSeat: replaceMemberForSeat };
}
