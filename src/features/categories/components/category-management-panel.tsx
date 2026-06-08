"use client";

import { useActionState, useMemo, useState } from "react";
import { Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { cn } from "@/shared/lib/cn";
import type { AgeCategoryGroup, WeightCategory } from "../domain/category";
import {
  createAgeGroupAction,
  createWeightCategoryAction,
  toggleAgeGroupAction,
  toggleWeightCategoryAction,
  updateAgeGroupAction,
  updateWeightCategoryAction
} from "../server/actions";

type CategoryManagementPanelProps = {
  groups: AgeCategoryGroup[];
};

type ActionState = {
  message?: string;
  ok?: boolean;
};

const initialState: ActionState = {};

export function CategoryManagementPanel({ groups }: CategoryManagementPanelProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(groups[0]?.id ?? "");
  const [ageState, ageAction, isSavingAge] = useActionState(createAgeGroupAction, initialState);

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("mk-MK");
    return groups.filter((group) => !normalized || group.name.toLocaleLowerCase("mk-MK").includes(normalized));
  }, [groups, query]);

  const selectedGroup = groups.find((group) => group.id === selectedId) ?? filteredGroups[0] ?? groups[0] ?? null;
  const maleWeights = selectedGroup?.weights.filter((weight) => weight.gender === "M") ?? [];
  const femaleWeights = selectedGroup?.weights.filter((weight) => weight.gender === "Ж") ?? [];

  return (
    <div className="grid gap-lg xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card variant="elevated" className="overflow-hidden">
        <CardHeader className="border-b border-border bg-subdued/60">
          <div className="flex items-center gap-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-card border border-border bg-surface">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Возрасни категории</CardTitle>
              <p className="text-caption text-muted-foreground">Семантичка основа за автоматска категоризација</p>
            </div>
          </div>
          <div className="relative pt-sm">
            <Search className="pointer-events-none absolute left-3 top-[calc(50%+4px)] h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Пребарај категорија" className="pl-9" />
          </div>
        </CardHeader>

        <CardContent className="max-h-[560px] overflow-y-auto p-sm">
          {filteredGroups.length > 0 ? (
            <div className="grid gap-xs">
              {filteredGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedId(group.id)}
                  className={cn(
                    "rounded-card border p-sm text-left transition-colors duration-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                    selectedGroup?.id === group.id
                      ? "border-primary/30 bg-primary text-primary-foreground shadow-soft"
                      : "border-transparent hover:border-border hover:bg-muted/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-sm">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{group.name}</p>
                      <p className={cn("mt-1 text-xs", selectedGroup?.id === group.id ? "text-primary-foreground/75" : "text-muted-foreground")}>
                        {formatAgeRange(group.minAge, group.maxAge)} / {group.weights.length} тежински категории
                      </p>
                    </div>
                    <StatusBadge active={group.isActive} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState icon={ShieldCheck} title="Нема категории" description="Додадете возрасна категорија за да започне класификацијата." />
          )}
        </CardContent>

        <form action={ageAction} className="border-t border-border bg-subdued/40 p-md">
          <h3 className="text-sm font-semibold text-foreground">Додади возрасна категорија</h3>
          <div className="mt-sm grid gap-sm">
            <Input name="name" placeholder="Име" />
            <div className="grid grid-cols-2 gap-sm">
              <Input name="minAge" type="number" placeholder="Мин. возраст" />
              <Input name="maxAge" type="number" placeholder="Макс. возраст" />
            </div>
            <Input name="displayOrder" type="number" placeholder="Редослед" />
            <Button type="submit" isLoading={isSavingAge}>
              Додади категорија
            </Button>
            {ageState.message ? <p className="text-sm text-muted-foreground">{ageState.message}</p> : null}
          </div>
        </form>
      </Card>

      {selectedGroup ? (
        <div className="space-y-lg">
          <Card variant="elevated" className="overflow-hidden">
            <CardHeader className="border-b border-border bg-subdued/60">
              <div className="flex flex-col gap-md md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-sm">
                    <CardTitle>{selectedGroup.name}</CardTitle>
                    <StatusBadge active={selectedGroup.isActive} />
                  </div>
                  <p className="mt-xs text-body text-muted-foreground">
                    Возраст: {formatAgeRange(selectedGroup.minAge, selectedGroup.maxAge)}
                  </p>
                </div>
                <form action={toggleAgeGroupAction}>
                  <input type="hidden" name="id" value={selectedGroup.id} />
                  <input type="hidden" name="isActive" value={String(selectedGroup.isActive)} />
                  <Button type="submit" variant="secondary">
                    {selectedGroup.isActive ? "Деактивирај" : "Активирај"}
                  </Button>
                </form>
              </div>
            </CardHeader>

            <form action={updateAgeGroupAction} className="grid gap-sm p-md md:grid-cols-[minmax(180px,1fr)_120px_120px_120px_auto]">
              <input type="hidden" name="id" value={selectedGroup.id} />
              <Input name="name" defaultValue={selectedGroup.name} />
              <Input name="minAge" type="number" defaultValue={selectedGroup.minAge ?? ""} />
              <Input name="maxAge" type="number" defaultValue={selectedGroup.maxAge ?? ""} />
              <Input name="displayOrder" type="number" defaultValue={selectedGroup.displayOrder} />
              <Button type="submit">Зачувај</Button>
            </form>
          </Card>

          <WeightTable title="Машки категории" gender="M" ageGroupId={selectedGroup.id} weights={maleWeights} />
          <WeightTable title="Женски категории" gender="Ж" ageGroupId={selectedGroup.id} weights={femaleWeights} />
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="Нема возрасни категории"
          description="Применете ја migration фазата или внесете нови категории од управувачкиот панел."
        />
      )}
    </div>
  );
}

function WeightTable({
  title,
  gender,
  ageGroupId,
  weights
}: {
  title: string;
  gender: "M" | "Ж";
  ageGroupId: string;
  weights: WeightCategory[];
}) {
  const [createState, createAction, isCreating] = useActionState(createWeightCategoryAction, initialState);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-subdued/60">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ред</TableHead>
              <TableHead>Назив</TableHead>
              <TableHead className="text-right">Мин. kg</TableHead>
              <TableHead className="text-right">Макс. kg</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Акција</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weights.map((weight) => (
              <TableRow key={weight.id}>
                <TableCell>{weight.displayOrder}</TableCell>
                <TableCell>
                  <form action={updateWeightCategoryAction} className="grid gap-sm lg:grid-cols-[80px_80px_120px_120px_minmax(120px,1fr)_auto]">
                    <input type="hidden" name="id" value={weight.id} />
                    <Input name="displayOrder" type="number" defaultValue={weight.displayOrder} aria-label="Редослед" />
                    <Select name="gender" defaultValue={weight.gender} aria-label="Пол">
                      <option value="M">М</option>
                      <option value="Ж">Ж</option>
                    </Select>
                    <Input name="minWeight" type="number" step="0.1" defaultValue={weight.minWeight ?? ""} aria-label="Минимална тежина" />
                    <Input name="maxWeight" type="number" step="0.1" defaultValue={weight.maxWeight ?? ""} aria-label="Максимална тежина" />
                    <Input name="name" defaultValue={weight.name} aria-label="Назив" />
                    <Button type="submit" size="sm" variant="secondary">
                      Зачувај
                    </Button>
                  </form>
                </TableCell>
                <TableCell className="text-right">{weight.minWeight ?? "-"}</TableCell>
                <TableCell className="text-right">{weight.maxWeight ?? "∞"}</TableCell>
                <TableCell>
                  <StatusBadge active={weight.isActive} />
                </TableCell>
                <TableCell className="text-right">
                  <form action={toggleWeightCategoryAction}>
                    <input type="hidden" name="id" value={weight.id} />
                    <input type="hidden" name="isActive" value={String(weight.isActive)} />
                    <Button type="submit" size="sm" variant="secondary">
                      {weight.isActive ? "Деактивирај" : "Активирај"}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <form action={createAction} className="mt-md grid gap-sm border-t border-border pt-md md:grid-cols-[80px_120px_120px_minmax(140px,1fr)_120px_auto]">
          <input type="hidden" name="ageGroupId" value={ageGroupId} />
          <Select name="gender" defaultValue={gender} aria-label="Пол">
            <option value="M">М</option>
            <option value="Ж">Ж</option>
          </Select>
          <Input name="minWeight" type="number" step="0.1" placeholder="Мин. kg" />
          <Input name="maxWeight" type="number" step="0.1" placeholder="Макс. kg" />
          <Input name="name" placeholder="Назив, пр. -66 kg" />
          <Input name="displayOrder" type="number" placeholder="Ред" />
          <Button type="submit" isLoading={isCreating}>
            Додади
          </Button>
          {createState.message ? <p className="text-sm text-muted-foreground md:col-span-6">{createState.message}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? "success" : "neutral"}>{active ? "Активна" : "Неактивна"}</Badge>;
}

function formatAgeRange(minAge: number | null, maxAge: number | null) {
  if (minAge === null && maxAge === null) return "не е дефинирано";
  if (minAge === null) return `до ${maxAge} години`;
  if (maxAge === null) return `${minAge}+ години`;
  return `${minAge}-${maxAge} години`;
}
