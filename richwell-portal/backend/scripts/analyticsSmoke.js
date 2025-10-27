import 'dotenv/config';

const baseUrl = (process.env.ANALYTICS_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

const credentials = {
  student: {
    email: process.env.ANALYTICS_STUDENT_EMAIL,
    password: process.env.ANALYTICS_STUDENT_PASSWORD
  },
  professor: {
    email: process.env.ANALYTICS_PROFESSOR_EMAIL,
    password: process.env.ANALYTICS_PROFESSOR_PASSWORD
  },
  registrar: {
    email: process.env.ANALYTICS_REGISTRAR_EMAIL,
    password: process.env.ANALYTICS_REGISTRAR_PASSWORD
  },
  dean: {
    email: process.env.ANALYTICS_DEAN_EMAIL,
    password: process.env.ANALYTICS_DEAN_PASSWORD
  },
  admission: {
    email: process.env.ANALYTICS_ADMISSION_EMAIL,
    password: process.env.ANALYTICS_ADMISSION_PASSWORD
  }
};

const endpoints = [
  {
    path: '/api/analytics/student',
    role: 'student',
    label: 'Student analytics',
    validate: (body) => {
      expectSuccess(body, 'student analytics response');
      const data = ensureObject(body.data, 'student analytics payload');
      const student = ensureObject(data.student, 'student analytics `data.student`');
      requireKeys(student, ['id', 'studentNo', 'program', 'yearLevel', 'status'], 'student analytics `data.student`');
      const statistics = ensureObject(data.statistics, 'student analytics `data.statistics`');
      requireKeys(
        statistics,
        ['totalSubjects', 'totalUnits', 'incCount', 'failedCount', 'gpa'],
        'student analytics `data.statistics`'
      );
      ensureArray(data.enrollments, 'student analytics `data.enrollments`');
    }
  },
  {
    path: '/api/analytics/professor',
    role: 'professor',
    label: 'Professor analytics',
    validate: (body) => {
      expectSuccess(body, 'professor analytics response');
      const data = ensureObject(body.data, 'professor analytics payload');
      const professor = ensureObject(data.professor, 'professor analytics `data.professor`');
      requireKeys(professor, ['id', 'sections', 'students'], 'professor analytics `data.professor`');
      const statistics = ensureObject(data.statistics, 'professor analytics `data.statistics`');
      requireKeys(
        statistics,
        ['totalSections', 'totalStudents', 'averageGrade', 'incCount', 'gradedStudents'],
        'professor analytics `data.statistics`'
      );
      ensureObject(data.gradeDistribution, 'professor analytics `data.gradeDistribution`');
      ensureArray(data.sections, 'professor analytics `data.sections`');
    }
  },
  {
    path: '/api/analytics/registrar',
    role: 'registrar',
    label: 'Registrar analytics',
    validate: (body) => {
      expectSuccess(body, 'registrar analytics response');
      const data = ensureObject(body.data, 'registrar analytics payload');
      const currentTerm = ensureObject(data.currentTerm, 'registrar analytics `data.currentTerm`');
      requireKeys(currentTerm, ['schoolYear', 'semester'], 'registrar analytics `data.currentTerm`');
      const enrollment = ensureObject(data.enrollment, 'registrar analytics `data.enrollment`');
      requireKeys(enrollment, ['total', 'confirmed', 'pending'], 'registrar analytics `data.enrollment`');
      const grades = ensureObject(data.grades, 'registrar analytics `data.grades`');
      requireKeys(grades, ['total', 'approved', 'pending'], 'registrar analytics `data.grades`');
      ensureArray(data.programs, 'registrar analytics `data.programs`');
    }
  },
  {
    path: '/api/analytics/dean',
    role: 'dean',
    label: 'Dean analytics',
    validate: (body) => {
      expectSuccess(body, 'dean analytics response');
      const data = ensureObject(body.data, 'dean analytics payload');
      const currentTerm = ensureObject(data.currentTerm, 'dean analytics `data.currentTerm`');
      requireKeys(currentTerm, ['schoolYear', 'semester'], 'dean analytics `data.currentTerm`');
      ensureArray(data.professorLoad, 'dean analytics `data.professorLoad`');
      ensureArray(data.subjectPerformance, 'dean analytics `data.subjectPerformance`');
    }
  },
  {
    path: '/api/analytics/admission',
    role: 'admission',
    label: 'Admission analytics',
    validate: (body) => {
      expectSuccess(body, 'admission analytics response');
      const data = ensureObject(body.data, 'admission analytics payload');
      const currentTerm = ensureObject(data.currentTerm, 'admission analytics `data.currentTerm`');
      requireKeys(currentTerm, ['schoolYear', 'semester'], 'admission analytics `data.currentTerm`');
      const metrics = ensureObject(data.metrics, 'admission analytics `data.metrics`');
      requireKeys(metrics, ['pending', 'confirmedToday', 'total', 'confirmed', 'confirmationRate'], 'admission analytics `data.metrics`');
      ensureArray(data.trend, 'admission analytics `data.trend`');
      ensureArray(data.programs, 'admission analytics `data.programs`');
      ensureArray(data.recent, 'admission analytics `data.recent`');
    }
  }
];

const tokenCache = new Map();

async function login(role) {
  if (tokenCache.has(role)) {
    return tokenCache.get(role);
  }

  const creds = credentials[role];

  if (!creds?.email || !creds?.password) {
    throw new Error(
      `Missing credentials for ${role} role. Please set ANALYTICS_${role.toUpperCase()}_EMAIL and ANALYTICS_${role.toUpperCase()}_PASSWORD.`
    );
  }

  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: creds.email, password: creds.password })
  });

  if (!response.ok) {
    const errorText = await safeReadBody(response);
    throw new Error(`Login failed for ${role}: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const payload = await response.json();

  if (!payload?.token) {
    throw new Error(`Login response for ${role} did not contain a token.`);
  }

  tokenCache.set(role, payload.token);
  return payload.token;
}

async function safeReadBody(response) {
  try {
    return await response.text();
  } catch (error) {
    return `<unable to read response body: ${error.message}>`;
  }
}

function ensureObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value;
}

function ensureArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
  return value;
}

function requireKeys(target, keys, label) {
  for (const key of keys) {
    if (!(key in target)) {
      throw new Error(`${label} is missing required key \`${key}\`.`);
    }
  }
}

function expectSuccess(body, label) {
  if (!body || typeof body !== 'object') {
    throw new Error(`${label} must be a JSON object.`);
  }
  if (body.status !== 'success') {
    throw new Error(`${label} returned status \`${body.status}\` instead of \`success\`.`);
  }
}

async function run() {
  console.log('🔍 Running analytics smoke tests...');
  let hasFailures = false;

  for (const endpoint of endpoints) {
    try {
      const token = await login(endpoint.role);
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await safeReadBody(response);
        throw new Error(`Request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const payload = await response.json();
      endpoint.validate(payload);

      console.log(`✅ ${endpoint.label} (${endpoint.path})`);
    } catch (error) {
      hasFailures = true;
      console.error(`❌ ${endpoint.label} (${endpoint.path}) -> ${error.message}`);
    }
  }

  if (hasFailures) {
    console.error('\nAnalytics smoke tests failed.');
    process.exitCode = 1;
  } else {
    console.log('\nAll analytics smoke tests passed.');
  }
}

run().catch((error) => {
  console.error('Unexpected error while running analytics smoke tests:', error);
  process.exit(1);
});
