-- Lets a crop/product page show its own relevant vendors and tools — e.g.
-- someone looking at Coffee should see who sells coffee seedlings, who buys
-- coffee, and which of our tools (solar dryer, drip irrigation...) actually
-- apply to coffee — not just a generic community feed.

-- Which crops a vendor supplies seeds/seedlings/inputs for (parallel to the
-- existing vendors.crops_bought, which is about buying FROM farmers).
alter table vendors add column if not exists crops_supplied int[];

-- Which of our equipment/tools are relevant to a given crop (e.g. a solar
-- dryer for coffee post-harvest, a mini-tiller for potato land prep).
create table if not exists crop_equipment (
  crop_id int references crops(id) on delete cascade,
  equipment_id int references equipment(id) on delete cascade,
  notes text, -- short, specific: "used for drying coffee cherries/beans"
  primary key (crop_id, equipment_id)
);

alter table crop_equipment enable row level security;
create policy "public read crop_equipment" on crop_equipment for select using (true);
