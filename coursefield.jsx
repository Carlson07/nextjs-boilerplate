// CourseForm.jsx
import React, { useState } from 'react';

const CourseForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'university', // default to university
    // ... other fields
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={onSubmit}>
      {/* ... other fields ... */}
      <div>
        <label>Level</label>
        <select name="level" value={formData.level} onChange={handleChange}>
          <option value="primary">Primary School</option>
          <option value="secondary">Secondary School</option>
          <option value="university">University</option>
        </select>
      </div>
      {/* ... rest of the form ... */}
    </form>
  );
};