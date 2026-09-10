"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SettingCategory } from "@prisma/client";
import { upsertSetting, deleteSetting } from "@/modules/settings/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Field";

export function SettingField({
  category,
  settingKey,
  label,
  initialValue,
  multiline,
}: {
  category: SettingCategory;
  settingKey: string;
  label: string;
  initialValue: string;
  multiline?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await upsertSetting(category, settingKey, value);
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <FormField label={label} htmlFor={settingKey}>
        {multiline ? (
          <Textarea id={settingKey} rows={3} value={value} onChange={(e) => setValue(e.target.value)} />
        ) : (
          <Input id={settingKey} value={value} onChange={(e) => setValue(e.target.value)} />
        )}
      </FormField>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </Button>
        {saved ? <span className="text-xs text-emerald-700">Saved</span> : null}
      </div>
    </form>
  );
}

export function GenericSettingsList({
  category,
  settings,
}: {
  category: SettingCategory;
  settings: { key: string; value: unknown }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  return (
    <div className="space-y-4">
      {settings.map((setting) => (
        <div key={setting.key} className="flex items-end gap-3">
          <SettingField
            category={category}
            settingKey={setting.key}
            label={setting.key}
            initialValue={String(setting.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await deleteSetting(category, setting.key);
                router.refresh();
              })
            }
          >
            Remove
          </Button>
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            await upsertSetting(category, newKey, newValue);
            setNewKey("");
            setNewValue("");
            router.refresh();
          });
        }}
        className="flex flex-wrap items-end gap-3 border-t border-border pt-4"
      >
        <FormField label="New key" htmlFor="newKey">
          <Input id="newKey" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
        </FormField>
        <FormField label="Value" htmlFor="newValue">
          <Input id="newValue" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
        </FormField>
        <Button type="submit" size="sm" disabled={isPending || !newKey.trim()}>
          Add setting
        </Button>
      </form>
    </div>
  );
}
