from datetime import datetime, timedelta

from app.models.enums import AccessRequestStatus, AuditAction, RecordCategory
from app.repositories.access_grant_repository import AccessGrantRepository
from app.repositories.access_request_repository import AccessRequestRepository
from app.repositories.audit_log_repository import AuditLogRepository
from app.schemas.access_request import AccessRequestCreate
from app.services.access_control_service import AccessControlService
from app.services.access_request_service import AccessRequestService
from app.services.consent_service import ConsentService


def test_access_request_creation(db_session, seed_data):
    service = AccessRequestService(db_session)
    payload = AccessRequestCreate(
        patient_id=seed_data.patient_id,
        categories=[RecordCategory.ALLERGIES, RecordCategory.LABS],
        reason="Need records to prepare for upcoming specialist consultation.",
        duration_hours=24,
    )

    created = service.create_access_request(doctor_user_id=seed_data.doctor_user_id, payload=payload)

    assert created.status == AccessRequestStatus.PENDING.value
    assert created.requested_categories == [RecordCategory.ALLERGIES.value, RecordCategory.LABS.value]
    assert created.doctor_user_id == seed_data.doctor_user_id

    audits = AuditLogRepository(db_session).list_recent(limit=10)
    assert any(entry.action == AuditAction.ACCESS_REQUEST_CREATED.value for entry in audits)


def test_consent_approval_creates_scope_limited_grant(db_session, seed_data):
    access_service = AccessRequestService(db_session)
    consent_service = ConsentService(db_session)

    access_request = access_service.create_access_request(
        doctor_user_id=seed_data.doctor_user_id,
        payload=AccessRequestCreate(
            patient_id=seed_data.patient_id,
            categories=[RecordCategory.ALLERGIES, RecordCategory.MEDICATIONS],
            reason="Medication reconciliation for next appointment.",
            duration_hours=12,
        ),
    )

    approved_request, grant = consent_service.approve_request(
        request_id=access_request.id,
        approver_user_id=seed_data.patient_user_id,
        approved_categories=[RecordCategory.ALLERGIES],
        duration_hours=6,
    )

    assert approved_request.status == AccessRequestStatus.APPROVED.value
    assert grant.granted_categories == [RecordCategory.ALLERGIES.value]
    assert grant.expires_at > grant.starts_at


def test_scope_enforcement_allows_only_granted_categories(db_session, seed_data):
    access_service = AccessRequestService(db_session)
    consent_service = ConsentService(db_session)
    access_control = AccessControlService(db_session)

    access_request = access_service.create_access_request(
        doctor_user_id=seed_data.doctor_user_id,
        payload=AccessRequestCreate(
            patient_id=seed_data.patient_id,
            categories=[RecordCategory.ALLERGIES, RecordCategory.LABS, RecordCategory.MEDICATIONS],
            reason="Pre-visit review of chronic condition history.",
            duration_hours=24,
        ),
    )
    consent_service.approve_request(
        request_id=access_request.id,
        approver_user_id=seed_data.guardian_user_id,
        approved_categories=[RecordCategory.ALLERGIES],
    )

    visible_records = access_control.list_accessible_records(
        doctor_user_id=seed_data.doctor_user_id,
        patient_id=seed_data.patient_id,
    )
    assert len(visible_records) == 1
    assert visible_records[0].category == RecordCategory.ALLERGIES.value
    assert not access_control.can_view_category(
        doctor_user_id=seed_data.doctor_user_id,
        patient_id=seed_data.patient_id,
        category=RecordCategory.LABS.value,
    )


def test_access_expiration_logic_marks_request_expired(db_session, seed_data):
    access_service = AccessRequestService(db_session)
    consent_service = ConsentService(db_session)
    access_control = AccessControlService(db_session)
    access_requests = AccessRequestRepository(db_session)
    access_grants = AccessGrantRepository(db_session)

    access_request = access_service.create_access_request(
        doctor_user_id=seed_data.doctor_user_id,
        payload=AccessRequestCreate(
            patient_id=seed_data.patient_id,
            categories=[RecordCategory.LABS],
            reason="Checking latest bloodwork before treatment update.",
            duration_hours=2,
        ),
    )
    _, grant = consent_service.approve_request(
        request_id=access_request.id,
        approver_user_id=seed_data.patient_user_id,
    )

    grant.expires_at = datetime.utcnow() - timedelta(minutes=1)
    access_grants.save(grant)
    db_session.commit()

    categories = access_control.get_accessible_categories(
        doctor_user_id=seed_data.doctor_user_id,
        patient_id=seed_data.patient_id,
        now=datetime.utcnow(),
    )

    refreshed_request = access_requests.get_by_id(access_request.id)
    assert categories == set()
    assert refreshed_request is not None
    assert refreshed_request.status == AccessRequestStatus.EXPIRED.value
