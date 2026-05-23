export type ScenarioMode = 'real_event' | 'custom';

export type BuildingProfileCode =
  | 'non_reinforced_masonry'
  | 'simple_reinforced_concrete';

export interface ScenarioParameters {
  epicenterLat: number;
  epicenterLon: number;
  targetLat: number;
  targetLon: number;
  targetLabel: string;
  magnitude: number;
  depthKm: number;
  distanceKm: number;
  siteFactor: number;
  buildingProfileCode: BuildingProfileCode;
}

export interface ScenarioDetail {
  id: string;
  mode: ScenarioMode;
  baseEventId: string | null;
  title: string;
  createdAt: string;
  parameters: ScenarioParameters;
}

export interface CreateScenarioFromEventRequest {
  eventId: string;
  title?: string;
  target?: {
    lat: number;
    lon: number;
    label: string;
  };
  overrides?: {
    magnitude?: number;
    depthKm?: number;
  };
  buildingProfile?: BuildingProfileCode;
  siteFactor?: number;
}

export interface CreateCustomScenarioRequest {
  title: string;
  epicenter: {
    lat: number;
    lon: number;
  };
  target: {
    lat: number;
    lon: number;
    label: string;
  };
  magnitude: number;
  depthKm: number;
  buildingProfile?: BuildingProfileCode;
  siteFactor?: number;
}

export interface UpdateScenarioParametersRequest {
  epicenter?: {
    lat: number;
    lon: number;
  };
  target?: {
    lat: number;
    lon: number;
    label?: string;
  };
  magnitude?: number;
  depthKm?: number;
  buildingProfile?: BuildingProfileCode;
  siteFactor?: number;
}

export type MmiRoman =
  | 'I'
  | 'II'
  | 'III'
  | 'IV'
  | 'V'
  | 'VI'
  | 'VII'
  | 'VIII'
  | 'IX'
  | 'X';

export type ImpactSeverityClass = 'light' | 'moderate' | 'heavy';

export type BuildingDamageClass =
  | 'negligible'
  | 'light'
  | 'moderate'
  | 'heavy'
  | 'severe'
  | 'collapse_prone';

export type CollapseRiskLevel = 'low' | 'moderate' | 'high' | 'very_high';

export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

export type SimulationRunStatus = 'running' | 'completed' | 'failed';

export interface WaveTimelineEvent {
  key: 'p_wave' | 's_wave' | 'main_shock';
  title: string;
  description: string;
  timeSec: number;
  icon: string;
  accent: 'primary' | 'orange' | 'red';
}

export interface WaveTimeline {
  pArrivalSec: number;
  sArrivalSec: number;
  mainShockSec: number;
  durationSec: number;
  hypocentralDistanceKm: number;
  pWaveVelocityKmPerSec: number;
  sWaveVelocityKmPerSec: number;
  events: WaveTimelineEvent[];
}

export interface BuildingImpactAssessment {
  buildingProfileCode: BuildingProfileCode;
  damageClass: BuildingDamageClass;
  driftRatioEstimate: number;
  collapseRisk: CollapseRiskLevel;
  pedagogicalExplanation: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  summary: string;
  factors: string[];
}

export interface SimulationTargetSummary {
  label: string;
  lat: number;
  lon: number;
  epicentralDistanceKm: number;
  hypocentralDistanceKm: number;
  groundMotionIndex: number;
  mmiNumeric: number;
  mmiRoman: MmiRoman;
  intensityLabel: string;
}

export interface ImpactCellSummary {
  id: string;
  lat: number;
  lon: number;
  epicentralDistanceKm: number;
  hypocentralDistanceKm: number;
  groundMotionIndex: number;
  mmiNumeric: number;
  mmiRoman: MmiRoman;
  intensityLabel: string;
  impactClass: ImpactSeverityClass;
  damageClass: BuildingDamageClass;
  riskLevel: RiskLevel;
}

export interface ImpactGridSummary {
  radiusKm: number;
  stepKm: number;
  cells: ImpactCellSummary[];
}

export interface SimulationRunSummary {
  target: SimulationTargetSummary;
  waveTimeline: WaveTimeline;
  buildingImpact: BuildingImpactAssessment;
  risk: RiskAssessment;
  impactGrid: ImpactGridSummary;
  targetCell: ImpactCellSummary;
  pedagogicalNotes: string[];
}

export interface SimulationRunDetail {
  id: string;
  scenarioId: string;
  parameterId: string;
  status: SimulationRunStatus;
  startedAt: string | null;
  finishedAt: string | null;
  summary: SimulationRunSummary | null;
}
