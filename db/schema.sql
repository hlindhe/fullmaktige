CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  logo_url text,
  primary_color text NOT NULL DEFAULT '#0f766e',
  accent_color text NOT NULL DEFAULT '#fbbf24',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mandate_periods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  UNIQUE (workspace_id, name)
);

CREATE TABLE parties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  short_name text NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  UNIQUE (workspace_id, short_name)
);

CREATE TYPE member_role AS ENUM ('chair', 'member', 'substitute');
CREATE TYPE vote_value AS ENUM ('yes', 'no', 'abstain', 'absent');

CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  mandate_period_id uuid NOT NULL REFERENCES mandate_periods(id) ON DELETE CASCADE,
  party_id uuid NOT NULL REFERENCES parties(id),
  display_name text NOT NULL,
  role member_role NOT NULL DEFAULT 'member',
  default_seat integer,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE meetings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  mandate_period_id uuid NOT NULL REFERENCES mandate_periods(id),
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE agenda_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  paragraph text NOT NULL,
  title text NOT NULL,
  sort_order integer NOT NULL,
  UNIQUE (meeting_id, sort_order)
);

CREATE TABLE meeting_seats (
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  seat integer NOT NULL,
  member_id uuid NOT NULL REFERENCES members(id),
  replaced_member_id uuid REFERENCES members(id),
  PRIMARY KEY (meeting_id, seat)
);

CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  agenda_item_id uuid REFERENCES agenda_items(id),
  title text NOT NULL,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE vote_entries (
  vote_id uuid NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id),
  party_id uuid NOT NULL REFERENCES parties(id),
  value vote_value NOT NULL DEFAULT 'absent',
  entered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (vote_id, member_id)
);

CREATE TABLE graphics_events (
  id bigserial PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  meeting_id uuid REFERENCES meetings(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
