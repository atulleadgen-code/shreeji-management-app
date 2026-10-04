import { getSupabaseClient } from './supabase';

export const PO_DOCUMENT_BUCKET = 'po-documents';
export const PO_DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;

export async function validatePoDocument(file: File) {
  if (file.size === 0) {
    throw new Error('The selected PDF is empty.');
  }

  if (file.size > PO_DOCUMENT_MAX_BYTES) {
    throw new Error('The PDF must be 5 MB or smaller.');
  }

  if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Only PDF files are allowed.');
  }

  const signature = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
  if (!signature.startsWith('%PDF-')) {
    throw new Error('The selected file does not contain a valid PDF signature.');
  }
}

export async function uploadPoDocument(file: File) {
  await validatePoDocument(file);

  const supabase = getSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Sign in before uploading a Purchase Order document.');
  }

  const path = `${user.id}/${crypto.randomUUID()}.pdf`;
  const { data, error } = await supabase.storage.from(PO_DOCUMENT_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: 'application/pdf',
    upsert: false,
  });

  if (error) {
    throw new Error(`Unable to upload Purchase Order PDF: ${error.message}`);
  }

  return data.path;
}

export function normalizePoDocumentPath(path: string) {
  const trimmedPath = path.trim().replace(/^\/+/, '');
  const bucketPrefix = `${PO_DOCUMENT_BUCKET}/`;
  const objectPath = trimmedPath.startsWith(bucketPrefix)
    ? trimmedPath.slice(bucketPrefix.length)
    : trimmedPath;

  if (
    !objectPath ||
    /^https?:\/\//i.test(objectPath) ||
    objectPath.split('/').some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    throw new Error('The Purchase Order document path is invalid.');
  }

  return objectPath;
}

export async function getPoDocumentSignedUrl(path: string) {
  const objectPath = normalizePoDocumentPath(path);
  const { data, error } = await getSupabaseClient()
    .storage
    .from(PO_DOCUMENT_BUCKET)
    .createSignedUrl(objectPath, 120);

  if (error) {
    throw new Error(`Unable to open Purchase Order PDF: ${error.message}`);
  }

  const signedUrl = data?.signedUrl?.trim();
  if (!signedUrl) {
    throw new Error('Supabase did not return a signed URL for this Purchase Order PDF.');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(signedUrl);
  } catch {
    throw new Error('Supabase returned an invalid signed URL for this Purchase Order PDF.');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Supabase returned an unsupported signed URL protocol.');
  }

  return parsedUrl.toString();
}

export async function removePoDocument(path: string) {
  const objectPath = normalizePoDocumentPath(path);
  const { error } = await getSupabaseClient().storage.from(PO_DOCUMENT_BUCKET).remove([objectPath]);

  if (error) {
    throw new Error(`Unable to remove uploaded Purchase Order PDF: ${error.message}`);
  }
}