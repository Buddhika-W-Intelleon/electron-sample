// frontend/src/pages/DatabasePage.tsx
import React, { useEffect, useState } from "react";
import { Dropdown, Button, Table, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AddStudentModal from "../modals/AddStudentModal";

interface Student {
  id: number;
  name: string;
  address: string;
  class: string;
}

const DatabasePage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);


  const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/students/list");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError("Failed to load students.");
      } finally {
        setLoading(false);
      }
    };

  // --- Fetch students list from backend ---
  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (student: any) => {
    console.log(student);
    await fetch("http://localhost:3001/api/students/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    setShowAddModal(false);
    fetchStudents();
  };
const handleBackup = async () => {
  try {
    setBackupLoading(true);

    const res = await fetch("http://localhost:3001/api/database/backup", {
      method: "POST",
    });

    if (!res.ok) throw new Error("Backup failed");

    alert("✅ Database backup completed!");
  } catch (err) {
    alert("❌ Failed to backup database");
  } finally {
    setBackupLoading(false);
  }
};

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Students Database</h2>

        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/home")}>
            ⬅ Back
          </Button>

          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            ➕ Add New Student
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center mt-4">
          <Spinner animation="border" role="status" />
          <p>Loading students...</p>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-danger">{error}</p>}

      {/* Students Table */}
      {!loading && !error && (
        <Table bordered hover responsive className="shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>Class</th>
              <th style={{ width: "60px" }}>⋮</th>
            </tr>
          </thead>

          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.address}</td>
                  <td>{s.class}</td>

                  {/* Three-dots dropdown */}
                  <td className="text-center">
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="light"
                        size="sm"
                        className="border-0"
                        style={{ background: "transparent" }}
                      >
                        ⋮
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => alert("Update student soon!")}>
                          ✏ Update
                        </Dropdown.Item>
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() => alert("Delete student soon!")}
                        >
                          🗑 Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
      <AddStudentModal
      show={showAddModal}
      onClose={() => setShowAddModal(false)}
      onSubmit={handleAddStudent}
    />
    <Button
  variant="success"
  onClick={handleBackup}
  disabled={backupLoading}
  style={{
    position: "fixed",
    bottom: "24px",
    right: "24px",
    borderRadius: "50px",
    padding: "12px 18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    zIndex: 1000,
  }}
>
  {backupLoading ? "Backing up..." : "💾 Backup DB"}
</Button>

    </div>
    
  );
};


export default DatabasePage;
