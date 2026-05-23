import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { io } from 'socket.io-client';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const socket = io(API_URL);
const voteOptions = [
  ['yes', 'Ja', 'bg-emerald-600'],
  ['no', 'Nej', 'bg-rose-600'],
  ['abstain', 'Avstår', 'bg-amber-500'],
  [null, 'Ej röstat', 'bg-slate-500']
];

function App() {
  const [data, setData] = useState(null);
  const [replacementSeat, setReplacementSeat] = useState('');
  const [replacementMember, setReplacementMember] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/bootstrap`).then(r => r.json()).then(setData);
    socket.on('graphics:state', setData);
    return () => socket.off('graphics:state', setData);
  }, []);

  const partiesById = useMemo(() => Object.fromEntries((data?.parties || []).map(p => [p.id, p])), [data]);
  const membersById = useMemo(() => Object.fromEntries((data?.members || []).map(m => [m.id, m])), [data]);
  const activeAgenda = data?.agenda.find(a => a.id === data?.state.activeAgendaItemId);

  function send(action) { socket.emit('operator:action', action); }
  function seatMembers() { return (data?.seats || []).map(s => ({ ...s, member: membersById[s.memberId] })).filter(s => s.member); }

  if (!data) return <main className="min-h-screen bg-slate-950 text-white p-8">Ansluter till grafikserver...</main>;

  return <main className="min-h-screen bg-slate-950 text-slate-100">
    <header className="border-b border-white/10 bg-slate-900/80 px-6 py-4 flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-teal-300">Fullmäktige-Live</p>
        <h1 className="text-2xl font-bold">{data.workspace.name} Kontrollpanel</h1>
      </div>
      <button onClick={() => send({ type: 'CLEAR_ALL' })} className="rounded-xl bg-red-600 px-6 py-3 text-lg font-black uppercase shadow-lg shadow-red-900/40 hover:bg-red-500">Clear All</button>
    </header>

    <section className="grid gap-5 p-6 xl:grid-cols-[360px_1fr_420px]">
      <Panel title="Ärenden" subtitle={activeAgenda ? `Live: ${activeAgenda.paragraph}` : 'Ingen ärendeskylt live'}>
        <div className="space-y-2">
          {data.agenda.map(item => <button key={item.id} onClick={() => send({ type: 'SET_AGENDA_ITEM', agendaItemId: item.id })}
            className={`w-full text-left rounded-xl border p-4 transition ${data.state.activeAgendaItemId === item.id ? 'border-teal-300 bg-teal-500/20 shadow-lg shadow-teal-900/30' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
            <span className="font-black text-teal-200">{item.paragraph}</span>
            <span className="ml-3">{item.title}</span>
          </button>)}
        </div>
      </Panel>

      <Panel title="Namnskyltar" subtitle="Ett klick visar, samma klick släcker. Endast en åt gången.">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {seatMembers().map(({ seat, member, replacedMemberId }) => {
            const party = partiesById[member.partyId] || {};
            const live = data.state.liveNameplateMemberId === member.id;
            return <button key={`${seat}-${member.id}`} onClick={() => send({ type: 'SHOW_NAMEPLATE', memberId: member.id })}
              className={`rounded-2xl border p-4 text-left min-h-28 transition ${live ? 'border-white bg-white text-slate-950 scale-[1.02]' : 'border-white/10 bg-slate-900 hover:bg-slate-800'}`}
              style={{ boxShadow: live ? `0 0 0 4px ${party.color || '#14b8a6'}, 0 20px 50px rgba(0,0,0,.35)` : undefined }}>
              <div className="flex items-center justify-between"><span className="text-xs opacity-70">Plats {seat}</span><span className="rounded px-2 py-1 text-xs font-bold text-white" style={{ background: party.color }}>{party.shortName}</span></div>
              <div className="mt-3 font-bold">{member.name}</div>
              <div className="text-sm opacity-70">{member.role}</div>
              {replacedMemberId && <div className="mt-2 text-xs text-amber-300">Ersätter {membersById[replacedMemberId]?.name}</div>}
              {live && <div className="mt-2 text-sm font-black text-emerald-500">LIVE</div>}
            </button>;
          })}
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="Ersättarhantering" subtitle="Byt snabbt en plats inför debatt eller votering.">
          <div className="grid grid-cols-2 gap-3">
            <select value={replacementSeat} onChange={e => setReplacementSeat(e.target.value)} className="rounded-xl bg-slate-800 p-3 text-white">
              <option value="">Välj plats</option>
              {data.seats.map(s => <option key={s.seat} value={s.seat}>Plats {s.seat} – {membersById[s.memberId]?.name}</option>)}
            </select>
            <select value={replacementMember} onChange={e => setReplacementMember(e.target.value)} className="rounded-xl bg-slate-800 p-3 text-white">
              <option value="">Välj ersättare</option>
              {data.members.filter(m => m.status === 'substitute').map(m => <option key={m.id} value={m.id}>{m.name} ({partiesById[m.partyId]?.shortName})</option>)}
            </select>
          </div>
          <button disabled={!replacementSeat || !replacementMember} onClick={() => send({ type: 'REPLACE_SEAT_MEMBER', seat: Number(replacementSeat), substituteMemberId: replacementMember })}
            className="mt-3 w-full rounded-xl bg-teal-600 px-4 py-3 font-bold disabled:opacity-40">Byt in ersättare</button>
        </Panel>

        <Panel title="Votering" subtitle="Manuell registrering vid namnupprop.">
          <div className="space-y-2 max-h-[48vh] overflow-auto pr-1">
            {seatMembers().map(({ member }) => <div key={member.id} className="rounded-xl bg-white/5 p-3">
              <div className="mb-2 flex justify-between"><b>{member.name}</b><span>{partiesById[member.partyId]?.shortName}</span></div>
              <div className="grid grid-cols-4 gap-1">
                {voteOptions.map(([vote, label, color]) => <button key={label} onClick={() => send({ type: 'SET_VOTE', memberId: member.id, vote })}
                  className={`rounded-lg px-2 py-2 text-xs font-bold ${data.state.voteDraft?.[member.id] === vote || (!vote && !data.state.voteDraft?.[member.id]) ? color : 'bg-slate-800'}`}>{label}</button>)}
              </div>
            </div>)}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => send({ type: 'FINALIZE_VOTE' })} className="rounded-xl bg-indigo-600 px-4 py-3 font-bold">Visa resultat</button>
            <button onClick={() => send({ type: 'CLEAR_VOTE_RESULT' })} className="rounded-xl bg-slate-700 px-4 py-3 font-bold">Dölj resultat</button>
          </div>
        </Panel>
      </div>
    </section>
  </main>;
}

function Panel({ title, subtitle, children }) {
  return <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/20">
    <h2 className="text-xl font-black">{title}</h2>
    <p className="mb-4 text-sm text-slate-400">{subtitle}</p>
    {children}
  </section>;
}

createRoot(document.getElementById('root')).render(<App />);
