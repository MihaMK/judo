-- Full reset generated from C:/Users/jAS/OneDrive/Desktop/judo.xlsx.
-- Age boundaries source: Athletes sheet category formula in column F, reference DATE(2026,12,31).
-- Weight categories source: Weights sheet columns AgeGroup, Gender, MaxWeight, Category.
-- Excel gender F is mapped to DB gender unicode U+0416 because the current DB constraint allows only M/U+0416.
-- This script resets only public.weight_categories and public.age_groups.
-- It does not modify RLS, auth, athletes, payments, attendance, belts, or unrelated schema.
-- Expected result: 17 age groups and 199 weight categories.

begin;

delete from public.weight_categories;
delete from public.age_groups;

insert into public.age_groups (name, min_age, max_age)
select source.name, source.min_age, source.max_age
from jsonb_to_recordset($judo_age_groups$
[
  {
    "name": "????-?????????",
    "min_age": 0,
    "max_age": 9
  },
  {
    "name": "U12-????",
    "min_age": 10,
    "max_age": 11
  },
  {
    "name": "U14-??????? ???????",
    "min_age": 12,
    "max_age": 13
  },
  {
    "name": "U16-???????",
    "min_age": 14,
    "max_age": 15
  },
  {
    "name": "U18-??????",
    "min_age": 16,
    "max_age": 17
  },
  {
    "name": "U21-???????",
    "min_age": 18,
    "max_age": 20
  },
  {
    "name": "U23-??????? ???????",
    "min_age": 21,
    "max_age": 22
  },
  {
    "name": "???????",
    "min_age": 23,
    "max_age": 29
  },
  {
    "name": "F1/M1 30-34-????????",
    "min_age": 30,
    "max_age": 34
  },
  {
    "name": "F2/M2 35-39-????????",
    "min_age": 35,
    "max_age": 39
  },
  {
    "name": "F3/M3 40-44-????????",
    "min_age": 40,
    "max_age": 44
  },
  {
    "name": "F4/M4 45-49-????????",
    "min_age": 45,
    "max_age": 49
  },
  {
    "name": "F5/M5 50-54-????????",
    "min_age": 50,
    "max_age": 54
  },
  {
    "name": "F6/M6 55-59-????????",
    "min_age": 55,
    "max_age": 59
  },
  {
    "name": "F7/M7 60-64-????????",
    "min_age": 60,
    "max_age": 64
  },
  {
    "name": "F8/M8 65-69-????????",
    "min_age": 65,
    "max_age": 69
  },
  {
    "name": "F9/M9 70+-????????",
    "min_age": 70,
    "max_age": null
  }
]
$judo_age_groups$::jsonb) as source(name text, min_age integer, max_age integer);

insert into public.weight_categories (age_group_id, gender, min_weight, max_weight, name)
select age_group.id, source.gender, source.min_weight, source.max_weight, source.name
from jsonb_to_recordset($judo_weight_categories$
[
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 30.0,
    "name": "-30kg",
    "source_order": 1
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "M",
    "min_weight": 30.0,
    "max_weight": 34.0,
    "name": "-34kg",
    "source_order": 2
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "M",
    "min_weight": 34.0,
    "max_weight": 38.0,
    "name": "-38kg",
    "source_order": 3
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "M",
    "min_weight": 38.0,
    "max_weight": 42.0,
    "name": "-42kg",
    "source_order": 4
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "M",
    "min_weight": 42.0,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 5
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 6
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 7
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 8
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 9
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 10
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": null,
    "name": "+73kg",
    "source_order": 11
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "\u0416",
    "min_weight": null,
    "max_weight": 28.0,
    "name": "-28kg",
    "source_order": 12
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "\u0416",
    "min_weight": 28.0,
    "max_weight": 32.0,
    "name": "-32kg",
    "source_order": 13
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "\u0416",
    "min_weight": 32.0,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 14
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "\u0416",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 15
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "\u0416",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 16
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "\u0416",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 17
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "\u0416",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 18
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "\u0416",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 19
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "\u0416",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 20
  },
  {
    "age_group_name": "\u0434\u0435\u0446\u0430-\u043f\u043e\u043b\u0435\u0442\u0430\u0440\u0446\u0438",
    "gender": "\u0416",
    "min_weight": 63.0,
    "max_weight": null,
    "name": "+63kg",
    "source_order": 21
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "M",
    "min_weight": null,
    "max_weight": 30.0,
    "name": "-30kg",
    "source_order": 22
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "M",
    "min_weight": 30.0,
    "max_weight": 34.0,
    "name": "-34kg",
    "source_order": 23
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "M",
    "min_weight": 34.0,
    "max_weight": 38.0,
    "name": "-38kg",
    "source_order": 24
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "M",
    "min_weight": 38.0,
    "max_weight": 42.0,
    "name": "-42kg",
    "source_order": 25
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "M",
    "min_weight": 42.0,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 26
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 27
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 28
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 29
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 30
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 31
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": null,
    "name": "+73kg",
    "source_order": 32
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "\u0416",
    "min_weight": null,
    "max_weight": 28.0,
    "name": "-28kg",
    "source_order": 33
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "\u0416",
    "min_weight": 28.0,
    "max_weight": 32.0,
    "name": "-32kg",
    "source_order": 34
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "\u0416",
    "min_weight": 32.0,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 35
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "\u0416",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 36
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "\u0416",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 37
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "\u0416",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 38
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "\u0416",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 39
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "\u0416",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 40
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "\u0416",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 41
  },
  {
    "age_group_name": "U12-\u0434\u0435\u0446\u0430",
    "gender": "\u0416",
    "min_weight": 63.0,
    "max_weight": null,
    "name": "+63kg",
    "source_order": 42
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 38.0,
    "name": "-38kg",
    "source_order": 43
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 38.0,
    "max_weight": 42.0,
    "name": "-42kg",
    "source_order": 44
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 42.0,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 45
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 46
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 47
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 48
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 49
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 50
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": null,
    "name": "+73kg",
    "source_order": 51
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": null,
    "max_weight": 32.0,
    "name": "-32kg",
    "source_order": 52
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 32.0,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 53
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 54
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 55
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 56
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 57
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 58
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 59
  },
  {
    "age_group_name": "U14-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 63.0,
    "max_weight": null,
    "name": "+63kg",
    "source_order": 60
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 46.0,
    "name": "-46kg",
    "source_order": 61
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 46.0,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 62
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 63
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 64
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 65
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 66
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 67
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 68
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": null,
    "name": "+90kg",
    "source_order": 69
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": null,
    "max_weight": 36.0,
    "name": "-36kg",
    "source_order": 70
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 36.0,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 71
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 72
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 73
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 74
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 75
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 76
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 77
  },
  {
    "age_group_name": "U16-\u043f\u0438\u043e\u043d\u0435\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 70.0,
    "max_weight": null,
    "name": "+70kg",
    "source_order": 78
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 50.0,
    "name": "-50kg",
    "source_order": 79
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "M",
    "min_weight": 50.0,
    "max_weight": 55.0,
    "name": "-55kg",
    "source_order": 80
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "M",
    "min_weight": 55.0,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 81
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 82
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 83
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 84
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 85
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": null,
    "name": "+90kg",
    "source_order": 86
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "\u0416",
    "min_weight": null,
    "max_weight": 40.0,
    "name": "-40kg",
    "source_order": 87
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "\u0416",
    "min_weight": 40.0,
    "max_weight": 44.0,
    "name": "-44kg",
    "source_order": 88
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "\u0416",
    "min_weight": 44.0,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 89
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "\u0416",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 90
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "\u0416",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 91
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "\u0416",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 92
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "\u0416",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 93
  },
  {
    "age_group_name": "U18-\u043a\u0430\u0434\u0435\u0442\u0438",
    "gender": "\u0416",
    "min_weight": 70.0,
    "max_weight": null,
    "name": "+70kg",
    "source_order": 94
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 95
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 96
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 97
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 98
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 99
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 100
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 101
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": null,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 102
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 103
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 104
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 105
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 106
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 70.0,
    "max_weight": 78.0,
    "name": "-78kg",
    "source_order": 107
  },
  {
    "age_group_name": "U21-\u0458\u0443\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 78.0,
    "max_weight": null,
    "name": "+78kg",
    "source_order": 108
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 109
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 110
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 111
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 112
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 113
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 114
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 115
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": null,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 116
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 117
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 118
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 119
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 120
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 70.0,
    "max_weight": 78.0,
    "name": "-78kg",
    "source_order": 121
  },
  {
    "age_group_name": "U23-\u043f\u043e\u043c\u043b\u0430\u0434\u0438 \u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 78.0,
    "max_weight": null,
    "name": "+78kg",
    "source_order": 122
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 123
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 124
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 125
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 126
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 127
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 128
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 129
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": null,
    "max_weight": 48.0,
    "name": "-48kg",
    "source_order": 130
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 48.0,
    "max_weight": 52.0,
    "name": "-52kg",
    "source_order": 131
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 52.0,
    "max_weight": 57.0,
    "name": "-57kg",
    "source_order": 132
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 57.0,
    "max_weight": 63.0,
    "name": "-63kg",
    "source_order": 133
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 63.0,
    "max_weight": 70.0,
    "name": "-70kg",
    "source_order": 134
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 70.0,
    "max_weight": 78.0,
    "name": "-78kg",
    "source_order": 135
  },
  {
    "age_group_name": "\u0441\u0435\u043d\u0438\u043e\u0440\u0438",
    "gender": "\u0416",
    "min_weight": 78.0,
    "max_weight": null,
    "name": "+78kg",
    "source_order": 136
  },
  {
    "age_group_name": "F1/M1 30-34-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 137
  },
  {
    "age_group_name": "F1/M1 30-34-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 138
  },
  {
    "age_group_name": "F1/M1 30-34-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 139
  },
  {
    "age_group_name": "F1/M1 30-34-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 140
  },
  {
    "age_group_name": "F1/M1 30-34-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 141
  },
  {
    "age_group_name": "F1/M1 30-34-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 142
  },
  {
    "age_group_name": "F1/M1 30-34-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 143
  },
  {
    "age_group_name": "F2/M2 35-39-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 144
  },
  {
    "age_group_name": "F2/M2 35-39-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 145
  },
  {
    "age_group_name": "F2/M2 35-39-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 146
  },
  {
    "age_group_name": "F2/M2 35-39-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 147
  },
  {
    "age_group_name": "F2/M2 35-39-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 148
  },
  {
    "age_group_name": "F2/M2 35-39-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 149
  },
  {
    "age_group_name": "F2/M2 35-39-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 150
  },
  {
    "age_group_name": "F3/M3 40-44-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 151
  },
  {
    "age_group_name": "F3/M3 40-44-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 152
  },
  {
    "age_group_name": "F3/M3 40-44-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 153
  },
  {
    "age_group_name": "F3/M3 40-44-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 154
  },
  {
    "age_group_name": "F3/M3 40-44-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 155
  },
  {
    "age_group_name": "F3/M3 40-44-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 156
  },
  {
    "age_group_name": "F3/M3 40-44-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 157
  },
  {
    "age_group_name": "F4/M4 45-49-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 158
  },
  {
    "age_group_name": "F4/M4 45-49-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 159
  },
  {
    "age_group_name": "F4/M4 45-49-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 160
  },
  {
    "age_group_name": "F4/M4 45-49-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 161
  },
  {
    "age_group_name": "F4/M4 45-49-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 162
  },
  {
    "age_group_name": "F4/M4 45-49-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 163
  },
  {
    "age_group_name": "F4/M4 45-49-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 164
  },
  {
    "age_group_name": "F5/M5 50-54-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 165
  },
  {
    "age_group_name": "F5/M5 50-54-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 166
  },
  {
    "age_group_name": "F5/M5 50-54-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 167
  },
  {
    "age_group_name": "F5/M5 50-54-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 168
  },
  {
    "age_group_name": "F5/M5 50-54-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 169
  },
  {
    "age_group_name": "F5/M5 50-54-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 170
  },
  {
    "age_group_name": "F5/M5 50-54-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 171
  },
  {
    "age_group_name": "F6/M6 55-59-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 172
  },
  {
    "age_group_name": "F6/M6 55-59-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 173
  },
  {
    "age_group_name": "F6/M6 55-59-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 174
  },
  {
    "age_group_name": "F6/M6 55-59-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 175
  },
  {
    "age_group_name": "F6/M6 55-59-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 176
  },
  {
    "age_group_name": "F6/M6 55-59-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 177
  },
  {
    "age_group_name": "F6/M6 55-59-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 178
  },
  {
    "age_group_name": "F7/M7 60-64-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 179
  },
  {
    "age_group_name": "F7/M7 60-64-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 180
  },
  {
    "age_group_name": "F7/M7 60-64-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 181
  },
  {
    "age_group_name": "F7/M7 60-64-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 182
  },
  {
    "age_group_name": "F7/M7 60-64-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 183
  },
  {
    "age_group_name": "F7/M7 60-64-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 184
  },
  {
    "age_group_name": "F7/M7 60-64-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 185
  },
  {
    "age_group_name": "F8/M8 65-69-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 186
  },
  {
    "age_group_name": "F8/M8 65-69-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 187
  },
  {
    "age_group_name": "F8/M8 65-69-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 188
  },
  {
    "age_group_name": "F8/M8 65-69-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 189
  },
  {
    "age_group_name": "F8/M8 65-69-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 190
  },
  {
    "age_group_name": "F8/M8 65-69-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 191
  },
  {
    "age_group_name": "F8/M8 65-69-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 100.0,
    "max_weight": null,
    "name": "+100kg",
    "source_order": 192
  },
  {
    "age_group_name": "F9/M9 70+-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": null,
    "max_weight": 60.0,
    "name": "-60kg",
    "source_order": 193
  },
  {
    "age_group_name": "F9/M9 70+-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 60.0,
    "max_weight": 66.0,
    "name": "-66kg",
    "source_order": 194
  },
  {
    "age_group_name": "F9/M9 70+-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 66.0,
    "max_weight": 73.0,
    "name": "-73kg",
    "source_order": 195
  },
  {
    "age_group_name": "F9/M9 70+-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 73.0,
    "max_weight": 81.0,
    "name": "-81kg",
    "source_order": 196
  },
  {
    "age_group_name": "F9/M9 70+-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 81.0,
    "max_weight": 90.0,
    "name": "-90kg",
    "source_order": 197
  },
  {
    "age_group_name": "F9/M9 70+-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
    "gender": "M",
    "min_weight": 90.0,
    "max_weight": 100.0,
    "name": "-100kg",
    "source_order": 198
  },
  {
    "age_group_name": "F9/M9 70+-\u0432\u0435\u0442\u0435\u0440\u0430\u043d\u0438",
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
join public.age_groups age_group on age_group.name = source.age_group_name;

-- Verification before commit.
select count(*) as age_groups_count
from public.age_groups;

select count(*) as weight_categories_count
from public.weight_categories;

select name, min_age, max_age
from public.age_groups
order by min_age nulls last, name;

commit;
