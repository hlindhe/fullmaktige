require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { createInitialState, applyAction, summarizeVote } = require('../shared/state');
const demo = require('./demoData');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3000;

let state = createInitialState({ seats: demo.seats });
const eventLog = [];

app.use(cors());
app.use(express.json());
app.use('/overlay', express.static(path.join(__dirname, '../overlay')));
app.use('/assets', express.static(path.join(__dirname, '../../public')));

function publicPayload() {
  const seatedIds = new Set((state.seats || []).map(s => s.memberId));
  const seatedMembers = demo.members.filter(m => seatedIds.has(m.id));
  return {
    workspace: demo.workspace,
    parties: demo.parties,
    members: demo.members,
    seatedMembers,
    seats: state.seats,
    agenda: demo.agenda,
    state
  };
}

function emitState() {
  io.emit('graphics:state', publicPayload());
}

function dispatch(action, source) {
  if (action.type === 'FINALIZE_VOTE') {
    const seatedIds = new Set((state.seats || []).map(s => s.memberId));
    const seatedMembers = demo.members.filter(m => seatedIds.has(m.id));
    const result = summarizeVote(seatedMembers, state.voteDraft || {});
    state = applyAction(state, { type: 'SHOW_VOTE_RESULT', result });
  } else {
    state = applyAction(state, action);
  }
  eventLog.push({ at: new Date().toISOString(), source: source || 'api', action, state });
  emitState();
  return publicPayload();
}

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'Fullmäktige-Live', now: new Date().toISOString() }));
app.get('/api/bootstrap', (req, res) => res.json(publicPayload()));
app.get('/api/log', (req, res) => res.json(eventLog.slice(-100)));
app.post('/api/action', (req, res) => res.json(dispatch(req.body, 'http')));

io.on('connection', socket => {
  socket.emit('graphics:state', publicPayload());
  socket.on('operator:action', action => dispatch(action, socket.id));
});

server.listen(PORT, () => {
  console.log(`Fullmäktige-Live backend listening on http://localhost:${PORT}`);
  console.log(`Overlay: http://localhost:${PORT}/overlay`);
});
