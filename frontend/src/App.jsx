
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/employees";

function App() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    salary: "",
  });
const filteredEmployees = employees.filter((employee) =>
  `${employee.name} ${employee.email} ${employee.department}`
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);
  // Load employees from MongoDB
  async function fetchEmployees() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load employees");
      }

      const data = await response.json();
      setEmployees(data);
      setError("");
    } catch (err) {
      setError("Could not connect to the backend. Please check the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm({
      name: "",
      email: "",
      department: "",
      salary: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  // Add or update employee
  async function handleSubmit(e) {
    e.preventDefault();

    const employeeData = {
      ...form,
      salary: Number(form.salary),
    };

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(employeeData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save employee");
      }

      await fetchEmployees();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  // Open the form for editing
  function handleEdit(employee) {
    setForm({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      salary: employee.salary,
    });

    setEditingId(employee._id);
    setShowForm(true);
  }

  // Delete employee
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete employee");
      }

      await fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Employee Management System</h1>
        <p>Manage your employees in one place</p>
      </header>

      <main className="container">
        <div className="dashboard-card">
          <div>
            <h2>Total Employees</h2>
            <p className="employee-count">{employees.length}</p>
          </div>

          <button
            className="add-button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Add Employee
          </button>
        </div>

        {showForm && (
          <form className="employee-form" onSubmit={handleSubmit}>
            <h2>{editingId ? "Edit Employee" : "Add New Employee"}</h2>

            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleChange}
              required
            />

            <input
              name="salary"
              type="number"
              min="0"
              placeholder="Monthly Salary"
              value={form.salary}
              onChange={handleChange}
              required
            />

            <div className="form-actions">
              <button className="add-button" type="submit">
                {editingId ? "Update Employee" : "Save Employee"}
              </button>

              <button
                className="cancel-button"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <section className="employee-section">
  <h2>Employee List</h2>

  <input
    className="search-input"
    type="text"
    placeholder="Search by name, email, or department..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

          {error && <p className="error-message">{error}</p>}

          {loading ? (
            <p>Loading employees...</p>
          ) : filteredEmployees.length === 0 ? (
            <p className="empty-message">No employees added yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td>{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>{employee.department}</td>
                      <td>
                        ₹{Number(employee.salary).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(employee)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleDelete(employee._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
