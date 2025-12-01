// frontend/src/pages/UploadPage.tsx
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3001/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStatus("File uploaded successfully!");
      } else {
        setStatus("Upload failed.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error uploading file.");
    }
  };

  return (
    <div className="container mt-5">
      <h1>Upload a File</h1>
      <Form.Group controlId="fileUpload" className="mb-3">
        <Form.Label>Select a file to upload:</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} />
      </Form.Group>
      <Button variant="primary" onClick={handleUpload}>
        Upload
      </Button>
      {status && <p className="mt-3">{status}</p>}
    </div>
  );
};

export default UploadPage;
