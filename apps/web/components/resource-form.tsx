'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, LoaderCircle, X } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useToast } from './toast-provider';

export type ResourceKind = 'clients' | 'locations' | 'purchase-orders';
export type EditableRow = Record<string, unknown> & { id: string };

type ReferenceRow = {
  id: string;
  name: string;
  city?: string | null;
};

type Choice = { value: string; label: string };
type FieldDefinition = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select' | 'textarea';
  required?: boolean;
  min?: string;
  step?: string;
  choices?: Choice[];
};

type ResourceFormProps = {
  kind: ResourceKind;
  title: string;
  record: EditableRow | null;
  onCancel: () => void;
  onSaved: () => void;
};

function initialValues(kind: ResourceKind, record: EditableRow | null) {
  const values: Record<string, string> = {};
  const names = kind === 'clients'
    ? ['name', 'email', 'phone', 'status']
    : kind === 'locations'
      ? ['client_id', 'name', 'address', 'city', 'state', 'postal_code', 'country', 'status']
      : ['location_id', 'po_number', 'order_date', 'total_amount', 'status', 'notes'];

  for (const name of names) {
    const value = record?.[name];
    if (name === 'order_date' && typeof value === 'string') {
      values[name] = value.slice(0, 10);
    } else if (value !== null && value !== undefined) {
      values[name] = String(value);
    }
  }

  if (!record) {
    values.status = kind === 'purchase-orders' ? 'draft' : 'active';
    if (kind === 'purchase-orders') {
      values.order_date = new Date().toISOString().slice(0, 10);
    }
  }

  return values;
}

function fieldDefinitions(kind: ResourceKind, references: ReferenceRow[]): FieldDefinition[] {
  const statusChoices = kind === 'purchase-orders'
    ? [
        { value: 'draft', label: 'Draft' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'approved', label: 'Approved' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ]
    : [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ];

  if (kind === 'clients') {
    return [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'status', label: 'Status', type: 'select', choices: statusChoices },
    ];
  }

  if (kind === 'locations') {
    return [
      {
        name: 'client_id',
        label: 'Client',
        type: 'select',
        required: true,
        choices: references.map((client) => ({ value: client.id, label: client.name })),
      },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'state', label: 'State', type: 'text' },
      { name: 'postal_code', label: 'Postal code', type: 'text' },
      { name: 'country', label: 'Country', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', choices: statusChoices },
    ];
  }

  return [
    {
      name: 'location_id',
      label: 'Location',
      type: 'select',
      required: true,
      choices: references.map((location) => ({
        value: location.id,
        label: location.city ? `${location.name} · ${location.city}` : location.name,
      })),
    },
    { name: 'po_number', label: 'PO number', type: 'text', required: true },
    { name: 'order_date', label: 'Order date', type: 'date', required: true },
    { name: 'total_amount', label: 'Total amount', type: 'number', min: '0', step: '0.01' },
    { name: 'status', label: 'Status', type: 'select', choices: statusChoices },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ];
}

export function ResourceForm({ kind, title, record, onCancel, onSaved }: ResourceFormProps) {
  const [values, setValues] = useState(() => initialValues(kind, record));
  const [references, setReferences] = useState<ReferenceRow[]>([]);
  const [isLoadingReferences, setIsLoadingReferences] = useState(kind !== 'clients');
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();
  const referenceEndpoint = kind === 'locations' ? 'clients' : kind === 'purchase-orders' ? 'locations' : null;

  useEffect(() => {
    if (!referenceEndpoint) {
      return;
    }

    const controller = new AbortController();
    void apiRequest<ReferenceRow[]>(referenceEndpoint, { signal: controller.signal })
      .then(setReferences)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          const message = requestError instanceof Error ? requestError.message : 'Unable to load options.';
          setReferenceError(message);
          notify('error', message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingReferences(false);
        }
      });

    return () => controller.abort();
  }, [notify, referenceEndpoint]);

  const fields = fieldDefinitions(kind, references);
  const hasNoRequiredChoices = fields.some(
    (field) => field.required && field.type === 'select' && field.choices?.length === 0,
  );

  function updateValue(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload: Record<string, string | number> = {};
    for (const field of fields) {
      const value = values[field.name]?.trim();
      if (!value) {
        continue;
      }

      if (field.type === 'number') {
        payload[field.name] = Number(value);
      } else if (field.name === 'order_date') {
        payload[field.name] = new Date(`${value}T00:00:00.000Z`).toISOString();
      } else {
        payload[field.name] = value;
      }
    }

    try {
      await apiRequest<EditableRow>(record ? `${kind}/${record.id}` : kind, {
        method: record ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      notify('success', `${title} ${record ? 'updated' : 'created'} successfully.`);
      onSaved();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unable to save record.';
      setError(message);
      notify('error', message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-[2px]">
      <section
        aria-labelledby="record-form-title"
        aria-modal="true"
        className="my-auto flex max-h-[min(92vh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/20 ring-1 ring-slate-900/10"
        role="dialog"
      >
        <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-7">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Record details</p>
            <h2 className="text-lg font-semibold text-slate-900" id="record-form-title">
              {record ? `Edit ${title}` : `New ${title}`}
            </h2>
          </div>
          <button
            aria-label="Close form"
            className="grid size-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            onClick={onCancel}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        <form className="min-h-0 overflow-y-auto" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 p-6 sm:grid-cols-2 sm:px-7 sm:py-6">
            {referenceError && (
              <p className="col-span-full flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
                <AlertCircle aria-hidden="true" size={16} />
                {referenceError}
              </p>
            )}
        {hasNoRequiredChoices && !isLoadingReferences && !referenceError && (
              <p className="col-span-full rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                Create a related record before adding this one.
              </p>
        )}
          {fields.map((field) => (
            <label className={`flex flex-col gap-1.5 text-sm font-medium text-slate-700 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`} key={field.name}>
              <span>{field.label}{field.required && <span className="ml-1 text-red-600">*</span>}</span>
              {field.type === 'select' ? (
                <select
                  className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:bg-slate-50 disabled:text-slate-400"
                  disabled={isLoadingReferences || (field.required === true && field.choices?.length === 0)}
                  onChange={(event) => updateValue(field.name, event.target.value)}
                  required={field.required}
                  value={values[field.name] ?? ''}
                >
                  <option value="">Select {field.label.toLowerCase()}</option>
                  {field.choices?.map((choice) => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                  onChange={(event) => updateValue(field.name, event.target.value)}
                  placeholder={field.label}
                  rows={3}
                  value={values[field.name] ?? ''}
                />
              ) : (
                <input
                  className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                  min={field.min}
                  onChange={(event) => updateValue(field.name, event.target.value)}
                  required={field.required}
                  step={field.step}
                  type={field.type}
                  value={values[field.name] ?? ''}
                />
              )}
            </label>
          ))}
          </div>
          {error && (
            <p className="mx-6 mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 sm:mx-7" role="alert">
              <AlertCircle aria-hidden="true" size={16} />
              {error}
            </p>
          )}
          <footer className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-7">
            <button
              className="min-h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving || isLoadingReferences || Boolean(referenceError) || hasNoRequiredChoices}
              type="submit"
            >
              {isSaving && <LoaderCircle aria-hidden="true" className="animate-spin" size={15} />}
              {isSaving ? 'Saving...' : record ? 'Save changes' : 'Create record'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}