"use client";

import { useActionState } from "react";
import { Building2, Upload } from "lucide-react";
import { updateClubLogoAction, type ClubLogoFormState } from "@/features/settings/server/actions";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type ClubBrandingFormProps = {
  clubName: string;
  logoUrl: string | null;
  canManage: boolean;
};

const initialState: ClubLogoFormState = {};

export function ClubBrandingForm({ clubName, logoUrl, canManage }: ClubBrandingFormProps) {
  const [state, formAction, isPending] = useActionState(updateClubLogoAction, initialState);

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="border-b border-border bg-subdued/60">
        <div className="flex items-start gap-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-slate-950 text-gold shadow-soft">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <CardTitle>Брендирање на клуб</CardTitle>
            <CardDescription>Лого кое се прикажува во навигацијата и клубскиот систем.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-md p-md">
        <div className="flex flex-col gap-md rounded-card border border-border bg-muted/45 p-md sm:flex-row sm:items-center">
          {logoUrl ? (
            <span className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gold/30 bg-white p-1 shadow-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={clubName} className="h-full w-full object-contain" />
            </span>
          ) : (
            <Avatar name={clubName} size="xl" className="h-20 w-20 border-gold/30 bg-gold text-gold-foreground" />
          )}
          <div className="min-w-0">
            <p className="text-card-title font-semibold text-foreground">{clubName}</p>
            <p className="mt-xs text-body leading-6 text-muted-foreground">
              {logoUrl ? "Моментално активно лого." : "Се користат иницијали додека не се додаде лого."}
            </p>
          </div>
        </div>

        <form action={formAction} encType="multipart/form-data" className="space-y-md">
          <FormField
            label="Лого"
            htmlFor="logo"
            error={state.fieldErrors?.logo}
            hint="SVG, PNG, JPG или WEBP до 3MB. Препорачано: квадратен знак или транспарентно PNG/SVG."
          >
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,image/webp"
              disabled={!canManage}
              aria-invalid={Boolean(state.fieldErrors?.logo)}
            />
          </FormField>

          {state.message ? (
            <div
              className={`rounded-card border p-sm text-body ${
                state.success
                  ? "border-success/50 bg-success/10 text-success-foreground"
                  : "border-warning/60 bg-warning/10 text-warning-foreground"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" isLoading={isPending} disabled={!canManage}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Зачувај лого
            </Button>
          </div>

          {!canManage ? (
            <p className="text-caption text-muted-foreground">
              Само управата може да го ажурира клубското лого.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
