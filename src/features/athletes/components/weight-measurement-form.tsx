"use client";

import { useActionState } from "react";
import { addWeightMeasurementAction, type WeightMeasurementFormState } from "@/features/athletes/server/actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/cn";

type WeightMeasurementFormProps = {
  athleteId: string;
  currentWeight?: number | null;
};

const initialState: WeightMeasurementFormState = {};

export function WeightMeasurementForm({ athleteId, currentWeight }: WeightMeasurementFormProps) {
  const [state, formAction, isPending] = useActionState(addWeightMeasurementAction.bind(null, athleteId), initialState);

  return (
    <form action={formAction} className="rounded-card border border-border bg-surface p-md shadow-soft">
      <div className="grid gap-sm sm:grid-cols-2">
        <label className="block space-y-xs">
          <span className="text-sm font-semibold text-foreground">Тежина (kg)</span>
          <Input
            name="weight"
            type="number"
            min={0}
            step="0.1"
            defaultValue={currentWeight ?? ""}
            placeholder="Пр. 74.5"
            aria-invalid={Boolean(state.fieldErrors?.weight)}
          />
          {state.fieldErrors?.weight ? <span className="text-caption text-danger-foreground">{state.fieldErrors.weight}</span> : null}
        </label>
        <label className="block space-y-xs">
          <span className="text-sm font-semibold text-foreground">Датум</span>
          <Input name="measuredAt" type="date" defaultValue={getTodayDate()} aria-invalid={Boolean(state.fieldErrors?.measuredAt)} />
          {state.fieldErrors?.measuredAt ? <span className="text-caption text-danger-foreground">{state.fieldErrors.measuredAt}</span> : null}
        </label>
        <label className="block space-y-xs sm:col-span-2">
          <span className="text-sm font-semibold text-foreground">Белешка</span>
          <Textarea name="note" className="min-h-20" placeholder="Опционална белешка" />
        </label>
      </div>

      {state.message ? (
        <p
          className={cn(
            "mt-md rounded-card border p-sm text-sm",
            state.ok
              ? "border-success/60 bg-success/10 text-success-foreground"
              : "border-warning/60 bg-warning/10 text-warning-foreground"
          )}
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" className="mt-md w-full" isLoading={isPending}>
        Додади мерење
      </Button>
    </form>
  );
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}
