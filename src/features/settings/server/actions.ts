"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/features/auth/server/session";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { mk } from "@/shared/i18n/mk";
import { updateClubLogoPath } from "./club-branding";

const CLUB_BRANDING_BUCKET = "club-branding";
const MAX_CLUB_LOGO_SIZE = 3 * 1024 * 1024;
const ALLOWED_CLUB_LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);

export type ClubLogoFormState = {
  message?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function updateClubLogoAction(
  _previousState: ClubLogoFormState,
  formData: FormData
): Promise<ClubLogoFormState> {
  const sessionContext = await getSessionContext();

  if (!sessionContext.isAuthenticated || !sessionContext.clubId) {
    return { message: mk.auth.loginRequired };
  }

  if (sessionContext.role !== "management") {
    return { message: "Само управата може да го ажурира логото на клубот." };
  }

  const logoFile = getLogoFile(formData);

  if (!logoFile) {
    return {
      message: "Изберете фотографија или лого.",
      fieldErrors: {
        logo: "Изберете фотографија или лого."
      }
    };
  }

  if (!ALLOWED_CLUB_LOGO_TYPES.has(logoFile.type)) {
    return {
      message: "Проверете го форматот на логото.",
      fieldErrors: {
        logo: "Дозволени се SVG, PNG, JPG или WEBP датотеки."
      }
    };
  }

  if (logoFile.size > MAX_CLUB_LOGO_SIZE) {
    return {
      message: "Логото е преголемо.",
      fieldErrors: {
        logo: "Логото мора да биде најмногу 3MB."
      }
    };
  }

  try {
    const logoPath = await uploadClubLogo({
      clubId: sessionContext.clubId,
      file: logoFile
    });

    await updateClubLogoPath({
      clubId: sessionContext.clubId,
      logoPath
    });
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Неуспешно зачувување на логото."
    };
  }

  revalidatePath("/settings");
  revalidatePath("/today");
  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Логото е успешно зачувано."
  };
}

async function uploadClubLogo(input: { clubId: string; file: File }) {
  const admin = createAdminSupabaseClient();
  const extension = getLogoExtension(input.file);
  const logoPath = `clubs/${input.clubId}/logo${extension}`;
  const { error } = await admin.storage.from(CLUB_BRANDING_BUCKET).upload(logoPath, input.file, {
    cacheControl: "3600",
    contentType: input.file.type,
    upsert: true
  });

  if (error) {
    throw new Error(`Неуспешно зачувување на логото: ${error.message}`);
  }

  return logoPath;
}

function getLogoFile(formData: FormData) {
  const value = formData.get("logo");

  if (typeof File === "undefined" || !(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function getLogoExtension(file: File) {
  const extensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/svg+xml": ".svg"
  };

  return extensions[file.type] ?? "";
}
