-- Performance indexes for frequently queried columns
-- Based on analysis of common query patterns in the codebase

-- Flights table indexes
CREATE INDEX IF NOT EXISTS idx_flights_pilot_id ON flights(pilot_id);
CREATE INDEX IF NOT EXISTS idx_flights_wing ON flights(wing);
CREATE INDEX IF NOT EXISTS idx_flights_start_date ON flights(start_date);
CREATE INDEX IF NOT EXISTS idx_flights_pilot_wing ON flights(pilot_id, wing);
-- CREATE INDEX IF NOT EXISTS idx_flights_pilot_year ON flights(pilot_id, date_part('year', start_date));
CREATE INDEX IF NOT EXISTS idx_flights_takeoff_id ON flights(takeoff_id);
CREATE INDEX IF NOT EXISTS idx_flights_landing_id ON flights(landing_id);

-- Sites table indexes
CREATE INDEX IF NOT EXISTS idx_sites_ffvl_sid ON sites(ffvl_sid);
CREATE INDEX IF NOT EXISTS idx_sites_name ON sites(name);

-- Pilots table indexes
CREATE INDEX IF NOT EXISTS idx_pilots_pilot_id ON pilots(pilot_id);

-- Windsocks table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_windsocks_idbalise ON windsocks(balise_id);

-- Description preferences indexes
CREATE INDEX IF NOT EXISTS idx_description_preferences_pilot_id ON description_preferences(pilot_id);