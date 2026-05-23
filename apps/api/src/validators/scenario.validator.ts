export type BuildingProfileCode =
  | 'non_reinforced_masonry'
  | 'simple_reinforced_concrete';

export interface PointInput {
  lat: number;
  lon: number;
  label?: string;
}

export interface CreateScenarioFromEventInput {
  eventId: string;
  title?: string;
  target?: PointInput;
  overrides?: {
    magnitude?: number;
    depthKm?: number;
  };
  buildingProfile?: BuildingProfileCode;
  siteFactor?: number;
}

export interface CreateCustomScenarioInput {
  title: string;
  epicenter: PointInput;
  target: PointInput;
  magnitude: number;
  depthKm: number;
  buildingProfile?: BuildingProfileCode;
  siteFactor?: number;
}

export interface UpdateScenarioParametersInput {
  epicenter?: PointInput;
  target?: PointInput;
  magnitude?: number;
  depthKm?: number;
  buildingProfile?: BuildingProfileCode;
  siteFactor?: number;
}

export class ValidationError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

const BUILDING_PROFILES: BuildingProfileCode[] = [
  'non_reinforced_masonry',
  'simple_reinforced_concrete',
];

function toNumber(value: unknown, fieldName: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ValidationError(`${fieldName} harus berupa angka yang valid`);
  }
  return parsed;
}

function assertLatitude(value: number, fieldName: string) {
  if (value < -90 || value > 90) {
    throw new ValidationError(`${fieldName} harus berada di antara -90 sampai 90`);
  }
}

function assertLongitude(value: number, fieldName: string) {
  if (value < -180 || value > 180) {
    throw new ValidationError(`${fieldName} harus berada di antara -180 sampai 180`);
  }
}

function assertMagnitude(value: number) {
  if (value < 1 || value > 10) {
    throw new ValidationError('magnitude harus berada di antara 1 sampai 10');
  }
}

function assertDepthKm(value: number) {
  if (value < 0) {
    throw new ValidationError('depthKm tidak boleh negatif');
  }
}

function assertSiteFactor(value: number) {
  if (value <= 0) {
    throw new ValidationError('siteFactor harus lebih besar dari 0');
  }
}

function assertBuildingProfile(value: unknown): asserts value is BuildingProfileCode {
  if (typeof value !== 'string' || !BUILDING_PROFILES.includes(value as BuildingProfileCode)) {
    throw new ValidationError(
      `buildingProfile harus salah satu dari: ${BUILDING_PROFILES.join(', ')}`
    );
  }
}

function normalizePoint(
  input: any,
  fieldName: string,
  requireLabel: boolean
): PointInput {
  if (!input || typeof input !== 'object') {
    throw new ValidationError(`${fieldName} wajib berupa object`);
  }

  const lat = toNumber(input.lat, `${fieldName}.lat`);
  const lon = toNumber(input.lon, `${fieldName}.lon`);

  assertLatitude(lat, `${fieldName}.lat`);
  assertLongitude(lon, `${fieldName}.lon`);

  let label: string | undefined;

  if (requireLabel) {
    if (typeof input.label !== 'string' || input.label.trim() === '') {
      throw new ValidationError(`${fieldName}.label wajib diisi`);
    }
    label = input.label.trim();
  } else if (typeof input.label === 'string' && input.label.trim() !== '') {
    label = input.label.trim();
  }

  return { lat, lon, label };
}

export function validateCreateFromEventPayload(body: any): CreateScenarioFromEventInput {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Body request tidak valid');
  }

  if (typeof body.eventId !== 'string' || body.eventId.trim() === '') {
    throw new ValidationError('eventId wajib diisi');
  }

  const payload: CreateScenarioFromEventInput = {
    eventId: body.eventId.trim(),
  };

  if (typeof body.title === 'string' && body.title.trim() !== '') {
    payload.title = body.title.trim();
  }

  if (body.target !== undefined) {
    payload.target = normalizePoint(body.target, 'target', false);
    payload.target.label = payload.target.label ?? 'Target default';
  }

  if (body.overrides !== undefined) {
    if (!body.overrides || typeof body.overrides !== 'object') {
      throw new ValidationError('overrides harus berupa object');
    }

    payload.overrides = {};

    if (body.overrides.magnitude !== undefined) {
      const magnitude = toNumber(body.overrides.magnitude, 'overrides.magnitude');
      assertMagnitude(magnitude);
      payload.overrides.magnitude = magnitude;
    }

    if (body.overrides.depthKm !== undefined) {
      const depthKm = toNumber(body.overrides.depthKm, 'overrides.depthKm');
      assertDepthKm(depthKm);
      payload.overrides.depthKm = depthKm;
    }
  }

  if (body.buildingProfile !== undefined) {
    assertBuildingProfile(body.buildingProfile);
    payload.buildingProfile = body.buildingProfile;
  }

  if (body.siteFactor !== undefined) {
    const siteFactor = toNumber(body.siteFactor, 'siteFactor');
    assertSiteFactor(siteFactor);
    payload.siteFactor = siteFactor;
  }

  return payload;
}

export function validateCreateCustomPayload(body: any): CreateCustomScenarioInput {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Body request tidak valid');
  }

  if (typeof body.title !== 'string' || body.title.trim() === '') {
    throw new ValidationError('title wajib diisi');
  }

  const epicenter = normalizePoint(body.epicenter, 'epicenter', false);
  const target = normalizePoint(body.target, 'target', true);

  const magnitude = toNumber(body.magnitude, 'magnitude');
  assertMagnitude(magnitude);

  const depthKm = toNumber(body.depthKm, 'depthKm');
  assertDepthKm(depthKm);

  let buildingProfile: BuildingProfileCode = 'non_reinforced_masonry';
  if (body.buildingProfile !== undefined) {
    assertBuildingProfile(body.buildingProfile);
    buildingProfile = body.buildingProfile;
  }

  let siteFactor = 1;
  if (body.siteFactor !== undefined) {
    siteFactor = toNumber(body.siteFactor, 'siteFactor');
    assertSiteFactor(siteFactor);
  }

  return {
    title: body.title.trim(),
    epicenter,
    target,
    magnitude,
    depthKm,
    buildingProfile,
    siteFactor,
  };
}

export function validateUpdateScenarioParametersPayload(
  body: any
): UpdateScenarioParametersInput {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Body request tidak valid');
  }

  const payload: UpdateScenarioParametersInput = {};

  if (body.epicenter !== undefined) {
    payload.epicenter = normalizePoint(body.epicenter, 'epicenter', false);
  }

  if (body.target !== undefined) {
    payload.target = normalizePoint(body.target, 'target', false);
    payload.target.label = payload.target.label ?? 'Target custom';
  }

  if (body.magnitude !== undefined) {
    const magnitude = toNumber(body.magnitude, 'magnitude');
    assertMagnitude(magnitude);
    payload.magnitude = magnitude;
  }

  if (body.depthKm !== undefined) {
    const depthKm = toNumber(body.depthKm, 'depthKm');
    assertDepthKm(depthKm);
    payload.depthKm = depthKm;
  }

  if (body.buildingProfile !== undefined) {
    assertBuildingProfile(body.buildingProfile);
    payload.buildingProfile = body.buildingProfile;
  }

  if (body.siteFactor !== undefined) {
    const siteFactor = toNumber(body.siteFactor, 'siteFactor');
    assertSiteFactor(siteFactor);
    payload.siteFactor = siteFactor;
  }

  if (Object.keys(payload).length === 0) {
    throw new ValidationError('Tidak ada field yang dikirim untuk diupdate');
  }

  return payload;
}