"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import type { AgeCategoryGroup } from "@/features/categories/domain/category";
import type { AthleteFormState } from "@/features/athletes/server/actions";
import type { AthleteProfileView, TrainingGroup } from "../domain/athlete";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { mk } from "@/shared/i18n/mk";

type AthleteFormProps = {
  action: (previousState: AthleteFormState, formData: FormData) => Promise<AthleteFormState>;
  groups: TrainingGroup[];
  ageGroups: AgeCategoryGroup[];
  athlete?: AthleteProfileView;
};

const initialState: AthleteFormState = {};
const beltOptions = ["Бел", "Жолт", "Портокалов", "Зелен", "Син", "Кафеав", "Црн"];

export function AthleteForm({ action, groups, ageGroups, athlete }: AthleteFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const nameParts = splitName(athlete?.fullName ?? "");
  const [birthDate, setBirthDate] = useState(athlete?.birthDate ?? "");
  const agePreview = useMemo(() => getAgePreview(birthDate, ageGroups), [ageGroups, birthDate]);
  const isEdit = Boolean(athlete);

  return (
    <form action={formAction} className="mx-auto max-w-5xl space-y-lg">
      <Card variant="elevated" className="overflow-hidden">
        <CardHeader className="border-b border-border bg-subdued/60">
          <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Основни податоци</CardTitle>
              <CardDescription>Основни идентификациски податоци за спортистот.</CardDescription>
            </div>
            <Badge tone="primary">System-driven age group</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-md p-md md:grid-cols-2">
          <FormField label="Име" htmlFor="firstName" error={state.fieldErrors?.firstName}>
            <Input id="firstName" name="firstName" defaultValue={nameParts.firstName} aria-invalid={Boolean(state.fieldErrors?.firstName)} />
          </FormField>

          <FormField label="Презиме" htmlFor="lastName" error={state.fieldErrors?.lastName}>
            <Input id="lastName" name="lastName" defaultValue={nameParts.lastName} aria-invalid={Boolean(state.fieldErrors?.lastName)} />
          </FormField>

          <FormField label="Пол" htmlFor="gender" hint="Полето бара athlete schema проширување и не се зачувува во V1.">
            <Select id="gender" name="gender" disabled defaultValue="">
              <option value="">Неевидентирано</option>
              <option value="male">Машки</option>
              <option value="female">Женски</option>
            </Select>
          </FormField>

          <FormField label="Датум на раѓање" htmlFor="birthDate" error={state.fieldErrors?.birthDate}>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              aria-invalid={Boolean(state.fieldErrors?.birthDate)}
            />
          </FormField>

          <div className="rounded-card border border-border bg-muted/45 p-md md:col-span-2">
            <p className="text-caption font-semibold uppercase tracking-[0.16em] text-muted-foreground">Автоматска пресметка</p>
            <div className="mt-sm grid gap-sm sm:grid-cols-2">
              <p className="text-body text-foreground">
                Возраст: <span className="font-semibold">{agePreview.ageLabel}</span>
              </p>
              <p className="text-body text-foreground">
                Возрасна група: <span className="font-semibold">{agePreview.groupLabel}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated" className="overflow-hidden">
        <CardHeader className="border-b border-border bg-subdued/60">
          <CardTitle>Спортски податоци</CardTitle>
          <CardDescription>Оперативни податоци за група, појас и спортски контекст.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-md p-md md:grid-cols-2">
          <FormField label="Тежина (kg)" htmlFor="weightKg" hint="Тежина не постои во тековната athlete schema и не се зачувува во V1.">
            <Input id="weightKg" name="weightKg" type="number" min={0} step="0.1" disabled placeholder="Schema pending" />
          </FormField>

          <FormField label="Појас" htmlFor="currentBelt">
            <Select id="currentBelt" name="currentBelt" defaultValue={normalizeBelt(athlete?.currentBelt)}>
              {beltOptions.map((belt) => (
                <option key={belt} value={belt}>
                  {belt}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Тренинг група" htmlFor="groupId">
            <Select id="groupId" name="groupId" defaultValue={athlete?.groupId ?? ""}>
              <option value="">Без група</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Статус" htmlFor="status" error={state.fieldErrors?.status}>
            <Select id="status" name="status" defaultValue={athlete?.status === "inactive" ? "inactive" : "active"} aria-invalid={Boolean(state.fieldErrors?.status)}>
              <option value="active">Активен</option>
              <option value="inactive">Неактивен</option>
            </Select>
          </FormField>

          <FormField label="Фотографија" htmlFor="photo" className="md:col-span-2" hint="Photo upload бара storage/persistence модел и е намерно одложен.">
            <Input id="photo" name="photo" type="file" accept="image/*" disabled />
          </FormField>

          <FormField label="Белешки" htmlFor="notes" className="md:col-span-2" hint={mk.common.optional}>
            <Textarea id="notes" name="notes" defaultValue={athlete?.profileSummary ?? ""} />
          </FormField>
        </CardContent>
      </Card>

      {!isEdit ? (
        <Card variant="elevated" className="overflow-hidden">
          <CardHeader className="border-b border-border bg-subdued/60">
            <CardTitle>Родител / Старател</CardTitle>
            <CardDescription>Во V1 се внесува точно еден родител или старател како примарен контакт.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-md p-md md:grid-cols-2">
            <FormField label="Име и презиме" htmlFor="guardianFullName" error={state.fieldErrors?.guardianFullName}>
              <Input id="guardianFullName" name="guardianFullName" aria-invalid={Boolean(state.fieldErrors?.guardianFullName)} />
            </FormField>

            <FormField label="Телефон" htmlFor="guardianPhone" error={state.fieldErrors?.guardianPhone}>
              <Input id="guardianPhone" name="guardianPhone" aria-invalid={Boolean(state.fieldErrors?.guardianPhone)} />
            </FormField>

            <FormField label="Email" htmlFor="guardianEmail" className="md:col-span-2" error={state.fieldErrors?.guardianEmail} hint={mk.common.optional}>
              <Input id="guardianEmail" name="guardianEmail" type="email" aria-invalid={Boolean(state.fieldErrors?.guardianEmail)} />
            </FormField>
          </CardContent>
        </Card>
      ) : null}

      {state.message ? <div className="rounded-card border border-warning/60 bg-warning p-md text-body text-warning-foreground">{state.message}</div> : null}

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <div className="flex flex-col-reverse gap-sm sm:flex-row sm:justify-end">
          <Link
            href={athlete ? `/athletes/${athlete.id}` : "/athletes"}
            className="inline-flex min-h-control items-center justify-center rounded-button border border-border bg-surface px-4 text-sm font-semibold text-foreground shadow-soft transition-colors duration-ui hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {mk.common.cancel}
          </Link>
          <Button type="submit" isLoading={isPending}>
            {athlete ? mk.athletes.updateAthlete : "Нов спортист"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return { firstName: parts[0] ?? "", lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ")
  };
}

function getAgePreview(birthDate: string, ageGroups: AgeCategoryGroup[]) {
  if (ageGroups.length === 0) {
    return {
      ageLabel: calculateAge(birthDate) === null ? "Внесете датум" : `${calculateAge(birthDate)} години`,
      groupLabel: "ќе се пресмета кога категориите се достапни"
    };
  }

  const age = calculateAge(birthDate);

  if (age === null) {
    return { ageLabel: "Внесете датум", groupLabel: "Ќе се пресмета автоматски" };
  }

  const group = ageGroups.find((item) => {
    if (!item.isActive) {
      return false;
    }

    const matchesMin = item.minAge === null || age >= item.minAge;
    const matchesMax = item.maxAge === null || age <= item.maxAge;
    return matchesMin && matchesMax;
  });

  return {
    ageLabel: `${age} години`,
    groupLabel: group?.name ?? "Нема дефинирана категорија"
  };
}

function calculateAge(birthDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return null;
  }

  const birth = new Date(`${birthDate}T00:00:00Z`);

  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
  const dayDiff = today.getUTCDate() - birth.getUTCDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

function normalizeBelt(value?: string) {
  if (!value) {
    return "Бел";
  }

  return beltOptions.includes(value) ? value : "Бел";
}
