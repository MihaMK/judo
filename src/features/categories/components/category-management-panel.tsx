"use client";

import { useActionState, useMemo, useState } from "react";
import { Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { AgeCategoryGroup, WeightCategory } from "../domain/category";
import {
  createAgeGroupAction,
  createWeightCategoryAction,
  toggleAgeGroupAction,
  toggleWeightCategoryAction,
  updateAgeGroupAction,
  updateWeightCategoryAction
} from "../server/actions";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { cn } from "@/shared/lib/cn";

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
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(groups[0]?.id ?? "");
  const [ageState, ageAction, isSavingAge] = useActionState(createAgeGroupAction, initialState);

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return groups.filter((group) => {
      const matchesType = typeFilter === "all" || group.categoryType === typeFilter;
      const matchesQuery = !normalized || `${group.name} ${group.code}`.toLowerCase().includes(normalized);
      return matchesType && matchesQuery;
    });
  }, [groups, query, typeFilter]);

  const selectedGroup = groups.find((group) => group.id === selectedId) ?? filteredGroups[0] ?? groups[0] ?? null;
  const maleWeights = selectedGroup?.weights.filter((weight) => weight.gender === "M") ?? [];
  const femaleWeights = selectedGroup?.weights.filter((weight) => weight.gender === "F") ?? [];

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-subdued/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-card border border-border bg-surface">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Возрасни групи</h2>
              <p className="text-xs text-muted-foreground">Excel foundation: Weights</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Пребарај категорија" className="pl-9" />
            </div>
            <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">Сите типови</option>
              <option value="youth">Млади</option>
              <option value="senior">Сениори</option>
              <option value="veteran">Ветерани</option>
              <option value="general">Општо</option>
            </Select>
          </div>
        </div>

        <div className="max-h-[620px] overflow-y-auto p-2">
          {filteredGroups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedId(group.id)}
              className={cn(
                "mb-1 w-full rounded-card border p-3 text-left transition-colors duration-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                selectedGroup?.id === group.id
                  ? "border-primary/30 bg-primary text-primary-foreground shadow-soft"
                  : "border-transparent hover:border-border hover:bg-muted/60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{group.name}</p>
                  <p className={cn("mt-1 text-xs", selectedGroup?.id === group.id ? "text-primary-foreground/75" : "text-muted-foreground")}>
                    {group.weights.length} тежински категории
                  </p>
                </div>
                <StatusBadge active={group.isActive} />
              </div>
            </button>
          ))}
        </div>

        <form action={ageAction} className="border-t border-border bg-subdued/40 p-4">
          <h3 className="text-sm font-semibold text-foreground">Додај возрасна група</h3>
          <div className="mt-3 grid gap-2">
            <Input name="name" placeholder="Име" />
            <Input name="code" placeholder="Код" />
            <div className="grid grid-cols-2 gap-2">
              <Input name="minAge" type="number" placeholder="Мин. возраст" />
              <Input name="maxAge" type="number" placeholder="Макс. возраст" />
            </div>
            <Input name="displayOrder" type="number" placeholder="Редослед" />
            <Select name="categoryType" defaultValue="youth">
              <option value="youth">Млади</option>
              <option value="senior">Сениори</option>
              <option value="veteran">Ветерани</option>
              <option value="general">Општо</option>
            </Select>
            <button className="inline-flex min-h-control items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft" disabled={isSavingAge}>
              Додај категорија
            </button>
            {ageState.message ? <p className="text-xs text-muted-foreground">{ageState.message}</p> : null}
          </div>
        </form>
      </Card>

      {selectedGroup ? (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-subdued/60 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">{selectedGroup.name}</h2>
                    <StatusBadge active={selectedGroup.isActive} />
                    <Badge tone="primary">{categoryTypeLabel(selectedGroup.categoryType)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Возраст: {formatAgeRange(selectedGroup.minAge, selectedGroup.maxAge)} · Код: {selectedGroup.code}
                  </p>
                </div>
                <form action={toggleAgeGroupAction}>
                  <input type="hidden" name="id" value={selectedGroup.id} />
                  <input type="hidden" name="isActive" value={String(selectedGroup.isActive)} />
                  <button className="inline-flex min-h-control items-center justify-center rounded-control border border-border bg-surface px-4 text-sm font-semibold text-foreground shadow-soft hover:bg-muted">
                    {selectedGroup.isActive ? "Деактивирај" : "Активирај"}
                  </button>
                </form>
              </div>
            </div>

            <form action={updateAgeGroupAction} className="grid gap-3 p-4 md:grid-cols-7">
              <input type="hidden" name="id" value={selectedGroup.id} />
              <Input name="name" defaultValue={selectedGroup.name} className="md:col-span-2" />
              <Input name="code" defaultValue={selectedGroup.code} />
              <Select name="categoryType" defaultValue={selectedGroup.categoryType}>
                <option value="youth">Млади</option>
                <option value="senior">Сениори</option>
                <option value="veteran">Ветерани</option>
                <option value="general">Општо</option>
              </Select>
              <Input name="minAge" type="number" defaultValue={selectedGroup.minAge ?? ""} />
              <Input name="maxAge" type="number" defaultValue={selectedGroup.maxAge ?? ""} />
              <Input name="displayOrder" type="number" defaultValue={selectedGroup.displayOrder} />
              <button className="inline-flex min-h-control items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft">
                Зачувај
              </button>
            </form>
          </Card>

          <WeightTable title="Машки категории" gender="M" ageGroupId={selectedGroup.id} weights={maleWeights} />
          <WeightTable title="Женски категории" gender="F" ageGroupId={selectedGroup.id} weights={femaleWeights} />

          <Card className="overflow-hidden">
            <div className="border-b border-border bg-subdued/60 p-4">
              <h3 className="text-sm font-semibold text-foreground">Годишни генерации</h3>
              <p className="mt-1 text-sm text-muted-foreground">Фондација за идна автоматска класификација на спортисти.</p>
            </div>
            <div className="p-4">
              <div className="grid gap-2 md:grid-cols-2">
                {selectedGroup.yearRules.map((rule) => (
                  <div key={rule.id} className="rounded-card border border-border bg-muted/30 p-3">
                    <p className="text-sm font-semibold text-foreground">{rule.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatAgeRange(rule.minAge, rule.maxAge)}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState icon={ShieldCheck} title="Нема категории" description="Применете ја миграцијата и seed податоците од Excel за да се појават категориите." />
      )}
    </div>
  );
}

function WeightTable({ title, gender, ageGroupId, weights }: { title: string; gender: "M" | "F"; ageGroupId: string; weights: WeightCategory[] }) {
  const [createState, createAction, isCreating] = useActionState(createWeightCategoryAction, initialState);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-subdued/60 p-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ред</TableHead>
            <TableHead>Ознака</TableHead>
            <TableHead className="text-right">Макс. кг</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Акција</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {weights.map((weight) => (
            <TableRow key={weight.id}>
              <TableCell>{weight.displayOrder}</TableCell>
              <TableCell>
                <form action={updateWeightCategoryAction} className="grid gap-2 md:grid-cols-[80px_90px_100px_90px_1fr]">
                  <input type="hidden" name="id" value={weight.id} />
                  <Input name="displayOrder" type="number" defaultValue={weight.displayOrder} />
                  <Select name="gender" defaultValue={weight.gender}>
                    <option value="M">М</option>
                    <option value="F">Ж</option>
                  </Select>
                  <Input name="label" defaultValue={weight.label} />
                  <Input name="maxWeightKg" type="number" step="0.1" defaultValue={weight.maxWeightKg ?? ""} />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input name="isOpenEnded" type="checkbox" defaultChecked={weight.isOpenEnded} />
                      отворена
                    </label>
                    <button className="rounded-control border border-border px-3 text-xs font-semibold hover:bg-muted">Зачувај</button>
                  </div>
                </form>
              </TableCell>
              <TableCell className="text-right">{weight.isOpenEnded ? "∞" : weight.maxWeightKg}</TableCell>
              <TableCell><StatusBadge active={weight.isActive} /></TableCell>
              <TableCell className="text-right">
                <form action={toggleWeightCategoryAction}>
                  <input type="hidden" name="id" value={weight.id} />
                  <input type="hidden" name="isActive" value={String(weight.isActive)} />
                  <button className="rounded-control border border-border px-3 py-1 text-xs font-semibold hover:bg-muted">
                    {weight.isActive ? "Деактивирај" : "Активирај"}
                  </button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <form action={createAction} className="grid gap-2 border-t border-border bg-subdued/40 p-4 md:grid-cols-[80px_120px_120px_100px_1fr_auto]">
        <input type="hidden" name="ageGroupId" value={ageGroupId} />
        <Select name="gender" defaultValue={gender}>
          <option value="M">М</option>
          <option value="F">Ж</option>
        </Select>
        <Input name="label" placeholder="-66" />
        <Input name="maxWeightKg" type="number" step="0.1" placeholder="66" />
        <Input name="displayOrder" type="number" placeholder="Ред" />
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input name="isOpenEnded" type="checkbox" />
          отворена категорија
        </label>
        <button className="inline-flex min-h-control items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground" disabled={isCreating}>
          Додај
        </button>
        {createState.message ? <p className="text-xs text-muted-foreground md:col-span-6">{createState.message}</p> : null}
      </form>
    </Card>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? "success" : "neutral"}>{active ? "Активна" : "Неактивна"}</Badge>;
}

function categoryTypeLabel(value: string) {
  const labels: Record<string, string> = {
    youth: "Млади",
    senior: "Сениори",
    veteran: "Ветерани",
    general: "Општо"
  };
  return labels[value] ?? value;
}

function formatAgeRange(minAge: number | null, maxAge: number | null) {
  if (minAge === null && maxAge === null) return "не е дефинирано";
  if (minAge === null) return `до ${maxAge} години`;
  if (maxAge === null) return `${minAge}+ години`;
  return `${minAge}-${maxAge} години`;
}
