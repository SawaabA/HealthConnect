from dataclasses import dataclass

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401
from app.models.base import Base
from app.models.enums import RecordCategory, RoleName
from app.models.guardian import Guardian
from app.models.health_record import HealthRecord
from app.models.patient import Patient
from app.models.role import Role
from app.models.user import User


@pytest.fixture()
def db_session() -> Session:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@dataclass
class SeedData:
    patient_id: int
    patient_user_id: int
    guardian_user_id: int
    doctor_user_id: int
    admin_user_id: int


@pytest.fixture()
def seed_data(db_session: Session) -> SeedData:
    roles = {}
    for role_name in RoleName:
        role = Role(name=role_name.value)
        db_session.add(role)
        db_session.flush()
        roles[role_name] = role

    patient_user = User(
        email="patient@test.local",
        display_name="Patient Test",
        role_id=roles[RoleName.PATIENT].id,
        auth0_sub="auth0|patient-test",
    )
    guardian_user = User(
        email="guardian@test.local",
        display_name="Guardian Test",
        role_id=roles[RoleName.GUARDIAN].id,
        auth0_sub="auth0|guardian-test",
    )
    doctor_user = User(
        email="doctor@test.local",
        display_name="Doctor Test",
        role_id=roles[RoleName.DOCTOR].id,
        auth0_sub="auth0|doctor-test",
    )
    admin_user = User(
        email="admin@test.local",
        display_name="Admin Test",
        role_id=roles[RoleName.ADMIN].id,
        auth0_sub="auth0|admin-test",
    )
    db_session.add_all([patient_user, guardian_user, doctor_user, admin_user])
    db_session.flush()

    patient = Patient(user_id=patient_user.id, health_card_number="TEST-123")
    db_session.add(patient)
    db_session.flush()

    db_session.add(
        Guardian(
            guardian_user_id=guardian_user.id,
            patient_id=patient.id,
            relationship_label="parent",
        )
    )

    db_session.add_all(
        [
            HealthRecord(
                patient_id=patient.id,
                category=RecordCategory.ALLERGIES.value,
                title="Allergy Snapshot",
                source_provider="Hospital A",
                storage_key="records/allergy.pdf",
                mime_type="application/pdf",
            ),
            HealthRecord(
                patient_id=patient.id,
                category=RecordCategory.MEDICATIONS.value,
                title="Medication List",
                source_provider="Clinic B",
                storage_key="records/medications.json",
                mime_type="application/json",
            ),
            HealthRecord(
                patient_id=patient.id,
                category=RecordCategory.LABS.value,
                title="Bloodwork",
                source_provider="Lab C",
                storage_key="records/labs.pdf",
                mime_type="application/pdf",
            ),
            HealthRecord(
                patient_id=patient.id,
                category=RecordCategory.REFERRAL_NOTES.value,
                title="Referral Note",
                source_provider="Referral Desk",
                storage_key="records/referral.txt",
                mime_type="text/plain",
            ),
        ]
    )
    db_session.commit()

    return SeedData(
        patient_id=patient.id,
        patient_user_id=patient_user.id,
        guardian_user_id=guardian_user.id,
        doctor_user_id=doctor_user.id,
        admin_user_id=admin_user.id,
    )
