'use client';

import { useEffect, useState } from 'react';
import { Building2, ClipboardList, LoaderCircle, MapPin, Pencil, Plus, Search, TriangleAlert, X } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { EditableRow, ResourceForm, ResourceKind } from './resource-form';
import { useToast } from './toast-provider';

type ResourceColumn = { key: string; label: string };

type ResourceListProps = {
  endpoint: string;
  kind: ResourceKind;
  title: string;
  columns: ResourceColumn[];
};

function readField(row: EditableRow, path: string) {
  const value = path.split('.').reduce<unknown>((current, part) => {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }

    return (current as Record<string, unknown>)[part];
  }, row);

  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (path === 'order_date' && typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString();
  }

  return typeof value === 'string' || typeof value === 'number' ? String(value) : '—';
}

function ResourceIcon({ kind, size = 21 }: { kind: ResourceKind; size?: number }) {
  if (kind === 'clients') return <Building2 aria-hidden="true" size={size} />;
  if (kind === 'locations') return <MapPin aria-hidden="true" size={size} />;
  return <ClipboardList aria-hidden="true" size={size} />;
}

export function ResourceList({ endpoint, kind, title, columns }: ResourceListProps) {
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<EditableRow | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [search, setSearch] = useState('');
  const { notify } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    void apiRequest<EditableRow[]>(endpoint, { signal: controller.signal })
      .then(setRows)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          const message = requestError instanceof Error ? requestError.message : 'Unable to load records.';
          setError(message);
          notify('error', message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [endpoint, notify, refreshCount]);

  const searchValue = search.trim().toLocaleLowerCase();
  const filteredRows = searchValue
    ? rows.filter((row) => columns.some((column) => readField(row, column.key).toLocaleLowerCase().includes(searchValue)))
    : rows;

  function openCreateForm() {
    setEditingRow(null);
    setFormOpen(true);
  }

  function openEditForm(row: EditableRow) {
    setEditingRow(row);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingRow(null);
  }

  function handleSaved() {
    closeForm();
    setRefreshCount((count) => count + 1);
  }

  return (
    <section>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Records</p>
          <h1 className="text-2xl font-semibold tracking-normal text-slate-900">{title}</h1>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <span className="text-sm tabular-nums text-slate-500">{rows.length} records</span>
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
            onClick={openCreateForm}
            type="button"
          >
            <Plus aria-hidden="true" size={16} />
            New {title.replace(/s$/, '')}
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="flex min-h-52 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-500" role="status">
          <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
          Loading {title.toLowerCase()}...
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700" role="alert">
          <TriangleAlert aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
          <p>{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div>
            <span className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
              <ResourceIcon kind={kind} size={22} />
            </span>
            <h2 className="text-sm font-semibold text-slate-800">No {title.toLowerCase()} yet</h2>
            <p className="mt-1 text-sm text-slate-500">Create the first record to get started.</p>
            <button
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-medium text-white hover:bg-emerald-900"
              onClick={openCreateForm}
              type="button"
            >
              <Plus aria-hidden="true" size={16} />
              New {title.replace(/s$/, '')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <label className="relative block w-full sm:max-w-sm">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                aria-label={`Search ${title.toLowerCase()}`}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10"
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                type="search"
                value={search}
              />
              {search && (
                <button
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setSearch('')}
                  type="button"
                >
                  <X aria-hidden="true" size={15} />
                </button>
              )}
            </label>
            <p className="text-xs tabular-nums text-slate-500">
              {searchValue ? `${filteredRows.length} of ${rows.length} records` : `${rows.length} records`}
            </p>
          </div>
          {filteredRows.length === 0 ? (
            <div className="grid min-h-56 place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <div>
                <span className="mx-auto mb-4 grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <Search aria-hidden="true" size={20} />
                </span>
                <h2 className="text-sm font-semibold text-slate-800">No matching {title.toLowerCase()}</h2>
                <p className="mt-1 text-sm text-slate-500">Try a different search term.</p>
                <button
                  className="mt-4 text-sm font-medium text-emerald-800 hover:text-emerald-950"
                  onClick={() => setSearch('')}
                  type="button"
                >
                  Clear search
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.025]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    <tr>
                      {columns.map((column) => (
                        <th className="px-5 py-3.5" key={column.key} scope="col">{column.label}</th>
                      ))}
                      <th className="px-5 py-3.5 text-right" scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((row) => (
                      <tr className="transition-colors hover:bg-slate-50/80" key={row.id}>
                        {columns.map((column) => {
                          const value = readField(row, column.key);
                          if (column.key === 'status') {
                            const positive = ['active', 'approved', 'completed'].includes(value.toLowerCase());
                            return (
                              <td className="px-5 py-4" key={column.key}>
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  positive ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {value}
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td className="max-w-72 truncate px-5 py-4 text-slate-700" key={column.key}>
                              {value}
                            </td>
                          );
                        })}
                        <td className="px-5 py-3 text-right">
                          <button
                            aria-label={`Edit ${title.replace(/s$/, '')}`}
                            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
                            onClick={() => openEditForm(row)}
                            title="Edit record"
                            type="button"
                          >
                            <Pencil aria-hidden="true" size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      {formOpen && (
        <ResourceForm
          key={editingRow?.id ?? 'new'}
          kind={kind}
          onCancel={closeForm}
          onSaved={handleSaved}
          record={editingRow}
          title={title.replace(/s$/, '')}
        />
      )}
    </section>
  );
}