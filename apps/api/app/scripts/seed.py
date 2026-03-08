from datetime import date

from sqlalchemy import select

from app.core.database import SessionLocal, init_db
from app.models.guardian import Guardian
from app.models.health_record import HealthRecord
from app.models.patient import Patient
from app.models.role import Role
from app.models.user import User
from app.models.enums import RecordCategory, RoleName


def get_or_create_role(name: RoleName, db) -> Role:
    role = db.scalar(select(Role).where(Role.name == name.value))
    if role:
        return role
    role = Role(name=name.value)
    db.add(role)
    db.flush()
    return role


def get_or_create_user(*, email: str, display_name: str, role_id: int, auth0_sub: str, db) -> User:
    user = db.scalar(select(User).where(User.email == email))
    if user:
        return user
    user = User(
        email=email,
        display_name=display_name,
        role_id=role_id,
        auth0_sub=auth0_sub,
    )
    db.add(user)
    db.flush()
    return user


def seed() -> None:
    init_db()
    db = SessionLocal()
    try:
        patient_role = get_or_create_role(RoleName.PATIENT, db)
        guardian_role = get_or_create_role(RoleName.GUARDIAN, db)
        doctor_role = get_or_create_role(RoleName.DOCTOR, db)
        admin_role = get_or_create_role(RoleName.ADMIN, db)

        patient_user = get_or_create_user(
            email="patient@healthconnect.demo",
            display_name="Priya Patient",
            role_id=patient_role.id,
            auth0_sub="auth0|patient-demo",
            db=db,
        )
        guardian_user = get_or_create_user(
            email="guardian@healthconnect.demo",
            display_name="Gabe Guardian",
            role_id=guardian_role.id,
            auth0_sub="auth0|guardian-demo",
            db=db,
        )
        doctor_user = get_or_create_user(
            email="doctor@healthconnect.demo",
            display_name="Dana Doctor",
            role_id=doctor_role.id,
            auth0_sub="auth0|doctor-demo",
            db=db,
        )
        get_or_create_user(
            email="admin@healthconnect.demo",
            display_name="Ari Admin",
            role_id=admin_role.id,
            auth0_sub="auth0|admin-demo",
            db=db,
        )

        patient = db.scalar(select(Patient).where(Patient.user_id == patient_user.id))
        if not patient:
            patient = Patient(
                user_id=patient_user.id,
                health_card_number="HC-1234-5678",
                date_of_birth=date(1993, 7, 14),
            )
            db.add(patient)
            db.flush()

        guardian_link = db.scalar(
            select(Guardian).where(
                Guardian.guardian_user_id == guardian_user.id,
                Guardian.patient_id == patient.id,
            )
        )
        if not guardian_link:
            db.add(
                Guardian(
                    guardian_user_id=guardian_user.id,
                    patient_id=patient.id,
                    relationship_label="parent",
                )
            )

        existing_records = db.scalars(
            select(HealthRecord).where(HealthRecord.patient_id == patient.id)
        ).all()
        if not existing_records:
            db.add_all(
                [
                    HealthRecord(
                        patient_id=patient.id,
                        category=RecordCategory.ALLERGIES.value,
                        title="Peanut Allergy Record",
                        source_provider="Toronto General Hospital",
                        storage_key="records/patient-1/allergy-peanut.pdf",
                        mime_type="application/pdf",
                    ),
                    HealthRecord(
                        patient_id=patient.id,
                        category=RecordCategory.MEDICATIONS.value,
                        title="Current Medication List",
                        source_provider="Family Clinic EHR",
                        storage_key="records/patient-1/medications.json",
                        mime_type="application/json",
                    ),
                    HealthRecord(
                        patient_id=patient.id,
                        category=RecordCategory.LABS.value,
                        title="Blood Test - Feb 2026",
                        source_provider="LifeLabs",
                        storage_key="records/patient-1/labs-feb-2026.pdf",
                        mime_type="application/pdf",
                    ),
                    HealthRecord(
                        patient_id=patient.id,
                        category=RecordCategory.REFERRAL_NOTES.value,
                        title="Cardiology Referral Note",
                        source_provider="Primary Care Referral Desk",
                        storage_key="records/patient-1/referral-cardiology.txt",
                        mime_type="text/plain",
                    ),
                ]
            )

        db.commit()
        print("Seed complete.")
        print(f"Doctor user id: {doctor_user.id}")
        print(f"Patient user id: {patient_user.id}")
        print(f"Guardian user id: {guardian_user.id}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
