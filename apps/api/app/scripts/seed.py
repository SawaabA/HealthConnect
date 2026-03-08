from datetime import date

from sqlalchemy import select

from app.core.database import SessionLocal, init_db
from app.models.enums import RecordCategory, RoleName
from app.models.guardian import Guardian
from app.models.health_record import HealthRecord
from app.models.patient import Patient
from app.models.role import Role
from app.models.user import User


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


def get_or_create_patient_profile(*, user_id: int, health_card_number: str, dob: date, db) -> Patient:
    patient = db.scalar(select(Patient).where(Patient.user_id == user_id))
    if patient:
        return patient
    patient = Patient(
        user_id=user_id,
        health_card_number=health_card_number,
        date_of_birth=dob,
    )
    db.add(patient)
    db.flush()
    return patient


def ensure_guardian_link(*, guardian_user_id: int, patient_id: int, relationship_label: str, db) -> None:
    link = db.scalar(
        select(Guardian).where(
            Guardian.guardian_user_id == guardian_user_id,
            Guardian.patient_id == patient_id,
        )
    )
    if link:
        return
    db.add(
        Guardian(
            guardian_user_id=guardian_user_id,
            patient_id=patient_id,
            relationship_label=relationship_label,
        )
    )


def ensure_record(
    *,
    patient_id: int,
    category: RecordCategory,
    title: str,
    source_provider: str,
    storage_key: str,
    mime_type: str,
    db,
) -> None:
    existing = db.scalar(
        select(HealthRecord).where(
            HealthRecord.patient_id == patient_id,
            HealthRecord.title == title,
        )
    )
    if existing:
        return
    db.add(
        HealthRecord(
            patient_id=patient_id,
            category=category.value,
            title=title,
            source_provider=source_provider,
            storage_key=storage_key,
            mime_type=mime_type,
        )
    )


def seed() -> None:
    init_db()
    db = SessionLocal()
    try:
        patient_role = get_or_create_role(RoleName.PATIENT, db)
        guardian_role = get_or_create_role(RoleName.GUARDIAN, db)
        doctor_role = get_or_create_role(RoleName.DOCTOR, db)
        admin_role = get_or_create_role(RoleName.ADMIN, db)

        doctor_user = get_or_create_user(
            email="doctor@healthconnect.demo",
            display_name="Dana Doctor",
            role_id=doctor_role.id,
            auth0_sub="auth0|doctor-demo",
            db=db,
        )
        admin_user = get_or_create_user(
            email="admin@healthconnect.demo",
            display_name="Ari Admin",
            role_id=admin_role.id,
            auth0_sub="auth0|admin-demo",
            db=db,
        )

        guardian_primary = get_or_create_user(
            email="guardian@healthconnect.demo",
            display_name="Gabe Guardian",
            role_id=guardian_role.id,
            auth0_sub="auth0|guardian-demo",
            db=db,
        )
        guardian_secondary = get_or_create_user(
            email="guardian2@healthconnect.demo",
            display_name="Maya Guardian",
            role_id=guardian_role.id,
            auth0_sub="auth0|guardian2-demo",
            db=db,
        )

        patient_specs = [
            {
                "email": "patient@healthconnect.demo",
                "display_name": "Priya Patient",
                "auth0_sub": "auth0|patient-demo",
                "health_card": "HC-1234-5678",
                "dob": date(1993, 7, 14),
                "guardians": [(guardian_primary.id, "parent")],
                "records": [
                    (RecordCategory.ALLERGIES, "Peanut Allergy Record", "Toronto General Hospital", "records/patient-1/allergy-peanut.pdf", "application/pdf"),
                    (RecordCategory.MEDICATIONS, "Current Medication List", "Family Clinic EHR", "records/patient-1/medications.json", "application/json"),
                    (RecordCategory.LABS, "Blood Test - Feb 2026", "LifeLabs", "records/patient-1/labs-feb-2026.pdf", "application/pdf"),
                    (RecordCategory.IMAGING_REPORTS, "Chest Imaging Report - Jan 2026", "Mount Sinai Imaging", "records/patient-1/chest-imaging-jan-2026.pdf", "application/pdf"),
                    (RecordCategory.REFERRAL_NOTES, "Cardiology Referral Note", "Primary Care Referral Desk", "records/patient-1/referral-cardiology.txt", "text/plain"),
                    (RecordCategory.EMERGENCY_SUMMARY, "Emergency Summary Card", "HealthConnect Triage", "records/patient-1/emergency-summary.txt", "text/plain"),
                ],
            },
            {
                "email": "patient2@healthconnect.demo",
                "display_name": "Daniel Okafor",
                "auth0_sub": "auth0|patient2-demo",
                "health_card": "HC-2244-1122",
                "dob": date(1968, 11, 2),
                "guardians": [(guardian_primary.id, "spouse")],
                "records": [
                    (RecordCategory.ALLERGIES, "Penicillin Allergy Alert", "St. Michael's Hospital", "records/patient-2/allergy-penicillin.pdf", "application/pdf"),
                    (RecordCategory.MEDICATIONS, "Hypertension Medication Plan", "Cardio Clinic EHR", "records/patient-2/hypertension-meds.json", "application/json"),
                    (RecordCategory.LABS, "Kidney Function Labs - Jan 2026", "LifeLabs", "records/patient-2/kidney-labs-jan-2026.pdf", "application/pdf"),
                    (RecordCategory.IMAGING_REPORTS, "Renal Ultrasound Report", "Toronto Diagnostic Imaging", "records/patient-2/renal-ultrasound.pdf", "application/pdf"),
                    (RecordCategory.REFERRAL_NOTES, "Nephrology Referral Note", "Downtown Family Health", "records/patient-2/referral-nephrology.txt", "text/plain"),
                    (RecordCategory.EMERGENCY_SUMMARY, "Emergency Hypertension Summary", "Emergency Continuity Desk", "records/patient-2/emergency-summary.txt", "text/plain"),
                ],
            },
            {
                "email": "patient3@healthconnect.demo",
                "display_name": "Leila Minhas",
                "auth0_sub": "auth0|patient3-demo",
                "health_card": "HC-9911-2200",
                "dob": date(2015, 3, 29),
                "guardians": [(guardian_secondary.id, "mother")],
                "records": [
                    (RecordCategory.ALLERGIES, "Pollen Allergy Checklist", "Pediatric Centre Toronto", "records/patient-3/allergy-pollen.pdf", "application/pdf"),
                    (RecordCategory.MEDICATIONS, "Rescue Inhaler Plan", "Pediatric Asthma Clinic", "records/patient-3/rescue-inhaler-plan.json", "application/json"),
                    (RecordCategory.LABS, "Spirometry Lab - Dec 2025", "Kids Pulmonary Lab", "records/patient-3/spirometry-dec-2025.pdf", "application/pdf"),
                    (RecordCategory.REFERRAL_NOTES, "Pediatric Respiratory Referral", "School Health Program", "records/patient-3/referral-pulmonary.txt", "text/plain"),
                    (RecordCategory.EMERGENCY_SUMMARY, "School Emergency Action Plan", "School Nurse Program", "records/patient-3/emergency-school-plan.txt", "text/plain"),
                ],
            },
            {
                "email": "patient4@healthconnect.demo",
                "display_name": "Amina Yusuf",
                "auth0_sub": "auth0|patient4-demo",
                "health_card": "HC-7788-4411",
                "dob": date(1984, 5, 8),
                "guardians": [],
                "records": [
                    (RecordCategory.ALLERGIES, "Shellfish Allergy Record", "Waterfront Walk-in", "records/patient-4/allergy-shellfish.pdf", "application/pdf"),
                    (RecordCategory.MEDICATIONS, "Migraine Medication List", "Harbour Family Clinic", "records/patient-4/migraine-meds.json", "application/json"),
                    (RecordCategory.LABS, "Inflammatory Marker Lab - Feb 2026", "LifeLabs", "records/patient-4/inflammatory-labs-feb-2026.pdf", "application/pdf"),
                    (RecordCategory.IMAGING_REPORTS, "MRI Brain Imaging Report", "Toronto Neuro Imaging", "records/patient-4/mri-brain-report.pdf", "application/pdf"),
                    (RecordCategory.REFERRAL_NOTES, "Neurology Referral Note", "Harbour Family Clinic", "records/patient-4/referral-neurology.txt", "text/plain"),
                    (RecordCategory.EMERGENCY_SUMMARY, "Emergency Migraine Summary", "Urgent Care Intake", "records/patient-4/emergency-summary.txt", "text/plain"),
                ],
            },
        ]

        created_patients: list[tuple[str, int]] = []
        for spec in patient_specs:
            patient_user = get_or_create_user(
                email=spec["email"],
                display_name=spec["display_name"],
                role_id=patient_role.id,
                auth0_sub=spec["auth0_sub"],
                db=db,
            )
            patient = get_or_create_patient_profile(
                user_id=patient_user.id,
                health_card_number=spec["health_card"],
                dob=spec["dob"],
                db=db,
            )
            created_patients.append((spec["display_name"], patient.id))

            for guardian_user_id, relationship in spec["guardians"]:
                ensure_guardian_link(
                    guardian_user_id=guardian_user_id,
                    patient_id=patient.id,
                    relationship_label=relationship,
                    db=db,
                )

            for category, title, provider, key, mime_type in spec["records"]:
                ensure_record(
                    patient_id=patient.id,
                    category=category,
                    title=title,
                    source_provider=provider,
                    storage_key=key,
                    mime_type=mime_type,
                    db=db,
                )

        db.commit()
        print("Seed complete.")
        print(f"Doctor user id: {doctor_user.id}")
        print(f"Admin user id: {admin_user.id}")
        print(f"Guardian user id: {guardian_primary.id}")
        print(f"Secondary guardian user id: {guardian_secondary.id}")
        for name, patient_id in created_patients:
            print(f"Patient profile: {name} -> patient_id={patient_id}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
