# 📦 Reusable Components Usage Guide

This guide explains how to use all the reusable components created in Phase 1.

---

## 1. Button Component

**Location:** `src/components/common/Button.jsx`

### Props

- `children` - Button text/content
- `onClick` - Click handler function
- `type` - 'button', 'submit', or 'reset' (default: 'button')
- `variant` - 'primary', 'secondary', 'success', 'danger', 'outline' (default: 'primary')
- `size` - 'sm', 'md', 'lg' (default: 'md')
- `disabled` - Boolean (default: false)
- `fullWidth` - Boolean (default: false)
- `className` - Additional CSS classes

### Usage Examples

```jsx
import Button from './components/common/Button';

// Primary button
<Button onClick={handleClick}>Submit</Button>

// Success button, full width
<Button variant="success" fullWidth>Save Changes</Button>

// Danger button, small size
<Button variant="danger" size="sm">Delete</Button>

// Disabled button
<Button disabled>Loading...</Button>

// Outline button with custom class
<Button variant="outline" className="mt-4">Cancel</Button>
```

---

## 2. InputField Component

**Location:** `src/components/common/InputField.jsx`

### Props

- `label` - Field label text
- `type` - Input type (default: 'text')
- `name` - Input name attribute
- `value` - Input value
- `onChange` - Change handler function
- `placeholder` - Placeholder text
- `error` - Error message to display
- `required` - Boolean (default: false)
- `disabled` - Boolean (default: false)
- `className` - Additional CSS classes

### Usage Examples

```jsx
import InputField from "./components/common/InputField";
import { useState } from "react";

function MyForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <InputField
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        error={errors.email}
        required
      />

      <InputField
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
      />
    </>
  );
}
```

---

## 3. Modal Component

**Location:** `src/components/common/Modal.jsx`

### Props

- `isOpen` - Boolean to control visibility
- `onClose` - Function to call when closing
- `title` - Modal title
- `children` - Modal content
- `size` - 'sm', 'md', 'lg', 'xl' (default: 'md')
- `showCloseButton` - Boolean (default: true)

### Usage Examples

```jsx
import Modal from "./components/common/Modal";
import Button from "./components/common/Button";
import { useState } from "react";

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmation"
        size="md"
      >
        <p>Are you sure you want to proceed?</p>
        <div className="flex gap-2 mt-4">
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button variant="success">Confirm</Button>
        </div>
      </Modal>
    </>
  );
}
```

---

## 4. Table Component

**Location:** `src/components/common/Table.jsx`

### Props

- `columns` - Array of column definitions
- `data` - Array of data objects
- `onRowClick` - Optional function called when row is clicked
- `className` - Additional CSS classes

### Column Definition

```javascript
{
  header: 'Column Title',
  field: 'dataKey',
  width: '200px',  // optional
  render: (value, row) => <CustomCell />  // optional
}
```

### Usage Examples

```jsx
import Table from "./components/common/Table";

function StudentList() {
  const columns = [
    {
      header: "Student ID",
      field: "student_id",
      width: "150px",
    },
    {
      header: "Name",
      field: "name",
    },
    {
      header: "Program",
      field: "program",
    },
    {
      header: "Year Level",
      field: "year_level",
    },
    {
      header: "Status",
      field: "status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  const students = [
    {
      student_id: "2024-001",
      name: "Juan Dela Cruz",
      program: "BSCS",
      year_level: 1,
      status: "active",
    },
    // ... more students
  ];

  const handleRowClick = (student) => {
    console.log("Clicked:", student);
  };

  return (
    <Table columns={columns} data={students} onRowClick={handleRowClick} />
  );
}
```

---

## 5. Dropdown Component

**Location:** `src/components/common/Dropdown.jsx`

### Props

- `label` - Field label
- `name` - Select name attribute
- `value` - Selected value
- `onChange` - Change handler
- `options` - Array of {value, label} objects
- `error` - Error message
- `required` - Boolean (default: false)
- `disabled` - Boolean (default: false)
- `placeholder` - Placeholder text
- `className` - Additional CSS classes

### Usage Examples

```jsx
import Dropdown from "./components/common/Dropdown";
import { useState } from "react";

function EnrollmentForm() {
  const [program, setProgram] = useState("");

  const programOptions = [
    { value: "bscs", label: "BS Computer Science" },
    { value: "bsit", label: "BS Information Technology" },
    { value: "bsce", label: "BS Civil Engineering" },
    { value: "bsed", label: "Bachelor of Education" },
  ];

  return (
    <Dropdown
      label="Select Program"
      name="program"
      value={program}
      onChange={(e) => setProgram(e.target.value)}
      options={programOptions}
      placeholder="Choose a program"
      required
    />
  );
}
```

---

## 6. Alert Component

**Location:** `src/components/common/Alert.jsx`

### Props

- `type` - 'success', 'error', 'warning', 'info' (default: 'info')
- `message` - Alert message text
- `onClose` - Optional close handler
- `className` - Additional CSS classes

### Usage Examples

```jsx
import Alert from "./components/common/Alert";
import { useState } from "react";

function MyComponent() {
  const [alert, setAlert] = useState(null);

  const handleSubmit = async () => {
    try {
      // ... submit logic
      setAlert({ type: "success", message: "Data saved successfully!" });
    } catch (error) {
      setAlert({ type: "error", message: "Failed to save data." });
    }
  };

  return (
    <>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          className="mb-4"
        />
      )}

      {/* Rest of component */}
    </>
  );
}
```

---

## 7. Card Component

**Location:** `src/components/common/Card.jsx`

### Props

- `title` - Card title
- `children` - Card content
- `footer` - Optional footer content
- `headerAction` - Optional action button/element in header
- `className` - Additional CSS classes

### Usage Examples

```jsx
import Card from "./components/common/Card";
import Button from "./components/common/Button";

function Dashboard() {
  return (
    <>
      {/* Simple card */}
      <Card title="Student Information">
        <p>Name: Juan Dela Cruz</p>
        <p>Student ID: 2024-001</p>
      </Card>

      {/* Card with header action */}
      <Card
        title="Enrolled Subjects"
        headerAction={<Button size="sm">Add Subject</Button>}
      >
        <ul>
          <li>Mathematics 101</li>
          <li>English 101</li>
        </ul>
      </Card>

      {/* Card with footer */}
      <Card
        title="Enrollment Summary"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button variant="success">Submit</Button>
          </div>
        }
      >
        <p>Total Units: 24</p>
        <p>Total Amount: ₱15,000</p>
      </Card>
    </>
  );
}
```

---

## 8. Chart Component

**Location:** `src/components/common/Chart.jsx`

### Props

- `type` - 'bar', 'line', 'pie' (default: 'bar')
- `data` - Array of data objects
- `xKey` - Key for X-axis data
- `yKey` - Key for Y-axis data
- `title` - Chart title
- `colors` - Array of color hex codes
- `height` - Chart height in pixels (default: 300)

### Usage Examples

```jsx
import Chart from "./components/common/Chart";

function Analytics() {
  const enrollmentData = [
    { month: "Jan", students: 45 },
    { month: "Feb", students: 52 },
    { month: "Mar", students: 48 },
    { month: "Apr", students: 61 },
  ];

  const gradeDistribution = [
    { name: "1.0 - 1.5", value: 15 },
    { name: "1.75 - 2.5", value: 35 },
    { name: "2.75 - 3.0", value: 25 },
    { name: "Failed", value: 5 },
  ];

  return (
    <>
      {/* Bar Chart */}
      <Chart
        type="bar"
        data={enrollmentData}
        xKey="month"
        yKey="students"
        title="Monthly Enrollment Trends"
        height={350}
      />

      {/* Line Chart */}
      <Chart
        type="line"
        data={enrollmentData}
        xKey="month"
        yKey="students"
        title="Student Growth"
      />

      {/* Pie Chart */}
      <Chart
        type="pie"
        data={gradeDistribution}
        xKey="name"
        yKey="value"
        title="Grade Distribution"
        colors={["#10B981", "#3B82F6", "#F59E0B", "#EF4444"]}
      />
    </>
  );
}
```

---

## 9. API Service

**Location:** `src/utils/api.js`

### Methods

```javascript
import { apiService } from "./utils/api";

// Generic HTTP methods
apiService.get(url, config);
apiService.post(url, data, config);
apiService.put(url, data, config);
apiService.delete(url, config);

// Health check
apiService.healthCheck();

// Auth (Phase 2)
apiService.login(credentials);
apiService.logout();
```

### Usage Examples

```jsx
import { apiService } from "./utils/api";
import { useState } from "react";

function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get("/students");
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          className="mb-4"
        />
      )}

      <Card
        title="Student Registration"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              Register Student
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter student name"
            required
          />

          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="student@example.com"
            required
          />

          <Dropdown
            label="Program"
            name="program"
            value={formData.program}
            onChange={handleChange}
            options={programOptions}
            error={errors.program}
            placeholder="Select program"
            required
          />

          <Dropdown
            label="Year Level"
            name="yearLevel"
            value={formData.yearLevel}
            onChange={handleChange}
            options={yearOptions}
            error={errors.yearLevel}
            placeholder="Select year level"
            required
          />
        </form>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Confirm Registration"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-gray-700">Please confirm the student details:</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>
              <strong>Name:</strong> {formData.name}
            </p>
            <p>
              <strong>Email:</strong> {formData.email}
            </p>
            <p>
              <strong>Program:</strong> {formData.program}
            </p>
            <p>
              <strong>Year Level:</strong> {formData.yearLevel}
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              fullWidth
              onClick={confirmSubmit}
              disabled={loading}
            >
              {loading ? "Registering..." : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default StudentForm;
```

---

## Tips for Using Components

### 1. **Consistency**

Always use the same components across your application for consistent UI/UX.

### 2. **Composition**

Combine components together to build complex UIs:

```jsx
<Card title="Dashboard">
  <Alert type="info" message="Welcome back!" />
  <Table columns={columns} data={data} />
  <Button fullWidth>Load More</Button>
</Card>
```

### 3. **Form Handling**

Use state management for forms:

```jsx
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};
```

### 4. **Loading States**

Always show loading states in buttons:

```jsx
<Button disabled={loading}>{loading ? "Loading..." : "Submit"}</Button>
```

### 5. **Error Handling**

Display errors using Alert component:

```jsx
{
  error && (
    <Alert type="error" message={error} onClose={() => setError(null)} />
  );
}
```

### 6. **Responsive Design**

All components are responsive by default with Tailwind CSS. Use responsive utilities:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

---

## Common Patterns

### Loading State Pattern

```jsx
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get("/data");
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

if (loading) return <div>Loading...</div>;
if (!data) return <div>No data</div>;
```

### Modal Confirmation Pattern

```jsx
const [showModal, setShowModal] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

const handleDelete = (item) => {
  setSelectedItem(item);
  setShowModal(true);
};

const confirmDelete = async () => {
  await apiService.delete(`/items/${selectedItem.id}`);
  setShowModal(false);
  refreshData();
};
```

### Form Validation Pattern

```jsx
const validateForm = () => {
  const newErrors = {};
  if (!formData.field1) newErrors.field1 = "Required";
  if (!formData.field2) newErrors.field2 = "Required";
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = (e) => {
  e.preventDefault();
  if (validateForm()) {
    // Submit form
  }
};
```

---

## Next Steps

Now that you have all these reusable components:

1. **Test each component** - Make sure they work as expected
2. **Create more components** - Add specialized components as needed
3. **Build pages** - Use these components to build actual pages
4. **Move to Phase 2** - Implement authentication and role management

---

## Component Checklist

✅ Button - All variants working  
✅ InputField - With validation  
✅ Modal - Opens and closes properly  
✅ Table - Displays data correctly  
✅ Dropdown - Options loading  
✅ Alert - All types (success, error, warning, info)  
✅ Card - With header, content, footer  
✅ Chart - Bar, Line, Pie charts  
✅ API Service - Connected to backend

---

## Need More Components?

If you need additional components later:

- **Loading Spinner**
- **Pagination**
- **Tabs**
- **Breadcrumbs**
- **Toast Notifications**
- **File Upload**
- **Date Picker**
- **Search Bar**

Just let me know and we can add them!);
}
};

const createStudent = async (studentData) => {
try {
const response = await apiService.post('/students', studentData);
console.log('Created:', response.data);
} catch (err) {
console.error('Error:', err);
}
};

return (
// ... component JSX
);
}

````

---

## Complete Example: Student Form

Here's a complete example combining multiple components:

```jsx
import { useState } from 'react';
import Card from './components/common/Card';
import InputField from './components/common/InputField';
import Dropdown from './components/common/Dropdown';
import Button from './components/common/Button';
import Alert from './components/common/Alert';
import Modal from './components/common/Modal';
import { apiService } from './utils/api';

function StudentForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    program: '',
    yearLevel: ''
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const programOptions = [
    { value: 'bscs', label: 'BS Computer Science' },
    { value: 'bsit', label: 'BS Information Technology' },
  ];

  const yearOptions = [
    { value: '1', label: 'First Year' },
    { value: '2', label: 'Second Year' },
    { value: '3', label: 'Third Year' },
    { value: '4', label: 'Fourth Year' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.program) newErrors.program = 'Program is required';
    if (!formData.yearLevel) newErrors.yearLevel = 'Year level is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setShowModal(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    try {
      await apiService.post('/students', formData);
      setAlert({ type: 'success', message: 'Student registered successfully!' });
      setFormData({ name: '', email: '', program: '', yearLevel: '' });
      setShowModal(false);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to register student' });
    } finally {
      setLoading(false
````
