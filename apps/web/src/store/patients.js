/**
 * Shared in-memory patient store.
 * Both DoctorDashboard and PatientDashboard import from here so
 * doctor edits (including PDF attachments) are visible to patients
 * in the same browser session without a backend.
 */

const initialPatients = [
  {
    id: 1,
    backendPatientId: 1,
    name: 'Sarah Chen',
    age: 34,
    mrn: 'MRN-2024-0042',
    condition: 'Type 1 Diabetes',
    description:
      'Patient has stable glycemic control on insulin therapy. Focus remains on meal timing, hydration, and symptom journaling before each follow-up.',
    lastVisit: '2026-02-14',
    lastPhysicalDate: '2025-06-05',
    followUpWindow: '3 months',
    symptoms: ['fatigue', 'occasional thirst'],
    vitals: {
      hba1c: '6.8%',
      bloodPressure: '118/76',
      trendNote: '0.1% down from previous quarter',
    },
    status: 'Active',
    email: 'sarah.chen@email.com',
    attachments: [
      { name: 'A1C-trend-summary.pdf', url: '#' },
      { name: 'diet-plan-checklist.pdf', url: '#' },
    ],
    feedback: [
      {
        date: '2026-02-14',
        message:
          'Great progress on HbA1c levels. Continue current insulin schedule and low-carb meal plan. Return in 3 months.',
      },
      {
        date: '2025-11-19',
        message:
          'Hydration has improved and fasting glucose is more stable. Keep logging pre-breakfast readings.',
      },
    ],
  },
  {
    id: 2,
    backendPatientId: 2,
    name: 'Daniel Okafor',
    age: 58,
    mrn: 'MRN-2024-0087',
    condition: 'Hypertension, CKD Stage 2',
    description:
      'Renal follow-up profile with blood pressure monitoring. Care plan includes sodium reduction, daily weights, and medication adherence tracking.',
    lastVisit: '2026-01-30',
    lastPhysicalDate: '2025-10-02',
    followUpWindow: '6 weeks',
    symptoms: ['morning dizziness', 'ankle swelling', 'fatigue after stairs'],
    vitals: {
      hba1c: '7.1%',
      bloodPressure: '132/84',
      trendNote: 'Blood pressure improving after diet adjustment',
    },
    status: 'Active',
    email: 'daniel.okafor@email.com',
    attachments: [{ name: 'kidney-panel-results.pdf', url: '#' }],
    feedback: [
      {
        date: '2026-01-30',
        message:
          'Blood pressure is improving. Continue low-sodium plan. Increased Amlodipine and repeat kidney labs in 6 weeks.',
      },
      {
        date: '2025-12-08',
        message: 'Mild edema persists. Add evening leg elevation and monitor home BP twice daily.',
      },
    ],
  },
  {
    id: 3,
    backendPatientId: 3,
    name: 'Leila Minhas',
    age: 10,
    mrn: 'MRN-2024-0103',
    condition: 'Pediatric Asthma',
    description:
      'Pediatric respiratory profile. Guardian-managed consent. Focus on trigger avoidance, inhaler technique, and school emergency planning.',
    lastVisit: '2026-03-01',
    lastPhysicalDate: '2025-08-24',
    followUpWindow: '2 weeks',
    symptoms: ['night cough', 'exercise wheeze'],
    vitals: {
      hba1c: '5.3%',
      bloodPressure: '106/66',
      trendNote: 'Respiratory baseline updated at pediatric intake',
    },
    status: 'Pending',
    email: 'leila.minhas@email.com',
    attachments: [{ name: 'school-asthma-action-plan.pdf', url: '#' }],
    feedback: [
      {
        date: '2026-03-01',
        message:
          'Review spacer technique daily. Keep rescue inhaler available at school and home. Follow up in 2 weeks.',
      },
    ],
  },
  {
    id: 4,
    backendPatientId: 4,
    name: 'Amina Yusuf',
    age: 41,
    mrn: 'MRN-2024-0138',
    condition: 'Migraine with Aura',
    description:
      'Neurology referral pathway for episodic migraine. Tracking sleep, hydration, and trigger exposure for treatment adjustments.',
    lastVisit: '2026-02-20',
    lastPhysicalDate: '2025-09-11',
    followUpWindow: '4 weeks',
    symptoms: ['light sensitivity', 'nausea during episodes', 'frontal headache'],
    vitals: {
      hba1c: '5.6%',
      bloodPressure: '122/78',
      trendNote: 'No persistent BP concerns; migraine frequency under review',
    },
    status: 'Active',
    email: 'amina.yusuf@email.com',
    attachments: [{ name: 'migraine-trigger-log.pdf', url: '#' }],
    feedback: [
      {
        date: '2026-02-20',
        message:
          'Continue trigger diary and rescue medication at onset. Schedule neurology follow-up with updated symptom log.',
      },
    ],
  },
]

// Mutable singleton - mutations here are visible everywhere that imports this module.
let patients = [...initialPatients]

export function getPatients() {
  return patients
}

export function upsertPatient(updated) {
  const idx = patients.findIndex((p) => p.id === updated.id)
  if (idx >= 0) {
    patients = patients.map((p) => (p.id === updated.id ? updated : p))
  } else {
    patients = [updated, ...patients]
  }
  return patients
}

export function addPatient(patient) {
  patients = [patient, ...patients]
  return patients
}
