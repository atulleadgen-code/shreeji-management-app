import { getSupabaseClient } from './supabase';

export const WORKER_DOCUMENT_BUCKET = 'worker-documents';
export const WORKER_DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

export async function validateWorkerDocument(file: File) {
  if (file.size === 0) {
    throw new Error('The selected ID proof file is empty.');
  }

  if (file.size > WORKER_DOCUMENT_MAX_BYTES) {
    throw new Error('ID proof files must be 5 MB or smaller.');
  }

  if (!allowedMimeTypes.has(file.type)) {
    throw new Error('ID proof must be a PDF, JPEG, PNG, or WebP image.');
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const hasValidSignature = file.type === 'application/pdf'
    ? new TextDecoder().decode(header.slice(0, 5)) === '%PDF-'
    : file.type === 'image/jpeg'
      ? header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff
      : file.type === 'image/png'
        ? header.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10'
        : new TextDecoder().decode(header.slice(0, 4)) === 'RIFF'
          && new TextDecoder().decode(header.slice(8, 12)) === 'WEBP';

  if (!hasValidSignature) {
    throw new Error('The selected file does not match its declared PDF or image type.');
  }
}

function fileExtension(file: File) {
  switch (file.type) {
    case 'application/pdf': return 'pdf';
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    case 'image/webp': return 'webp';
    default: throw new Error('Unsupported ID proof file type.');
  }
}

export async function uploadWorkerDocument(file: File) {
  await validateWorkerDocument(file);

  const supabase = getSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Sign in before uploading worker ID proof.');
  }

  const path = `${user.id}/${crypto.randomUUID()}.${fileExtension(file)}`;
  const { data, error } = await supabase.storage.from(WORKER_DOCUMENT_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Unable to upload worker ID proof: ${error.message}`);
  }

  return data.path;
}

function normalizeWorkerDocumentPath(path: string) {
  const trimmedPath = path.trim().replace(/^\/+/, '');
  const bucketPrefix = `${WORKER_DOCUMENT_BUCKET}/`;
  const objectPath = trimmedPath.startsWith(bucketPrefix) ? trimmedPath.slice(bucketPrefix.length) : trimmedPath;

  if (!objectPath || /^https?:\/\//i.test(objectPath) || objectPath.split('/').some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error('The worker ID proof path is invalid.');
  }

  return objectPath;
}

export async function removeWorkerDocument(path: string) {
  const objectPath = normalizeWorkerDocumentPath(path);
  const { error } = await getSupabaseClient().storage.from(WORKER_DOCUMENT_BUCKET).remove([objectPath]);
  if (error) {
    throw new Error(`Unable to remove worker ID proof: ${error.message}`);
  }
}
