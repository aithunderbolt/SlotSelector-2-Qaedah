import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Reports.css';

const Reports = () => {
  const [classes, setClasses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .order('name', { ascending: true });

      if (classesError) throw classesError;

      // Fetch all attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*');

      if (attendanceError) throw attendanceError;

      // Fetch users (teachers)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, username, assigned_slot_id')
        .eq('role', 'slot_admin');

      if (usersError) throw usersError;

      // Fetch slots
      const { data: slotsData, error: slotsError } = await supabase
        .from('slots')
        .select('*')
        .order('slot_order', { ascending: true });

      if (slotsError) throw slotsError;

      setClasses(classesData || []);
      setAttendanceRecords(attendanceData || []);
      setUsers(usersData || []);
      setSlots(slotsData || []);
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
  }, []);

  const getClassData = () => {
    const classData = [];

    classes.forEach((classItem) => {
      // Count attendance entries for this class
      const attendanceCount = attendanceRecords.filter(
        (record) => record.class_id === classItem.id
      ).length;

      // Only include classes with attendance >= total slots
      if (attendanceCount >= slots.length) {
        // Calculate total students from attendance records
        const totalStudents = attendanceRecords
          .filter((record) => record.class_id === classItem.id)
          .reduce((sum, record) => sum + record.total_students, 0);

        // Get unique slot IDs that have attendance for this class
        const slotIdsWithAttendance = [
          ...new Set(
            attendanceRecords
              .filter((record) => record.class_id === classItem.id)
              .map((record) => record.slot_id)
          ),
        ];

        // Get teacher names for these slots
        const teacherNames = users
          .filter((user) => slotIdsWithAttendance.includes(user.assigned_slot_id))
          .map((user) => user.name || user.username)
          .filter((name) => name)
          .join(', ');

        classData.push({
          name: classItem.name,
          description: classItem.description || '',
          totalStudents: totalStudents,
          teacherNames: teacherNames || 'N/A',
          attendanceCount: attendanceCount,
        });
      }
    });

    // Sort classes by name (TilawahClass1, TilawahClass2, etc.)
    classData.sort((a, b) => {
      const extractNumber = (str) => {
        const match = str.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };
      return extractNumber(a.name) - extractNumber(b.name);
    });

    return classData;
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const classData = getClassData();

      if (classData.length === 0) {
        alert('No classes with complete attendance found to generate report.');
        setGenerating(false);
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pdfWidth - (2 * margin);

      // Process each class separately to create smaller images
      for (let i = 0; i < classData.length; i++) {
        const classItem = classData[i];

        // Create a temporary container for each class
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '700px';
        container.style.padding = '30px';
        container.style.backgroundColor = 'white';
        container.style.fontFamily = 'Arial, sans-serif';
        document.body.appendChild(container);

        // Build HTML content for this class only
        let htmlContent = '';
        
        if (i === 0) {
          htmlContent += `
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="font-size: 22px; margin-bottom: 8px;">Class Report</h1>
              <p style="font-size: 11px; color: #666;">Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
          `;
        }

        htmlContent += `
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 16px; border-bottom: 2px solid #3498db; padding-bottom: 6px; margin-bottom: 12px;">${classItem.name}</h2>
            <div style="font-size: 12px; line-height: 1.6;">
              <div style="margin-bottom: 6px;">
                <strong>Supervisor:</strong> Farheen
              </div>
              <div style="margin-bottom: 6px;">
                <strong>Name of Teachers:</strong> ${classItem.teacherNames}
              </div>
              <div style="margin-bottom: 6px;">
                <strong>Class Summary:</strong> ${classItem.description || 'N/A'}
              </div>
              <div style="margin-bottom: 6px;">
                <strong>Total Students:</strong> ${classItem.totalStudents}
              </div>
            </div>
          </div>
        `;

        container.innerHTML = htmlContent;

        // Wait for fonts to load
        await document.fonts.ready;

        // Convert to canvas with optimized settings
        const canvas = await html2canvas(container, {
          scale: 1.5, // Reduced from 2 to 1.5
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          removeContainer: true
        });

        // Remove temporary container
        document.body.removeChild(container);

        // Convert to JPEG with compression for smaller file size
        const imgData = canvas.toDataURL('image/jpeg', 0.85); // JPEG with 85% quality
        
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add new page if not the first class
        if (i > 0) {
          pdf.addPage();
        }

        // Add image to PDF
        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
      }

      // Save the PDF
      pdf.save(`Class_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error generating PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading report data...</div>;
  }

  const classData = getClassData();

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Reports</h2>
        <button
          onClick={generatePDF}
          disabled={generating || classData.length === 0}
          className="generate-pdf-btn"
        >
          {generating ? 'Generating PDF...' : 'Download PDF Report'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="report-info">
        <p>
          This report includes classes that have attendance entered for all {slots.length} slots.
        </p>
        <p>
          <strong>Classes included in report:</strong> {classData.length}
        </p>
      </div>

      {classData.length === 0 ? (
        <div className="no-data">
          No classes with complete attendance found. Ensure all slots have entered attendance for each class.
        </div>
      ) : (
        <div className="report-preview">
          <h3>Report Preview</h3>
          {classData.map((classItem, index) => (
            <div key={index} className="class-preview-card">
              <h4>{classItem.name}</h4>
              <div className="preview-details">
                <div className="preview-row">
                  <span className="preview-label">Supervisor:</span>
                  <span className="preview-value">Farheen</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Name of Teachers:</span>
                  <span className="preview-value">{classItem.teacherNames}</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Class Summary:</span>
                  <span className="preview-value">{classItem.description || 'N/A'}</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Total Students:</span>
                  <span className="preview-value">{classItem.totalStudents}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
