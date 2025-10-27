import { expect, test, Page } from '@playwright/test';

type DashboardRole = 'student' | 'professor' | 'registrar' | 'admission' | 'dean';

type DashboardDefinition = {
  name: string;
  role: DashboardRole;
  path: string;
  heading: string | RegExp;
  analyticsPath: string;
  analytics: Record<string, unknown>;
  keyHeadings: (string | RegExp)[];
};

type ViewportDefinition = {
  label: string;
  size: { width: number; height: number };
};

const viewports: ViewportDefinition[] = [
  { label: 'mobile', size: { width: 390, height: 844 } },
  { label: 'tablet', size: { width: 820, height: 1180 } },
  { label: 'desktop', size: { width: 1440, height: 900 } }
];

const dashboards: DashboardDefinition[] = [
  {
    name: 'Student',
    role: 'student',
    path: '/student/dashboard',
    heading: /Welcome back, Student!/,
    analyticsPath: '/analytics/student',
    analytics: {
      student: {
        studentNo: '2025-0001',
        program: 'BS Computer Science',
        status: 'regular'
      },
      statistics: {
        gpa: 1.75,
        totalSubjects: 42,
        incCount: 1,
        failedCount: 2
      },
      enrollments: [
        {
          term: { schoolYear: '2024-2025', semester: '1st Semester' },
          totalUnits: 18
        },
        {
          term: { schoolYear: '2024-2025', semester: '2nd Semester' },
          totalUnits: 21
        }
      ]
    },
    keyHeadings: [
      'Program Information',
      'Academic Performance',
      'Grade Distribution',
      'Quick Actions',
      'Announcements'
    ]
  },
  {
    name: 'Professor',
    role: 'professor',
    path: '/professor/dashboard',
    heading: /Professor Dashboard/,
    analyticsPath: '/analytics/professor',
    analytics: {
      statistics: {
        totalSections: 4,
        totalStudents: 140,
        incCount: 3,
        averageGrade: 1.6
      },
      sections: [
        {
          name: 'CS101-A',
          subject: 'Introduction to Computing',
          studentCount: 36,
          gradedCount: 32
        },
        {
          name: 'CS102-B',
          subject: 'Data Structures',
          studentCount: 34,
          gradedCount: 29
        }
      ],
      gradeDistribution: {
        '1.0': 4,
        '1.5': 12,
        '2.0': 18,
        INC: 3
      }
    },
    keyHeadings: [
      'My Department',
      'Grade Distribution',
      'Section Enrollment',
      'Section Overview'
    ]
  },
  {
    name: 'Registrar',
    role: 'registrar',
    path: '/registrar/dashboard',
    heading: /Registrar Dashboard/,
    analyticsPath: '/analytics/registrar',
    analytics: {
      currentTerm: {
        semester: '1st Semester',
        schoolYear: '2024-2025'
      },
      enrollment: {
        total: 1800,
        confirmed: 1620,
        pending: 90,
        cancelled: 45
      },
      grades: {
        approved: 1240,
        pending: 180,
        returned: 12
      },
      programs: [
        {
          name: 'BS Computer Science',
          code: 'BSCS',
          enrolledStudents: 480,
          totalStudents: 620
        },
        {
          name: 'BS Information Technology',
          code: 'BSIT',
          enrolledStudents: 520,
          totalStudents: 690
        }
      ]
    },
    keyHeadings: [
      /Current Term/, 
      'Enrollment Status Overview',
      'Grade Workflow',
      'Program Enrollment Overview'
    ]
  },
  {
    name: 'Admission',
    role: 'admission',
    path: '/admission/dashboard',
    heading: /Admission Dashboard/,
    analyticsPath: '/analytics/admission',
    analytics: {
      metrics: {
        pending: 38,
        confirmedToday: 12,
        total: 245,
        confirmationRate: 82.5
      },
      trend: [
        { label: 'Mon', count: 12 },
        { label: 'Tue', count: 17 },
        { label: 'Wed', count: 15 },
        { label: 'Thu', count: 21 },
        { label: 'Fri', count: 18 }
      ],
      programs: [
        { name: 'BSCS', count: 34 },
        { name: 'BSIT', count: 26 },
        { name: 'BSA', count: 19 }
      ],
      recent: [
        {
          studentNo: '2025-0101',
          studentEmail: 'jamie.delacruz@example.com',
          program: 'BS Computer Science',
          subjects: 6,
          totalUnits: 18,
          term: '1st Sem • 2024-2025',
          dateEnrolled: '2024-10-01T08:35:00.000Z'
        },
        {
          studentNo: '2025-0102',
          studentEmail: 'ian.santos@example.com',
          program: 'BS Information Technology',
          subjects: 5,
          totalUnits: 15,
          term: '1st Sem • 2024-2025',
          dateEnrolled: '2024-10-01T11:10:00.000Z'
        }
      ]
    },
    keyHeadings: [
      '7-Day Enrollment Trend',
      'Top Programs by Confirmed Enrollments',
      'Recent Enrollment Activity'
    ]
  },
  {
    name: 'Dean',
    role: 'dean',
    path: '/dean/dashboard',
    heading: /Dean Dashboard/,
    analyticsPath: '/analytics/dean',
    analytics: {
      currentTerm: {
        semester: '1st Semester',
        schoolYear: '2024-2025'
      },
      professorLoad: [
        {
          name: 'Prof. Dela Cruz',
          department: 'Computer Science',
          sections: 3,
          totalStudents: 105
        },
        {
          name: 'Prof. Santos',
          department: 'Information Technology',
          sections: 4,
          totalStudents: 128
        }
      ],
      subjectPerformance: [
        {
          name: 'Data Structures',
          code: 'CS102',
          sections: 3,
          totalStudents: 98,
          passRate: 88.4
        },
        {
          name: 'Database Systems',
          code: 'CS201',
          sections: 2,
          totalStudents: 76,
          passRate: 84.2
        }
      ]
    },
    keyHeadings: [
      /Current Term/, 
      'Professor Section Load',
      'Subject Pass Rates',
      'Professor Load',
      'Subject Performance'
    ]
  }
];

const createUser = (role: DashboardRole) => {
  switch (role) {
    case 'student':
      return {
        id: 'user-student',
        email: 'student@example.com',
        role,
        student: {
          studentNo: '2025-0001',
          program: 'BS Computer Science',
          status: 'regular'
        }
      };
    case 'professor':
      return {
        id: 'user-professor',
        email: 'professor@example.com',
        role,
        professor: {
          department: 'Computer Science'
        }
      };
    case 'registrar':
      return {
        id: 'user-registrar',
        email: 'registrar@example.com',
        role
      };
    case 'admission':
      return {
        id: 'user-admission',
        email: 'admissions@example.com',
        role
      };
    case 'dean':
      return {
        id: 'user-dean',
        email: 'dean@example.com',
        role
      };
    default:
      return {
        id: 'user-generic',
        email: 'user@example.com',
        role
      };
  }
};

const interceptApi = async (page: Page, definition: DashboardDefinition) => {
  const user = createUser(definition.role);

  await page.addInitScript(({ snapshot }) => {
    window.localStorage.setItem('token', snapshot.token);
    window.localStorage.setItem('user', snapshot.userJson);
  }, {
    snapshot: {
      token: 'playwright-token',
      userJson: JSON.stringify(user)
    }
  });

  await page.route('**/api/**', async route => {
    const url = route.request().url();

    if (url.endsWith('/auth/me')) {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: { user } })
      });
      return;
    }

    if (url.includes(definition.analyticsPath)) {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: definition.analytics })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: {} })
    });
  });
};

test.describe('Role-based dashboards', () => {
  for (const dashboard of dashboards) {
    test.describe(`${dashboard.name} dashboard`, () => {
      for (const viewport of viewports) {
        test(`${viewport.label} layout renders critical sections`, async ({ page }) => {
          await page.setViewportSize(viewport.size);
          await interceptApi(page, dashboard);

          await page.goto(dashboard.path);

          await expect(page.getByText('Richwell Portal')).toBeVisible();
          await expect(page.getByRole('heading', { name: dashboard.heading })).toBeVisible();

          for (const heading of dashboard.keyHeadings) {
            await expect(page.getByRole('heading', { name: heading })).toBeVisible();
          }

          const chartCount = await page.locator('canvas').count();
          expect(chartCount).toBeGreaterThan(0);

          await expect(page).toHaveScreenshot(`${dashboard.role}-${viewport.label}.png`, {
            fullPage: true,
            animations: 'disabled',
            scale: 'css'
          });
        });
      }
    });
  }
});
