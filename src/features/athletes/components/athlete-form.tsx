"use client";

import Link from "next/link";
import { Camera, Image as ImageIcon } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import type { AgeCategoryGroup, BeltRank } from "@/features/categories/domain/category";
import { calculateAthleteCategory } from "@/features/athletes/server/category-logic";
import type { AthleteFormState } from "@/features/athletes/server/actions";
import type { AthleteProfileView, TrainingGroup } from "../domain/athlete";
import { Avatar } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { mk } from "@/shared/i18n/mk";
import { formatDateMk } from "@/shared/lib/date-format";

type AthleteFormProps = {
  action: (previousState: AthleteFormState, formData: FormData) => Promise<AthleteFormState>;
  groups: TrainingGroup[];
  ageGroups: AgeCategoryGroup[];
  beltRanks: BeltRank[];
  athlete?: AthleteProfileView;
};

const initialState: AthleteFormState = {};
const fallbackBeltOptions = ["Бел", "Жолт", "Портокалов", "Зелен", "Син", "Кафеав", "Црн"];

export function AthleteForm({ action, groups, ageGroups, beltRanks, athlete }: AthleteFormProps) {
  void ageGroups;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const nameParts = splitName(athlete?.fullName ?? "");
  const [birthDate, setBirthDate] = useState(athlete?.birthDate ?? "");
  const [birthDateInput, setBirthDateInput] = useState(athlete?.birthDate ? formatDateMk(athlete.birthDate) : "");
  const [gender, setGender] = useState<"M" | "Ж">(athlete?.gender ?? "M");
  const [weight, setWeight] = useState(athlete?.weight === null || athlete?.weight === undefined ? "" : String(athlete.weight));
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoCapture, setPhotoCapture] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [categoryPreview, setCategoryPreview] = useState({
    ageLabel: "",
    ageGroupLabel: "",
    weightCategoryLabel: ""
  });
  const isEdit = Boolean(athlete);
  const beltRankOptions = [...beltRanks].sort((first, second) => first.rankOrder - second.rankOrder);
  const canResolveCategory = Boolean(parseDate(birthDate));
  const visibleCategoryPreview = canResolveCategory
    ? categoryPreview
    : {
        ageLabel: "",
        ageGroupLabel: "",
        weightCategoryLabel: ""
      };

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);
  useEffect(() => {
    let isCurrent = true;
    const parsedWeight = weight.trim() ? Number(weight) : null;

    if (!parseDate(birthDate)) {
      return;
    }

    calculateAthleteCategory({
      birthDate,
      gender,
      weight: parsedWeight !== null && Number.isFinite(parsedWeight) && parsedWeight > 0 ? parsedWeight : null
    })
      .then((result) => {
        if (!isCurrent) {
          return;
        }

        setCategoryPreview({
          ageLabel: result.age === null ? "" : `${result.age} години`,
          ageGroupLabel: result.ageGroupName,
          weightCategoryLabel: result.weightCategoryName
        });
      })
      .catch(() => {
        if (!isCurrent) {
          return;
        }

        setCategoryPreview({
          ageLabel: "",
          ageGroupLabel: "",
          weightCategoryLabel: ""
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [birthDate, gender, weight]);

  function openPhotoInput(useCamera: boolean) {
    setPhotoCapture(useCamera);
    window.setTimeout(() => photoInputRef.current?.click(), 0);
  }
  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);

    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    setPhotoPreviewUrl(nextPreviewUrl);
  }
  return (
    <form action={formAction} className="mx-auto max-w-5xl space-y-lg">
      <Card variant="elevated" className="overflow-hidden">
        <CardHeader className="border-b border-border bg-subdued/60">
          <CardTitle>Фотографија</CardTitle>
          <CardDescription>Опционална фотографија за профилот и брза идентификација.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-md p-md sm:flex-row sm:items-center">
          <Avatar src={photoPreviewUrl ?? athlete?.photoUrl} name={athlete?.fullName ?? "Judo Drim"} size="xl" />
          <div className="min-w-0 flex-1 space-y-sm">
            <p className="text-sm font-semibold text-foreground">Избери фотографија</p>
            <p className="text-caption text-muted-foreground">
              Сликајте нова фотографија со камера или изберете постоечка од галерија.
            </p>
            <div className="grid gap-sm sm:grid-cols-2">
              <Button type="button" variant="secondary" onClick={() => openPhotoInput(true)}>
                <Camera className="h-4 w-4" aria-hidden="true" />
                Сликај со камера
              </Button>
              <Button type="button" variant="secondary" onClick={() => openPhotoInput(false)}>
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
                Избери од галерија
              </Button>
            </div>
            <input
              ref={photoInputRef}
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture={photoCapture ? "environment" : undefined}
              className="hidden"
              onChange={handlePhotoChange}
              aria-invalid={Boolean(state.fieldErrors?.photo)}
            />
            {state.fieldErrors?.photo ? <p className="text-caption text-danger-foreground">{state.fieldErrors.photo}</p> : null}
            <p className="text-caption text-muted-foreground">JPEG, PNG или WEBP до 3MB.</p>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated" className="overflow-hidden">
        <CardHeader className="border-b border-border bg-subdued/60">
          <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Основни податоци</CardTitle>
              <CardDescription>Основни идентификациски податоци за спортистот.</CardDescription>
            </div>
            <Badge tone="primary">Автоматска категорија</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-md p-md md:grid-cols-2">
          <FormField label="Име" htmlFor="firstName" error={state.fieldErrors?.firstName}>
            <Input id="firstName" name="firstName" defaultValue={nameParts.firstName} aria-invalid={Boolean(state.fieldErrors?.firstName)} />
          </FormField>

          <FormField label="Презиме" htmlFor="lastName" error={state.fieldErrors?.lastName}>
            <Input id="lastName" name="lastName" defaultValue={nameParts.lastName} aria-invalid={Boolean(state.fieldErrors?.lastName)} />
          </FormField>

          <FormField label="Пол" htmlFor="gender" error={state.fieldErrors?.gender} hint="Полот се користи за автоматска категоризација и се зачувува во профилот.">
            <Select id="gender" name="gender" value={gender} onChange={(event) => setGender(event.target.value as "M" | "Ж")} aria-invalid={Boolean(state.fieldErrors?.gender)}>
              <option value="M">Машки</option>
              <option value="Ж">Женски</option>
            </Select>
          </FormField>

          <FormField label="Датум на раѓање" htmlFor="birthDateInput" error={state.fieldErrors?.birthDate} hint="Формат: dd.mm.yyyy">
            <input type="hidden" name="birthDate" value={birthDate} />
            <Input
              id="birthDateInput"
              type="text"
              inputMode="numeric"
              value={birthDateInput}
              onBlur={() => {
                if (birthDate) {
                  setBirthDateInput(formatDateMk(birthDate));
                }
              }}
              onChange={(event) => {
                const value = event.target.value;
                setBirthDateInput(value);
                setBirthDate(parseDisplayDate(value) ?? "");
              }}
              placeholder="10.05.2015"
              aria-invalid={Boolean(state.fieldErrors?.birthDate)}
            />
          </FormField>

          <div className="rounded-card border border-border bg-muted/45 p-md md:col-span-2">
            <p className="text-caption font-semibold uppercase tracking-[0.16em] text-muted-foreground">Автоматска пресметка</p>
            <div className="mt-sm grid gap-sm md:grid-cols-3">
              <ReadOnlyPreview label="Возраст" value={visibleCategoryPreview.ageLabel} />
              <ReadOnlyPreview label="Возрасна група" value={visibleCategoryPreview.ageGroupLabel} />
              <ReadOnlyPreview label="Тежинска категорија" value={visibleCategoryPreview.weightCategoryLabel} />
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
          <FormField label="Тежина (kg)" htmlFor="weight">
            <Input
              id="weight"
              name="weight"
              type="number"
              min={0}
              step="0.1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="Пр. 42.5"
            />
          </FormField>

          {beltRankOptions.length > 0 ? (
            <FormField label="Појас" htmlFor="beltRankId">
              <Select id="beltRankId" name="beltRankId" defaultValue={athlete?.beltRankId ?? ""}>
                <option value="">Без внесен појас</option>
                {beltRankOptions.map((rank) => (
                  <option key={rank.id} value={rank.id}>
                    {rank.name}
                  </option>
                ))}
              </Select>
            </FormField>
          ) : (
            <FormField label="Појас" htmlFor="currentBelt">
              <Select id="currentBelt" name="currentBelt" defaultValue={normalizeBelt(athlete?.currentBelt)}>
                {fallbackBeltOptions.map((belt) => (
                  <option key={belt} value={belt}>
                    {belt}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

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

          <FormField label="Белешки" htmlFor="notes" className="md:col-span-2" hint={mk.common.optional}>
            <Textarea id="notes" name="notes" defaultValue={athlete?.profileSummary ?? ""} />
          </FormField>
        </CardContent>
      </Card>

      {!isEdit ? (
        <Card variant="elevated" className="overflow-hidden">
          <CardHeader className="border-b border-border bg-subdued/60">
            <CardTitle>Родител / Старател</CardTitle>
            <CardDescription>Во V1 се внесува точно еден примарен контакт.</CardDescription>
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

function ReadOnlyPreview({ label, value }: { label: string; value: string }) {
  return (
    <label className="block space-y-xs">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <Input value={value} readOnly placeholder="" aria-label={label} />
    </label>
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

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDisplayDate(value: string) {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return parseDate(trimmed) ? trimmed : null;
  }

  const match = /^(\d{2})[./](\d{2})[./](\d{4})$/.exec(trimmed);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const isoDate = `${year}-${month}-${day}`;
  return parseDate(isoDate) ? isoDate : null;
}

function normalizeBelt(value?: string) {
  if (!value) {
    return "Бел";
  }

  return fallbackBeltOptions.includes(value) ? value : "Бел";
}
