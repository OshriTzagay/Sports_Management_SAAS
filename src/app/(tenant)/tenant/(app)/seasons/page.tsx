import { FormDialog } from "@/components/ui/form-dialog";
import { requireUser } from "@/features/tenant-auth";
import { listSeasons } from "@/features/seasons";
import { SeasonList } from "@/features/seasons/season-list";
import { SeasonStatusInfo } from "@/features/seasons/season-status-info";
import { CreateSeasonForm } from "@/features/seasons/create-season-form";

export default async function SeasonsPage() {
  await requireUser();
  const seasons = await listSeasons();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-text-primary text-xl font-bold">עונות</h1>
        <div className="flex items-center gap-2">
          <SeasonStatusInfo />
          <FormDialog triggerLabel="+ עונה חדשה" title="עונה חדשה">
            <CreateSeasonForm seasons={seasons} />
          </FormDialog>
        </div>
      </div>
      <SeasonList seasons={seasons} />
    </div>
  );
}
