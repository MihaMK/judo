"use client";

import { useActionState, useMemo, useState } from "react";
import { Edit3, Mail, MessageCircle, Phone, Save, X } from "lucide-react";
import { updateGuardianAction, type GuardianFormState } from "@/features/athletes/server/actions";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type { GuardianSummary } from "../domain/athlete";

type GuardianContactCardProps = {
  athleteId: string;
  athleteName: string;
  guardian: GuardianSummary | null;
  canManage: boolean;
};

type ContactChannel = "sms" | "viber" | "whatsapp" | "email";

const initialGuardianState: GuardianFormState = {};

export function GuardianContactCard({ athleteId, athleteName, guardian, canManage }: GuardianContactCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ContactChannel | null>(null);
  const [message, setMessage] = useState(() => buildDefaultMessage(athleteName));
  const [state, formAction, isPending] = useActionState(
    guardian ? updateGuardianAction.bind(null, athleteId, guardian.id) : emptyGuardianAction,
    initialGuardianState
  );

  const contactHref = useMemo(() => {
    if (!guardian || !selectedChannel) {
      return "#";
    }

    return buildContactHref({
      channel: selectedChannel,
      phone: guardian.phone,
      email: guardian.email,
      athleteName,
      message
    });
  }, [athleteName, guardian, message, selectedChannel]);

  if (!guardian) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Родител / Старател</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Phone}
            title="Нема поврзан родител"
            description="Кога ќе се поврзе родител или старател, контактите ќе се појават овде."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-md">
          <CardTitle>Родител / Старател</CardTitle>
          {canManage ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditing((value) => !value)}>
              {isEditing ? <X className="h-4 w-4" aria-hidden="true" /> : <Edit3 className="h-4 w-4" aria-hidden="true" />}
              {isEditing ? "Откажи" : "Уреди"}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-md">
        {isEditing ? (
          <form action={formAction} className="space-y-md rounded-card border border-border bg-muted/45 p-md">
            <label className="block space-y-xs">
              <span className="text-sm font-semibold text-foreground">Име и презиме</span>
              <Input
                name="guardianFullName"
                defaultValue={guardian.fullName}
                aria-invalid={Boolean(state.fieldErrors?.guardianFullName)}
              />
              {state.fieldErrors?.guardianFullName ? <span className="text-caption text-danger-foreground">{state.fieldErrors.guardianFullName}</span> : null}
            </label>
            <label className="block space-y-xs">
              <span className="text-sm font-semibold text-foreground">Телефон</span>
              <Input
                name="guardianPhone"
                defaultValue={guardian.phone}
                aria-invalid={Boolean(state.fieldErrors?.guardianPhone)}
              />
              {state.fieldErrors?.guardianPhone ? <span className="text-caption text-danger-foreground">{state.fieldErrors.guardianPhone}</span> : null}
            </label>
            <label className="block space-y-xs">
              <span className="text-sm font-semibold text-foreground">Email</span>
              <Input
                name="guardianEmail"
                type="email"
                defaultValue={guardian.email ?? ""}
                aria-invalid={Boolean(state.fieldErrors?.guardianEmail)}
              />
              {state.fieldErrors?.guardianEmail ? <span className="text-caption text-danger-foreground">{state.fieldErrors.guardianEmail}</span> : null}
            </label>

            {state.message ? (
              <p className={state.ok ? "text-sm font-medium text-success-foreground" : "text-sm font-medium text-warning-foreground"}>
                {state.message}
              </p>
            ) : null}

            <Button type="submit" isLoading={isPending}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Зачувај родител
            </Button>
          </form>
        ) : (
          <div className="rounded-card border border-border bg-muted/45 p-md">
            <p className="text-section-title font-semibold text-foreground">{guardian.fullName}</p>
            <div className="mt-sm grid gap-xs text-body text-muted-foreground">
              <p>
                Телефон: <span className="font-medium text-foreground">{guardian.phone}</span>
              </p>
              <p>
                Email: <span className="font-medium text-foreground">{guardian.email ?? "Нема податок"}</span>
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-sm sm:grid-cols-4">
          <ContactChannelButton channel="sms" selectedChannel={selectedChannel} setSelectedChannel={setSelectedChannel} disabled={!guardian.phone} />
          <ContactChannelButton channel="viber" selectedChannel={selectedChannel} setSelectedChannel={setSelectedChannel} disabled={!guardian.phone} />
          <ContactChannelButton channel="whatsapp" selectedChannel={selectedChannel} setSelectedChannel={setSelectedChannel} disabled={!guardian.phone} />
          <ContactChannelButton channel="email" selectedChannel={selectedChannel} setSelectedChannel={setSelectedChannel} disabled={!guardian.email} />
        </div>

        {selectedChannel ? (
          <div className="rounded-card border border-border bg-surface p-md shadow-soft">
            <label className="block space-y-xs">
              <span className="text-sm font-semibold text-foreground">Порака</span>
              <Textarea value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-28" />
            </label>
            <div className="mt-md flex flex-col gap-sm sm:flex-row">
              <a
                href={contactHref}
                target={selectedChannel === "whatsapp" ? "_blank" : undefined}
                rel={selectedChannel === "whatsapp" ? "noreferrer" : undefined}
                className="inline-flex min-h-control flex-1 items-center justify-center gap-2 rounded-button bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-colors duration-ui hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                Испрати / отвори
              </a>
              <Button type="button" variant="ghost" onClick={() => setSelectedChannel(null)}>
                Откажи
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ContactChannelButton({
  channel,
  selectedChannel,
  setSelectedChannel,
  disabled
}: {
  channel: ContactChannel;
  selectedChannel: ContactChannel | null;
  setSelectedChannel: (channel: ContactChannel) => void;
  disabled: boolean;
}) {
  const Icon = channel === "email" ? Mail : channel === "sms" ? Phone : MessageCircle;
  const label = channel === "sms" ? "SMS" : channel === "email" ? "Email" : channel === "whatsapp" ? "WhatsApp" : "Viber";

  return (
    <Button
      type="button"
      variant={selectedChannel === channel ? "primary" : "secondary"}
      size="sm"
      disabled={disabled}
      onClick={() => setSelectedChannel(channel)}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </Button>
  );
}

function buildContactHref({
  channel,
  phone,
  email,
  athleteName,
  message
}: {
  channel: ContactChannel;
  phone: string;
  email?: string;
  athleteName: string;
  message: string;
}) {
  const normalizedPhone = phone.replace(/\s/g, "");
  const digitsOnlyPhone = phone.replace(/\D/g, "");

  if (channel === "sms") {
    return `sms:${normalizedPhone}?&body=${encodeURIComponent(message)}`;
  }

  if (channel === "whatsapp") {
    return `https://wa.me/${digitsOnlyPhone}?text=${encodeURIComponent(message)}`;
  }

  if (channel === "email") {
    const subject = `Информација за ${athleteName}`;
    return `mailto:${email ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  }

  return `viber://chat?number=${digitsOnlyPhone}&text=${encodeURIComponent(message)}`;
}

function buildDefaultMessage(athleteName: string) {
  return `Почитувани, ве контактираме од џудо клубот во врска со ${athleteName}.`;
}

async function emptyGuardianAction(previousState: GuardianFormState, formData: FormData): Promise<GuardianFormState> {
  void previousState;
  void formData;

  return { ok: false, message: "Нема поврзан родител." };
}
