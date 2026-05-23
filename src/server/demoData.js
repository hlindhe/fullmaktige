const workspace = {
  id: 'dingle-demo',
  name: 'Dingle kommun',
  logoUrl: '',
  primaryColor: '#0f766e',
  accentColor: '#fbbf24'
};

const parties = [
  { id: 's', shortName: 'S', name: 'Socialdemokraterna', color: '#e11d48' },
  { id: 'm', shortName: 'M', name: 'Moderaterna', color: '#2563eb' },
  { id: 'c', shortName: 'C', name: 'Centerpartiet', color: '#16a34a' },
  { id: 'sd', shortName: 'SD', name: 'Sverigedemokraterna', color: '#facc15' },
  { id: 'v', shortName: 'V', name: 'Vänsterpartiet', color: '#b91c1c' },
  { id: 'mp', shortName: 'MP', name: 'Miljöpartiet', color: '#65a30d' }
];

const members = [
  { id: 'm1', seat: 1, name: 'Anna Lind', partyId: 's', role: 'Ordförande', status: 'ordinary' },
  { id: 'm2', seat: 2, name: 'Erik Holm', partyId: 'm', role: 'Ledamot', status: 'ordinary' },
  { id: 'm3', seat: 3, name: 'Sara Berg', partyId: 'c', role: 'Ledamot', status: 'ordinary' },
  { id: 'm4', seat: 4, name: 'Johan Ek', partyId: 'sd', role: 'Ledamot', status: 'ordinary' },
  { id: 'm5', seat: 5, name: 'Maria Nyström', partyId: 'v', role: 'Ledamot', status: 'ordinary' },
  { id: 'm6', seat: 6, name: 'Oskar Ström', partyId: 'mp', role: 'Ledamot', status: 'ordinary' },
  { id: 'm7', seat: 7, name: 'Karin Sjö', partyId: 's', role: 'Ledamot', status: 'ordinary' },
  { id: 'm8', seat: 8, name: 'Lars Vik', partyId: 'm', role: 'Ledamot', status: 'ordinary' },
  { id: 'm9', seat: 9, name: 'Nora Dahl', partyId: 'c', role: 'Ersättare', status: 'substitute' },
  { id: 'm10', seat: 10, name: 'Per Alm', partyId: 's', role: 'Ersättare', status: 'substitute' }
];

const seats = members.filter(m => m.status === 'ordinary').map(m => ({ seat: m.seat, memberId: m.id }));

const agenda = [
  { id: 'a1', paragraph: '§ 1', title: 'Mötets öppnande och upprop' },
  { id: 'a2', paragraph: '§ 2', title: 'Val av justerare' },
  { id: 'a3', paragraph: '§ 3', title: 'Budgetramar för kommande mandatperiod' },
  { id: 'a4', paragraph: '§ 4', title: 'Svar på motion om tryggare skolvägar' },
  { id: 'a5', paragraph: '§ 5', title: 'Interpellationer och frågor' }
];

module.exports = { workspace, parties, members, seats, agenda };
