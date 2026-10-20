/**
 * FieldOps - Tipos e DTOs da API REST
 * Espelha as especificações do OpenAPI e do modelo relacional (/docs/10_modelo_de_dados.md e /docs/12_api_rest.md)
 * 
 * Regra de Segurança: RN-007 (Credenciais e tokens nunca devem ser registrados em logs ou console).
 * Tipagem estrita: Sem uso de 'any'.
 */

// ==========================================
// 1. DTOs e Tipos de Autenticação e Usuários
// ==========================================

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'TECHNICIAN' | 'CLIENT';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string | null;
  region?: string | null;
  completed?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token?: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: AuthUser;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string | null;
  region?: string | null;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

// ==========================================
// 2. DTOs de Clientes (Client)
// ==========================================

export type ClientStatus = 'ACTIVE' | 'INACTIVE';

export interface Client {
  id: string;
  name: string;
  legalName?: string | null;
  tradeName?: string | null;
  document: string;
  cnpj?: string;
  email?: string | null;
  phone?: string | null;
  status: ClientStatus;
  locationsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClientRequest {
  name: string;
  legalName?: string;
  document: string;
  email?: string;
  phone?: string;
}

export interface UpdateClientStatusRequest {
  status: ClientStatus;
}

// ==========================================
// 3. DTOs de Locais de Inspeção (InspectionSite)
// ==========================================

export type SiteStatus = 'ACTIVE' | 'INACTIVE';

export interface InspectionSite {
  id: string;
  clientId: string;
  customerId?: string;
  customerName?: string;
  name: string;
  description?: string | null;
  address?: string | null;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  zipCode?: string | null;
  supervisor?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  status: SiteStatus;
  equipmentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSiteRequest {
  clientId: string;
  name: string;
  description?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface UpdateSiteStatusRequest {
  status: SiteStatus;
}

// ==========================================
// 4. DTOs de Equipamentos (Equipment)
// ==========================================

export type EquipmentStatus =
  | 'ACTIVE'
  | 'MAINTENANCE'
  | 'INACTIVE'
  | 'OPERATIONAL'
  | 'ATTENTION'
  | 'CRITICAL';

export interface Equipment {
  id: string;
  name: string;
  code?: string;
  qrCode?: string;
  qrCodeId?: string;
  type?: string;
  clientId?: string;
  customerId?: string;
  customerName?: string;
  siteId?: string;
  locationId?: string;
  siteName?: string;
  locationName?: string;
  location?: string;
  serialNumber?: string | null;
  assetNumber?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  description?: string | null;
  status: EquipmentStatus;
  lastInspected?: string | null;
  lastInspectedAt?: string | null;
  installedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEquipmentRequest {
  siteId?: string;
  name: string;
  qrCode?: string;
  type?: string;
  serialNumber?: string;
  assetNumber?: string;
  manufacturer?: string;
  model?: string;
  description?: string;
  status?: EquipmentStatus;
}

export interface UpdateEquipmentStatusRequest {
  status: EquipmentStatus;
}

// ==========================================
// 5. DTOs de Modelos de Inspeção (Templates)
// ==========================================

export type ResponseType =
  | 'CONFORMITY'
  | 'CONFORM_NON_CONFORM'
  | 'BOOLEAN'
  | 'COMPLIANCE'
  | 'NUMERIC'
  | 'TEXT'
  | 'TEXT_SHORT'
  | 'TEXT_LONG'
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'PHOTO';

export interface TemplateItem {
  id?: string;
  title: string;
  description?: string | null;
  responseType: ResponseType;
  required: boolean;
  observationRequiredOnFailure?: boolean;
  evidenceRequiredOnFailure?: boolean;
  options?: string[] | null;
  displayOrder: number;
}

export interface TemplateSection {
  id?: string;
  title: string;
  description?: string | null;
  displayOrder: number;
  items: TemplateItem[];
}

export interface InspectionTemplate {
  id: string;
  name: string;
  description?: string | null;
  equipmentType?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  currentVersion?: number;
  sections?: TemplateSection[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  equipmentType?: string;
  sections?: TemplateSection[];
}

// ==========================================
// 6. DTOs de Inspeções e Snapshots
// ==========================================

export type InspectionStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CANCELED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ConformityStatus = 'CONFORMING' | 'NON_CONFORMING' | 'NOT_APPLICABLE';

export interface InspectionItemSnapshot {
  id: string;
  inspectionId?: string;
  sectionTitle: string;
  sectionDescription?: string | null;
  sectionOrder: number;
  itemCode?: string;
  itemTitle: string;
  title?: string;
  itemDescription?: string | null;
  responseType: ResponseType;
  type?: string;
  required: boolean;
  observationRequiredOnFailure?: boolean;
  evidenceRequiredOnFailure?: boolean;
  rulesJson?: string | null;
  optionsJson?: string | null;
  options?: string[] | null;
  itemOrder?: number;
  displayOrder?: number;
  order?: number;
  answered?: boolean;
}

export interface InspectionResponse {
  id: string;
  inspectionId?: string;
  inspectionItemId: string;
  valueText?: string | null;
  valueNumber?: number | null;
  valueNumeric?: number | null;
  valueBoolean?: boolean | null;
  valueDate?: string | null;
  valueJson?: string | null;
  observation?: string | null;
  conformity?: ConformityStatus | null;
  answeredAtDevice?: string;
  baseVersion?: number;
  evidenceCount?: number;
}

export interface MobileAnswer {
  id: string;
  questionId?: string;
  value: string;
  observation?: string | null;
  photoUrl?: string | null;
  signatureUrl?: string | null;
  question?: {
    id: string;
    title: string;
    type: string;
  } | null;
}

export interface Inspection {
  id: string;
  title?: string;
  templateId?: string;
  templateTitle?: string;
  templateVersionId?: string;
  templateVersionTitle?: string;
  instructions?: string | null;
  notes?: string | null;
  description?: string | null;
  priority: PriorityLevel;
  status: InspectionStatus;
  clientId?: string;
  clientName?: string;
  siteId?: string;
  siteName?: string;
  equipmentId?: string;
  equipmentName?: string;
  equipmentQrCode?: string;
  technicianId?: string;
  technicianName?: string;
  supervisorId?: string;
  supervisorName?: string;
  scheduledFor?: string;
  scheduledDate?: string;
  startedAt?: string | null;
  startedAtServer?: string | null;
  submittedAtServer?: string | null;
  completedAt?: string | null;
  approvedAt?: string | null;
  reviewedAt?: string | null;
  canceledAt?: string | null;
  canceledReason?: string | null;
  itemsCount?: number;
  answeredCount?: number;
  nonConformityCount?: number;
  nonConformitiesCount?: number;
  conformanceRate?: number;
  reviewStatus?: string;
  reviewObservation?: string | null;
  reviewer?: {
    id: string;
    name: string;
    email: string;
  } | null;
  responsible?: {
    id: string;
    name: string;
    email: string;
  } | null;
  equipment?: {
    id: string;
    name: string;
    code?: string;
  } | null;
  items?: InspectionItemSnapshot[];
  questions?: InspectionItemSnapshot[];
  responses?: InspectionResponse[];
  answers?: MobileAnswer[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInspectionRequest {
  templateId?: string;
  templateVersionId?: string;
  siteId: string;
  equipmentId?: string;
  technicianId?: string;
  title?: string;
  instructions?: string;
  priority?: PriorityLevel;
  scheduledFor?: string;
  assignedToId?: string;
  questions?: Array<{
    title: string;
    type: string;
  }>;
}

export interface AnswerInput {
  inspectionItemId?: string;
  questionId?: string;
  valueText?: string;
  value?: string;
  valueBoolean?: boolean;
  valueNumber?: number;
  observation?: string;
  conformity?: ConformityStatus;
  photoUrl?: string;
  signatureUrl?: string;
}

export interface SubmitInspectionAnswersRequest {
  answers: AnswerInput[];
  observation?: string;
  deviceTime?: string;
}

// ==========================================
// 7. DTOs de Não Conformidades (Non-Conformities)
// ==========================================

export type NonConformityStatus = 'OPEN' | 'IN_ANALYSIS' | 'ACTION_REQUIRED' | 'RESOLVED' | 'CANCELLED';

export type NonConformitySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface NonConformity {
  id: string;
  inspectionId: string;
  inspectionResponseId?: string | null;
  title: string;
  description?: string | null;
  severity: NonConformitySeverity;
  status: NonConformityStatus;
  deadline?: string | null;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNonConformityRequest {
  title: string;
  description?: string;
  severity: NonConformitySeverity;
  inspectionResponseId?: string;
}

export interface UpdateNonConformityStatusRequest {
  status: NonConformityStatus;
  resolutionNotes?: string;
}

// ==========================================
// 8. DTOs de Revisão (Reviews)
// ==========================================

export type ReviewDecision = 'APPROVED' | 'REJECTED';

export interface InspectionReview {
  id: string;
  inspectionId: string;
  reviewerId: string;
  reviewerName?: string;
  decision: ReviewDecision;
  comments?: string | null;
  reason?: string | null;
  itemsToCorrect?: string[] | null;
  reviewedAt: string;
}

export interface CreateReviewRequest {
  decision: ReviewDecision;
  comments?: string;
  reason?: string;
  itemsToCorrect?: string[];
}

// ==========================================
// 9. DTOs de Dashboard e Auditoria
// ==========================================

export interface DashboardSummary {
  totalInspections: number;
  scheduledCount: number;
  inProgressCount: number;
  completedCount: number;
  underReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  criticalNonConformities: number;
  openNonConformities: number;
  activeTechnicians: number;
  conformanceRate: number;
  pendingReviews: number;
}

export interface AuditEvent {
  id: string;
  entityName: string;
  entityId: string;
  action: string;
  actorId?: string | null;
  actorName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  detailsJson?: string | null;
  occurredAt: string;
}

// ==========================================
// 10. Formato Padronizado de Erro da API
// ==========================================

export interface ApiFieldError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  path: string;
  code?: string;
  errors?: ApiFieldError[];
  fieldErrors?: ApiFieldError[];
  requestId?: string;
}
