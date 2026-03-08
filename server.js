import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/patients/:id', (req, res) => {
    res.json({ id: req.params.id, name: 'Alice Smith' });
});

app.get('/api/records/:id', (req, res) => {
    res.json([
        { id: 1, date: '2023-10-25', type: 'Blood Test', doctor_name: 'Dr. House', summary: 'Normal CBC', status: 'Complete' },
        { id: 2, date: '2023-11-12', type: 'X-Ray', doctor_name: 'Dr. John', summary: 'Chest clear', status: 'Reviewed' }
    ]);
});

app.get('/api/access/pending/:id', (req, res) => {
    res.json([
        { id: 101, doctor_name: 'Dr. Smith', hospital: 'Toronto General', reason: 'Consultation', date: '2023-10-26' }
    ]);
});

app.get('/api/audit/:id', (req, res) => {
    res.json([
        { id: 201, action: 'Viewed Record', actor_name: 'Dr. Jane Doe', time: '2023-10-27 14:00' }
    ]);
});

app.patch('/api/access/:id', (req, res) => {
    res.json({ success: true, status: req.body.status });
});

app.get('/api/patients/search', (req, res) => {
    res.json([{ id: 1, name: 'Alice Smith', email: req.query.email }]);
});

app.get('/api/doctors/:id/patients', (req, res) => {
    res.json([
        { id: 1, name: 'Alice Smith', mrn: 'MRN123', condition: 'Hypertension', status: 'Active' }
    ]);
});

app.get('/api/patients/:id/summary', (req, res) => {
    res.json({
        summary: 'AI Summary: The patient is doing well. Blood pressure is normal.',
        flags: ['Check vitals'],
        lastUpdated: '2023-10-27'
    });
});

app.listen(3000, () => {
    console.log('Mock server running on port 3000');
});
