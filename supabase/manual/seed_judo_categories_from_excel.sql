-- Generated from C:/Users/jAS/OneDrive/Desktop/judo.xlsx, sheet: Weights
-- Source columns: AgeGroup, Gender, MaxWeight, Category
-- Excel uses F for female; current DB constraint requires M/Ж, so F is mapped to Ж.
-- Age min/max are intentionally NULL because the Weights sheet does not contain age boundaries.
-- Safe/idempotent: no drops, no deletes, no RLS changes, no unrelated schema changes.
-- Counts from Excel: 17 age groups, 199 weight categories.
-- This version intentionally uses no temp tables because Supabase SQL Editor can lose temp relations between statements.

begin;

insert into public.age_groups (name, min_age, max_age)
select source.name, source.min_age, source.max_age
from jsonb_to_recordset($judo_age_groups$
[
  {
    "name": "деца-полетарци",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "U12-деца",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "U14-помлади пионери",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "U16-пионери",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "U18-кадети",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "U21-јуниори",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "U23-помлади сениори",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "сениори",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F1/M1 30-34-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F2/M2 35-39-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F3/M3 40-44-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F4/M4 45-49-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F5/M5 50-54-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F6/M6 55-59-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F7/M7 60-64-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F8/M8 65-69-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F9/M9 70+-ветерани",
    "min_age": null,
    "max_age": null
  }
]
$judo_age_groups$::jsonb) as source(name text, min_age integer, max_age integer)
where not exists (
  select 1
  from public.age_groups existing
  where existing.name = source.name
);

update public.weight_categories target
set
  min_weight = source.min_weight,
  max_weight = source.max_weight
from jsonb_to_recordset($judo_weight_categories$
[
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": null,
    "max_weight": 30.0,
    "name": "-30kg",
    "source_order": 1
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 30.0,
    "max_weight": 34.0,
    "name": "-34kg",
    "source_order": 2
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 34.0,
    "max_weight": 38.0,
    "name": "-38kg",
    "source_order": 3
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 38.0,
    "max_weight": 42.0,
    "name": "-42kg",
    "source_order": 4
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 42.0,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 5
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 6
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 7
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 8
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 9
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 10
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": null,
    "name": "+73kg",
    "source_order": 11
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 28.0,
    "name": "-28kg",
    "source_order": 12
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 28.0,
    "max_weight": 32.0,
    "name": "-32kg",
    "source_order": 13
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 32.0,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 14
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 15
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 16
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 17
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 18
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 19
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 20
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": null,
    "name": "+63kg",
    "source_order": 21
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": null,
    "max_weight": 30.0,
    "name": "-30kg",
    "source_order": 22
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 30.0,
    "max_weight": 34.0,
    "name": "-34kg",
    "source_order": 23
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 34.0,
    "max_weight": 38.0,
    "name": "-38kg",
    "source_order": 24
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 38.0,
    "max_weight": 42.0,
    "name": "-42kg",
    "source_order": 25
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 42.0,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 26
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 27
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 28
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 29
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 30
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 31
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": null,
    "name": "+73kg",
    "source_order": 32
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 28.0,
    "name": "-28kg",
    "source_order": 33
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 28.0,
    "max_weight": 32.0,
    "name": "-32kg",
    "source_order": 34
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 32.0,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 35
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 36
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 37
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 38
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 39
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 40
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 41
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": null,
    "name": "+63kg",
    "source_order": 42
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": null,
    "max_weight": 38.0,
    "name": "-38kg",
    "source_order": 43
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 38.0,
    "max_weight": 42.0,
    "name": "-42kg",
    "source_order": 44
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 42.0,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 45
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 46
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 47
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 48
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 49
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 50
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": null,
    "name": "+73kg",
    "source_order": 51
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 32.0,
    "name": "-32kg",
    "source_order": 52
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 32.0,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 53
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 54
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 55
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 56
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 57
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 58
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 59
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": null,
    "name": "+63kg",
    "source_order": 60
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": null,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 61
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 62
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 63
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 64
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 65
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 66
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 67
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 68
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": null,
    "name": "+90kg",
    "source_order": 69
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 70
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 71
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 72
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 73
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 74
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 75
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 76
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 77
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": null,
    "name": "+70kg",
    "source_order": 78
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": null,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 79
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 80
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 81
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 82
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 83
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 84
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 85
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": null,
    "name": "+90kg",
    "source_order": 86
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 87
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 88
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 89
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 90
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 91
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 92
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 93
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": null,
    "name": "+70kg",
    "source_order": 94
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 95
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 96
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 97
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 98
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 99
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 100
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 101
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 102
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 103
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 104
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 105
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 106
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": 78.0,
    "name": "-78kg",
    "source_order": 107
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 78.0,
    "max_weight": null,
    "name": "+78kg",
    "source_order": 108
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 109
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 110
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 111
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 112
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 113
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 114
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 115
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 116
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 117
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 118
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 119
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 120
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": 78.0,
    "name": "-78kg",
    "source_order": 121
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 78.0,
    "max_weight": null,
    "name": "+78kg",
    "source_order": 122
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 123
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 124
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 125
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 126
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 127
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 128
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 129
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 130
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 131
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 132
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 133
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 134
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": 78.0,
    "name": "-78kg",
    "source_order": 135
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 78.0,
    "max_weight": null,
    "name": "+78kg",
    "source_order": 136
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 137
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 138
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 139
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 140
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 141
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 142
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 143
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 144
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 145
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 146
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 147
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 148
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 149
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 150
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 151
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 152
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 153
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 154
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 155
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 156
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 157
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 158
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 159
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 160
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 161
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 162
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 163
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 164
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 165
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 166
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 167
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 168
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 169
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 170
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 171
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 172
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 173
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 174
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 175
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 176
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 177
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 178
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 179
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 180
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 181
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 182
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 183
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 184
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 185
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 186
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 187
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 188
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 189
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 190
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 191
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 192
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 193
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 194
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 195
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 196
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 197
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 198
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 199
  }
]
$judo_weight_categories$::jsonb) as source(
  age_group_name text,
  gender text,
  min_weight numeric,
  max_weight numeric,
  name text,
  source_order integer
)
join public.age_groups age_group on age_group.name = source.age_group_name
where target.age_group_id = age_group.id
  and target.gender = source.gender
  and target.name = source.name;

insert into public.weight_categories (age_group_id, gender, min_weight, max_weight, name)
select age_group.id, source.gender, source.min_weight, source.max_weight, source.name
from jsonb_to_recordset($judo_weight_categories$
[
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": null,
    "max_weight": 30.0,
    "name": "-30kg",
    "source_order": 1
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 30.0,
    "max_weight": 34.0,
    "name": "-34kg",
    "source_order": 2
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 34.0,
    "max_weight": 38.0,
    "name": "-38kg",
    "source_order": 3
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 38.0,
    "max_weight": 42.0,
    "name": "-42kg",
    "source_order": 4
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 42.0,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 5
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 6
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 7
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 8
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 9
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 10
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": null,
    "name": "+73kg",
    "source_order": 11
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 28.0,
    "name": "-28kg",
    "source_order": 12
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 28.0,
    "max_weight": 32.0,
    "name": "-32kg",
    "source_order": 13
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 32.0,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 14
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 15
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 16
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 17
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 18
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 19
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 20
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": null,
    "name": "+63kg",
    "source_order": 21
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": null,
    "max_weight": 30.0,
    "name": "-30kg",
    "source_order": 22
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 30.0,
    "max_weight": 34.0,
    "name": "-34kg",
    "source_order": 23
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 34.0,
    "max_weight": 38.0,
    "name": "-38kg",
    "source_order": 24
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 38.0,
    "max_weight": 42.0,
    "name": "-42kg",
    "source_order": 25
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 42.0,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 26
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 27
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 28
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 29
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 30
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 31
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": null,
    "name": "+73kg",
    "source_order": 32
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 28.0,
    "name": "-28kg",
    "source_order": 33
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 28.0,
    "max_weight": 32.0,
    "name": "-32kg",
    "source_order": 34
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 32.0,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 35
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 36
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 37
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 38
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 39
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 40
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 41
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": null,
    "name": "+63kg",
    "source_order": 42
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": null,
    "max_weight": 38.0,
    "name": "-38kg",
    "source_order": 43
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 38.0,
    "max_weight": 42.0,
    "name": "-42kg",
    "source_order": 44
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 42.0,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 45
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 46
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 47
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 48
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 49
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 50
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": null,
    "name": "+73kg",
    "source_order": 51
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 32.0,
    "name": "-32kg",
    "source_order": 52
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 32.0,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 53
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 54
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 55
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 56
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 57
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 58
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 59
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": null,
    "name": "+63kg",
    "source_order": 60
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": null,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 61
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 62
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 63
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 64
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 65
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 66
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 67
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 68
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": null,
    "name": "+90kg",
    "source_order": 69
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 70
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 71
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 72
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 73
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 74
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 75
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 76
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 77
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": null,
    "name": "+70kg",
    "source_order": 78
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": null,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 79
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 80
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 81
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 82
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 83
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 84
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 85
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": null,
    "name": "+90kg",
    "source_order": 86
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 87
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 88
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 89
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 90
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 91
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 92
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 93
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": null,
    "name": "+70kg",
    "source_order": 94
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 95
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 96
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 97
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 98
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 99
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 100
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 101
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 102
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 103
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 104
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 105
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 106
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": 78.0,
    "name": "-78kg",
    "source_order": 107
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 78.0,
    "max_weight": null,
    "name": "+78kg",
    "source_order": 108
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 109
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 110
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 111
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 112
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 113
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 114
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 115
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 116
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 117
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 118
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 119
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 120
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": 78.0,
    "name": "-78kg",
    "source_order": 121
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 78.0,
    "max_weight": null,
    "name": "+78kg",
    "source_order": 122
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 123
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 124
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 125
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 126
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 127
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 128
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 129
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 130
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 131
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 132
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 133
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 134
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": 78.0,
    "name": "-78kg",
    "source_order": 135
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 78.0,
    "max_weight": null,
    "name": "+78kg",
    "source_order": 136
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 137
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 138
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 139
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 140
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 141
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 142
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 143
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 144
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 145
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 146
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 147
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 148
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 149
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 150
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 151
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 152
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 153
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 154
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 155
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 156
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 157
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 158
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 159
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 160
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 161
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 162
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 163
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 164
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 165
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 166
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 167
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 168
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 169
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 170
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 171
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 172
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 173
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 174
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 175
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 176
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 177
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 178
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 179
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 180
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 181
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 182
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 183
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 184
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 185
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 186
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 187
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 188
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 189
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 190
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 191
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 192
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 193
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 194
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 195
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 196
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 197
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 198
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 199
  }
]
$judo_weight_categories$::jsonb) as source(
  age_group_name text,
  gender text,
  min_weight numeric,
  max_weight numeric,
  name text,
  source_order integer
)
join public.age_groups age_group on age_group.name = source.age_group_name
where not exists (
  select 1
  from public.weight_categories existing
  where existing.age_group_id = age_group.id
    and existing.gender = source.gender
    and existing.name = source.name
);

commit;

-- Verification. Run after the script completes.
select count(*) as age_groups_from_excel
from public.age_groups
where name in (
  select source.name
  from jsonb_to_recordset($judo_age_groups$
[
  {
    "name": "деца-полетарци",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "U12-деца",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "U14-помлади пионери",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "U16-пионери",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "U18-кадети",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "U21-јуниори",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "U23-помлади сениори",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "сениори",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F1/M1 30-34-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F2/M2 35-39-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F3/M3 40-44-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F4/M4 45-49-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F5/M5 50-54-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F6/M6 55-59-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F7/M7 60-64-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F8/M8 65-69-ветерани",
    "min_age": null,
    "max_age": null
  },
  {
    "name": "F9/M9 70+-ветерани",
    "min_age": null,
    "max_age": null
  }
]
$judo_age_groups$::jsonb) as source(name text, min_age integer, max_age integer)
);

select count(*) as weight_categories_from_excel
from public.weight_categories weight_category
join public.age_groups age_group on age_group.id = weight_category.age_group_id
join jsonb_to_recordset($judo_weight_categories$
[
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": null,
    "max_weight": 30.0,
    "name": "-30kg",
    "source_order": 1
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 30.0,
    "max_weight": 34.0,
    "name": "-34kg",
    "source_order": 2
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 34.0,
    "max_weight": 38.0,
    "name": "-38kg",
    "source_order": 3
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 38.0,
    "max_weight": 42.0,
    "name": "-42kg",
    "source_order": 4
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 42.0,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 5
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 6
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 7
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 8
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 9
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 10
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": null,
    "name": "+73kg",
    "source_order": 11
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 28.0,
    "name": "-28kg",
    "source_order": 12
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 28.0,
    "max_weight": 32.0,
    "name": "-32kg",
    "source_order": 13
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 32.0,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 14
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 15
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 16
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 17
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 18
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 19
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 20
  },
  {
    "age_group_name": "деца-полетарци",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": null,
    "name": "+63kg",
    "source_order": 21
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": null,
    "max_weight": 30.0,
    "name": "-30kg",
    "source_order": 22
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 30.0,
    "max_weight": 34.0,
    "name": "-34kg",
    "source_order": 23
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 34.0,
    "max_weight": 38.0,
    "name": "-38kg",
    "source_order": 24
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 38.0,
    "max_weight": 42.0,
    "name": "-42kg",
    "source_order": 25
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 42.0,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 26
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 27
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 28
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 29
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 30
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 31
  },
  {
    "age_group_name": "U12-деца",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": null,
    "name": "+73kg",
    "source_order": 32
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 28.0,
    "name": "-28kg",
    "source_order": 33
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 28.0,
    "max_weight": 32.0,
    "name": "-32kg",
    "source_order": 34
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 32.0,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 35
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 36
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 37
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 38
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 39
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 40
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 41
  },
  {
    "age_group_name": "U12-деца",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": null,
    "name": "+63kg",
    "source_order": 42
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": null,
    "max_weight": 38.0,
    "name": "-38kg",
    "source_order": 43
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 38.0,
    "max_weight": 42.0,
    "name": "-42kg",
    "source_order": 44
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 42.0,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 45
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 46
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 47
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 48
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 49
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 50
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": null,
    "name": "+73kg",
    "source_order": 51
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 32.0,
    "name": "-32kg",
    "source_order": 52
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 32.0,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 53
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 54
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 55
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 56
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 57
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 58
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 59
  },
  {
    "age_group_name": "U14-помлади пионери",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": null,
    "name": "+63kg",
    "source_order": 60
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": null,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 61
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 62
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 63
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 64
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 65
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 66
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 67
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 68
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": null,
    "name": "+90kg",
    "source_order": 69
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 70
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 71
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 72
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 73
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 74
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 75
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 76
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 77
  },
  {
    "age_group_name": "U16-пионери",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": null,
    "name": "+70kg",
    "source_order": 78
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": null,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 79
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 80
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 81
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 82
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 83
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 84
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 85
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": null,
    "name": "+90kg",
    "source_order": 86
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 87
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 88
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 89
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 90
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 91
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 92
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 93
  },
  {
    "age_group_name": "U18-кадети",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": null,
    "name": "+70kg",
    "source_order": 94
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 95
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 96
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 97
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 98
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 99
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 100
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 101
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 102
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 103
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 104
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 105
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 106
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": 78.0,
    "name": "-78kg",
    "source_order": 107
  },
  {
    "age_group_name": "U21-јуниори",
    "gender": "Ж",
    "min_weight": 78.0,
    "max_weight": null,
    "name": "+78kg",
    "source_order": 108
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 109
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 110
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 111
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 112
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 113
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 114
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 115
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 116
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 117
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 118
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 119
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 120
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": 78.0,
    "name": "-78kg",
    "source_order": 121
  },
  {
    "age_group_name": "U23-помлади сениори",
    "gender": "Ж",
    "min_weight": 78.0,
    "max_weight": null,
    "name": "+78kg",
    "source_order": 122
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 123
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 124
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 125
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 126
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 127
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 128
  },
  {
    "age_group_name": "сениори",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 129
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": null,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 130
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 131
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 132
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 133
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 134
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 70.0,
    "max_weight": 78.0,
    "name": "-78kg",
    "source_order": 135
  },
  {
    "age_group_name": "сениори",
    "gender": "Ж",
    "min_weight": 78.0,
    "max_weight": null,
    "name": "+78kg",
    "source_order": 136
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 137
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 138
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 139
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 140
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 141
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 142
  },
  {
    "age_group_name": "F1/M1 30-34-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 143
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 144
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 145
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 146
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 147
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 148
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 149
  },
  {
    "age_group_name": "F2/M2 35-39-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 150
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 151
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 152
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 153
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 154
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 155
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 156
  },
  {
    "age_group_name": "F3/M3 40-44-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 157
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 158
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 159
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 160
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 161
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 162
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 163
  },
  {
    "age_group_name": "F4/M4 45-49-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 164
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 165
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 166
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 167
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 168
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 169
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 170
  },
  {
    "age_group_name": "F5/M5 50-54-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 171
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 172
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 173
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 174
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 175
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 176
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 177
  },
  {
    "age_group_name": "F6/M6 55-59-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 178
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 179
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 180
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 181
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 182
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 183
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 184
  },
  {
    "age_group_name": "F7/M7 60-64-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 185
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 186
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 187
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 188
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 189
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 190
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 191
  },
  {
    "age_group_name": "F8/M8 65-69-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 192
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 193
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 194
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 195
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 196
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 197
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 198
  },
  {
    "age_group_name": "F9/M9 70+-ветерани",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 199
  }
]
$judo_weight_categories$::jsonb) as source(
  age_group_name text,
  gender text,
  min_weight numeric,
  max_weight numeric,
  name text,
  source_order integer
)
  on source.age_group_name = age_group.name
 and source.gender = weight_category.gender
 and source.name = weight_category.name;
