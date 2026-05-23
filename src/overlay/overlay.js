const socket = io();
let last = null;
const $ = id => document.getElementById(id);

function indexById(items) { return Object.fromEntries((items || []).map(item => [item.id, item])); }
function setHidden(el, hidden) { el.classList.toggle('hidden', hidden); }

socket.on('graphics:state', payload => {
  last = payload;
  const parties = indexById(payload.parties);
  const members = indexById(payload.members);
  const agenda = indexById(payload.agenda);
  document.documentElement.style.setProperty('--accent', payload.workspace.primaryColor || '#14b8a6');

  const activeAgenda = agenda[payload.state.activeAgendaItemId];
  setHidden($('agenda-card'), !activeAgenda);
  if (activeAgenda) {
    $('agenda-paragraph').textContent = activeAgenda.paragraph;
    $('agenda-title').textContent = activeAgenda.title;
  }

  const member = members[payload.state.liveNameplateMemberId];
  setHidden($('nameplate'), !member);
  if (member) {
    const party = parties[member.partyId] || { shortName: '', color: '#14b8a6' };
    document.documentElement.style.setProperty('--party', party.color);
    $('party-bar').style.background = party.color;
    $('member-name').textContent = member.name;
    $('member-party').textContent = party.shortName;
    $('member-role').textContent = member.role;
  }

  renderVote(payload.state.voteResult, payload);
});

function renderVote(result, payload) {
  setHidden($('vote-result'), !result);
  if (!result) return;
  const activeAgenda = (payload.agenda || []).find(a => a.id === payload.state.activeAgendaItemId);
  $('vote-heading').textContent = activeAgenda ? `${activeAgenda.paragraph} ${activeAgenda.title}` : 'Voteringsresultat';
  const totals = result.totals || { yes: 0, no: 0, abstain: 0, cast: 0 };
  const max = Math.max(totals.yes || 0, totals.no || 0, totals.abstain || 0, 1);
  $('vote-yes').textContent = totals.yes || 0;
  $('vote-no').textContent = totals.no || 0;
  $('vote-abstain').textContent = totals.abstain || 0;
  $('bar-yes').style.width = `${((totals.yes || 0) / max) * 100}%`;
  $('bar-no').style.width = `${((totals.no || 0) / max) * 100}%`;
  $('bar-abstain').style.width = `${((totals.abstain || 0) / max) * 100}%`;

  const parties = indexById(payload.parties);
  $('party-breakdown').innerHTML = Object.entries(result.byParty || {}).map(([partyId, row]) => {
    const p = parties[partyId] || { shortName: partyId, color: '#94a3b8' };
    return `<div class="party-card" style="--party:${p.color}"><b>${p.shortName}</b><span>Ja ${row.yes} · Nej ${row.no} · Avstår ${row.abstain}</span></div>`;
  }).join('');
}
