import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './AttendanceTracking.css';

const AttendanceTracking = ({ user }) => {
  const [classes, setClasses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    class_id: '',
    attendance_date: new Date().toISOString().split('T')[0],
    attendance_time: '',
    total_students: '',
    students_present: '',
    students_absent: '',
    students_on_leave: '',
    notes: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [viewingImage, setViewingImage] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .order('name', { ascending: true });

      if (classesError) throw classesError;
      setClasses(classesData || []);

      // Fetch attendance records for this slot admin
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          classes (
            id,
            name,
            duration
          )
        `)
        .eq('slot_id', user.assigned_slot_id)
        .order('attendance_date', { ascending: false });

      if (attendanceError) throw attendanceError;
      setAttendanceRecords(attendanceData || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.assigned_slot_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update selected class when class_id changes
    if (name === 'class_id') {
      const classItem = classes.find(c => c.id === value);
      setSelectedClass(classItem || null);
    }
  };

  const validateCounts = () => {
    const total = parseInt(formData.total_students) || 0;
    const present = parseInt(formData.students_present) || 0;
    const absent = parseInt(formData.students_absent) || 0;
    const onLeave = parseInt(formData.students_on_leave) || 0;

    if (present + absent + onLeave !== total) {
      setError('Present + Absent + On Leave must equal Total Students');
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadError(null);

    // Validate file count
    if (files.length + attachments.length > 3) {
      setUploadError('Maximum 3 files allowed');
      return;
    }

    // Validate each file
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files (jpg, png, etc.) are allowed');
        return;
      }
      if (file.size > 200 * 1024) {
        setUploadError(`File ${file.name} exceeds 200KB limit`);
        return;
      }
    }

    // Create preview URLs for the new files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setAttachmentPreviews(prev => [...prev, ...newPreviews]);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(attachmentPreviews[index]);
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteAttachment = async (record, fileIndex) => {
    if (!confirm('Delete this file?')) return;

    try {
      const attachments = record.attachments || [];
      const updatedAttachments = attachments.filter((_, i) => i !== fileIndex);
      
      const { error } = await supabase
        .from('attendance')
        .update({ attachments: updatedAttachments })
        .eq('id', record.id);

      if (error) throw error;
      
      // Update the editing record state to reflect the deletion
      if (editingRecord && editingRecord.id === record.id) {
        setEditingRecord({ ...editingRecord, attachments: updatedAttachments });
      }
      
      fetchData();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting attachment:', err);
    }
  };

  const uploadFiles = async (attendanceId) => {
    const uploadedFiles = [];
    
    for (const file of attachments) {
      try {
        // Convert file to base64
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        uploadedFiles.push({ 
          name: file.name, 
          data: base64,
          size: file.size,
          type: file.type
        });
      } catch (err) {
        console.error('Failed to process file:', file.name, err);
        throw new Error(`Failed to process ${file.name}: ${err.message}`);
      }
    }
    
    return uploadedFiles;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCounts()) {
      return;
    }

    // Validate file attachments for both create and edit modes
    if (!editingRecord) {
      // Creating new record - must have attachments
      if (attachments.length === 0) {
        setError('At least one file attachment is required');
        return;
      }
    } else {
      // Editing existing record - must have at least 1 file total (existing + new)
      const totalFiles = (editingRecord.attachments?.length || 0) + attachments.length;
      if (totalFiles === 0) {
        setError('At least one file attachment is required. Cannot save without any files.');
        return;
      }
    }

    // Check for existing record when creating new
    if (!editingRecord) {
      const { data: existingRecord } = await supabase
        .from('attendance')
        .select('id')
        .eq('class_id', formData.class_id)
        .eq('slot_id', user.assigned_slot_id)
        .eq('attendance_date', formData.attendance_date)
        .maybeSingle();

      if (existingRecord) {
        setError('Attendance record already exists for this class and date. Please edit the existing record instead.');
        return;
      }
    }

    try {
      const attendanceData = {
        class_id: formData.class_id,
        slot_id: user.assigned_slot_id,
        admin_user_id: user.id,
        attendance_date: formData.attendance_date,
        attendance_time: formData.attendance_time || null,
        total_students: parseInt(formData.total_students),
        students_present: parseInt(formData.students_present),
        students_absent: parseInt(formData.students_absent),
        students_on_leave: parseInt(formData.students_on_leave),
        notes: formData.notes.trim()
      };

      if (editingRecord) {
        let updatedAttachments = editingRecord.attachments || [];
        
        if (attachments.length > 0) {
          try {
            const uploadedFiles = await uploadFiles(editingRecord.id);
            updatedAttachments = [...updatedAttachments, ...uploadedFiles];
          } catch (uploadErr) {
            setError(`File processing failed: ${uploadErr.message}`);
            return;
          }
        }

        const { error } = await supabase
          .from('attendance')
          .update({ 
            ...attendanceData, 
            attachments: updatedAttachments,
            updated_at: new Date().toISOString() 
          })
          .eq('id', editingRecord.id);

        if (error) throw error;
      } else {
        // Process files first
        let uploadedFiles = [];
        try {
          uploadedFiles = await uploadFiles(null);
        } catch (uploadErr) {
          setError(`File processing failed: ${uploadErr.message}`);
          return;
        }
        
        // Create record with attachments
        const { data: newRecord, error: insertError } = await supabase
          .from('attendance')
          .insert([{ ...attendanceData, attachments: uploadedFiles }])
          .select()
          .single();

        if (insertError) throw insertError;
      }

      setFormData({
        class_id: '',
        attendance_date: new Date().toISOString().split('T')[0],
        attendance_time: '',
        total_students: '',
        students_present: '',
        students_absent: '',
        students_on_leave: '',
        notes: ''
      });
      setAttachments([]);
      setAttachmentPreviews([]);
      setShowForm(false);
      setEditingRecord(null);
      setSelectedClass(null);
      setError(null);
      setUploadError(null);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save attendance record');
      console.error('Error saving attendance:', err);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    const classItem = classes.find(c => c.id === record.class_id);
    setSelectedClass(classItem || null);
    setFormData({
      class_id: record.class_id,
      attendance_date: record.attendance_date,
      attendance_time: record.attendance_time || '',
      total_students: record.total_students.toString(),
      students_present: record.students_present.toString(),
      students_absent: record.students_absent.toString(),
      students_on_leave: record.students_on_leave.toString(),
      notes: record.notes || ''
    });
    setAttachments([]);
    setAttachmentPreviews([]);
    setShowForm(true);
  };

  const handleDelete = async (recordId) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting attendance:', err);
    }
  };

  const handleCancel = () => {
    // Clean up preview URLs
    attachmentPreviews.forEach(url => URL.revokeObjectURL(url));
    
    setShowForm(false);
    setEditingRecord(null);
    setSelectedClass(null);
    setFormData({
      class_id: '',
      attendance_date: new Date().toISOString().split('T')[0],
      attendance_time: '',
      total_students: '',
      students_present: '',
      students_absent: '',
      students_on_leave: '',
      notes: ''
    });
    setAttachments([]);
    setAttachmentPreviews([]);
    setError(null);
    setUploadError(null);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return <div className="loading">Loading attendance data...</div>;
  }


  return (
    <div className="attendance-tracking">
      <div className="attendance-header">
        <h2>Attendance Tracking</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="add-btn">
            Add Attendance Record
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="attendance-form-container">
          <h3>{editingRecord ? 'Edit Attendance' : 'Add Attendance Record'}</h3>
          <form onSubmit={handleSubmit} className="attendance-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="class_id">Class *</label>
                <select
                  id="class_id"
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name} ({classItem.duration} min)
                    </option>
                  ))}
                </select>
                {selectedClass && selectedClass.description && (
                  <div className="class-description-display">
                    {selectedClass.description}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="attendance_date">Date *</label>
                <input
                  type="date"
                  id="attendance_date"
                  name="attendance_date"
                  value={formData.attendance_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="attendance_time">Time</label>
                <input
                  type="time"
                  id="attendance_time"
                  name="attendance_time"
                  value={formData.attendance_time}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="total_students">Total Students *</label>
                <input
                  type="number"
                  id="total_students"
                  name="total_students"
                  value={formData.total_students}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="students_present">Students Present *</label>
                <input
                  type="number"
                  id="students_present"
                  name="students_present"
                  value={formData.students_present}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="students_absent">Students Absent *</label>
                <input
                  type="number"
                  id="students_absent"
                  name="students_absent"
                  value={formData.students_absent}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="students_on_leave">Students on Leave *</label>
                <input
                  type="number"
                  id="students_on_leave"
                  name="students_on_leave"
                  value={formData.students_on_leave}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any additional notes about this class session"
              />
            </div>

            <div className="form-group">
              <label htmlFor="attachments">
                File Attachments * (1-3 images, max 200KB each)
              </label>
              <input
                type="file"
                id="attachments"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              {uploadError && <div className="upload-error">{uploadError}</div>}
              
              {attachments.length > 0 && (
                <div className="attachment-preview">
                  {attachments.map((file, index) => (
                    <div key={index} className="attachment-item">
                      <div className="attachment-preview-img">
                        <img src={attachmentPreviews[index]} alt={file.name} style={{maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', borderRadius: '4px'}} />
                        <span>{file.name} ({Math.round(file.size / 1024)}KB)</span>
                      </div>
                      <button type="button" onClick={() => removeAttachment(index)} className="remove-file-btn">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {editingRecord && editingRecord.attachments && editingRecord.attachments.length > 0 && (
                <div className="existing-attachments">
                  <strong>Existing files:</strong>
                  {editingRecord.attachments.map((file, index) => (
                    <div key={index} className="attachment-item">
                      <div className="attachment-preview-img">
                        <img src={file.data} alt={file.name} style={{maxWidth: '100px', maxHeight: '100px'}} />
                        <span>{file.name} ({Math.round(file.size / 1024)}KB)</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteAttachment(editingRecord, index)} 
                        className="remove-file-btn"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingRecord ? 'Update Record' : 'Save Record'}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="attendance-list">
        {attendanceRecords.length === 0 ? (
          <div className="no-data">No attendance records found. Add your first record to get started.</div>
        ) : (
          <div className="table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Class</th>
                  <th>Total</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>On Leave</th>
                  <th>Files</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.attendance_date)}</td>
                    <td>{record.classes?.name || 'Unknown'}</td>
                    <td>{record.total_students}</td>
                    <td className="present">{record.students_present}</td>
                    <td className="absent">{record.students_absent}</td>
                    <td className="on-leave">{record.students_on_leave}</td>
                    <td className="files-cell">
                      {record.attachments && record.attachments.length > 0 ? (
                        <div className="files-preview">
                          {record.attachments.map((file, idx) => (
                            <img 
                              key={idx}
                              src={file.data} 
                              alt={file.name}
                              title={`Click to view ${file.name}`}
                              style={{width: '40px', height: '40px', objectFit: 'cover', marginRight: '4px', borderRadius: '4px', cursor: 'pointer', border: '1px solid #dee2e6'}}
                              onClick={() => setViewingImage(file)}
                            />
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="notes-cell">{record.notes || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(record)} className="edit-btn-small">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(record.id)} className="delete-btn-small">
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
      </div>

      {viewingImage && (
        <div className="image-modal" onClick={() => setViewingImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setViewingImage(null)}>×</button>
            <img src={viewingImage.data} alt={viewingImage.name} />
            <div className="image-modal-info">
              <strong>{viewingImage.name}</strong>
              <span>{Math.round(viewingImage.size / 1024)}KB</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracking;
