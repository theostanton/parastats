create table description_preferences
(
    pilot_id                   integer primary key not null,
    include_sites              bool                not null,
    include_wind               bool                not null,
    include_wing_aggregate     bool                not null,
    include_year_aggregate     bool                not null,
    include_all_time_aggregate bool                not null
);;;

insert into description_preferences(pilot_id,
                                    include_sites,
                                    include_wind,
                                    include_wing_aggregate,
                                    include_year_aggregate,
                                    include_all_time_aggregate)
values ('4142500',
        true,
        true,
        true,
        true,
        true);;;

select p.first_name, to_json(dp)
from pilots as p
         left join description_preferences as dp on p.pilot_id = dp.pilot_id
