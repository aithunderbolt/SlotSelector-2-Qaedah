import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'slot_admin',
    assigned_slot_id: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all users except super admins
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          slots (
            id,
            display_name
          )
        `)
        .eq('role', 'slot_admin')
        .order('username', { ascending: true });

      if (usersError) throw usersError;

      // Fetch all slots
      const { data: slotsData, error: slotsError } = await supabase
        .from('slots')
        .select('*')
        .order('slot_order', { ascending: true });

      if (slotsError) throw slotsError;

      setUsers(usersData);
      setSlots(slotsData);
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

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || '',
        username: user.username,
        password: '',
        role: user.role,
        assigned_slot_id: user.assigned_slot_id || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'slot_admin',
        assigned_slot_id: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'slot_admin',
      assigned_slot_id: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingUser) {
        // Update existing user
        const updateData = {
          name: formData.name || null,
          username: formData.username,
          role: formData.role,
          assigned_slot_id: formData.assigned_slot_id || null,
        };

        // Only update password if provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editingUser.id);

        if (error) throw error;
      } else {
        // Create new user
        if (!formData.password) {
          setError('Password is required for new users');
          return;
        }

        const { error } = await supabase
          .from('users')
          .insert([{
            name: formData.name || null,
            username: formData.username,
            password: formData.password,
            role: formData.role,
            assigned_slot_id: formData.assigned_slot_id || null,
          }]);

        if (error) throw error;
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      setError(err.message);
      console.error('Error saving user:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      fetchData();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting user:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>User Management</h2>
        <button onClick={() => handleOpenModal()} className="add-user-btn">
          Add Slot Admin
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Assigned Slot</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No slot admins found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || '-'}</td>
                  <td>{user.username}</td>
                  <td><span className="role-badge">{user.role}</span></td>
                  <td>
                    {user.slots?.display_name || (user.assigned_slot_id ? 'Unknown Slot' : 'Not Assigned')}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingUser ? 'Edit Slot Admin' : 'Add Slot Admin'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Optional"
                />
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>

              <div className="form-group">
                <label htmlFor="assigned_slot">Assigned Slot</label>
                <select
                  id="assigned_slot"
                  value={formData.assigned_slot_id}
                  onChange={(e) => setFormData({ ...formData, assigned_slot_id: e.target.value })}
                  required
                >
                  <option value="">Select a slot</option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
