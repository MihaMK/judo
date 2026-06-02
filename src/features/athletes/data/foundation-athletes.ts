import type { AthleteProfile, TrainingGroup } from "../domain/athlete";

export const foundationTrainingGroups: TrainingGroup[] = [
  {
    id: "group-juniors",
    name: "Помлада група",
    description: "Помлади спортисти и основна натпреварувачка подготовка.",
    trainingDays: "Понеделник, среда, петок"
  },
  {
    id: "group-advanced",
    name: "Напредна група",
    description: "Искусни натпреварувачи и тренинг со поголем интензитет.",
    trainingDays: "Вторник, четврток, сабота"
  }
];

export const foundationAthletes: AthleteProfile[] = [
  {
    id: "athlete-ana-stojanovska",
    fullName: "Ana Stojanovska",
    birthDate: "2014-05-12",
    birthYear: 2014,
    status: "active",
    groupId: "group-juniors",
    currentBelt: "Жолт појас",
    joinedAt: "2024-09-01",
    profileSummary: "Редовна спортистка од помладата група. Подготвена за идните процеси за присуство и натпревари.",
    guardians: [
      {
        id: "guardian-mila-stojanovska",
        fullName: "Mila Stojanovska",
        relationship: "mother",
        phone: "+389 70 000 101",
        email: "mila.parent@example.com",
        isPrimaryContact: true
      }
    ]
  },
  {
    id: "athlete-marko-petrov",
    fullName: "Marko Petrov",
    birthDate: "2012-03-21",
    birthYear: 2012,
    status: "active",
    groupId: "group-advanced",
    currentBelt: "Портокалов појас",
    joinedAt: "2023-02-15",
    profileSummary: "Спортист од напредната група. Профилот е подготвен за идно присуство и натпреварувачка историја.",
    guardians: [
      {
        id: "guardian-elena-petrova",
        fullName: "Elena Petrova",
        relationship: "mother",
        phone: "+389 70 000 102",
        email: "elena.parent@example.com",
        isPrimaryContact: true
      },
      {
        id: "guardian-viktor-petrov",
        fullName: "Viktor Petrov",
        relationship: "father",
        phone: "+389 70 000 103",
        isPrimaryContact: false
      }
    ]
  },
  {
    id: "athlete-luka-iliev",
    fullName: "Luka Iliev",
    birthDate: "2015-10-02",
    birthYear: 2015,
    status: "paused",
    groupId: "group-juniors",
    currentBelt: "Бел појас",
    joinedAt: "2025-01-10",
    profileSummary: "Привремено паузиран. Оперативната видливост останува, без процес за присуство во оваа фаза.",
    guardians: [
      {
        id: "guardian-sara-ilieva",
        fullName: "Sara Ilieva",
        relationship: "guardian",
        phone: "+389 70 000 104",
        isPrimaryContact: true
      }
    ]
  }
];
