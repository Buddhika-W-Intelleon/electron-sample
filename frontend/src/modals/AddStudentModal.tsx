import React from "react";

type AddStudentModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; address: string; className: string }) => void;
};

const AddStudentModal: React.FC<AddStudentModalProps> = ({ show, onClose, onSubmit }) => {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [className, setClassName] = React.useState("");

  const handleSubmit = () => {
    if (!name || !address || !className) {
      alert("All fields are required.");
      return;
    }
    onSubmit({ name, address, className });
    setName("");
    setAddress("");
    setClassName("");
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>Add Student</h2>

        <label>Name</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="mt-3">Address</label>
        <input
          type="text"
          className="form-control"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <label className="mt-3">Class</label>
        <input
          type="text"
          className="form-control"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Add</button>
        </div>
      </div>

      {/* Backdrop click to close */}
      <div className="modal-overlay" onClick={onClose}></div>
    </div>
  );
};

export default AddStudentModal
