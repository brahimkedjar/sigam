import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FiUsers, FiKey, FiCheck, FiX, FiPlus, FiShield, FiMail, FiTrash2, FiChevronRight } from 'react-icons/fi';
import styles from './AdminPanel.module.css';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import router from 'next/router';
import { useAuthStore } from '@/store/useAuthStore';
import { ViewType } from '../../src/types/viewtype';
import { useViewNavigator } from '@/hooks/useViewNavigator';

type Role = {
  id: number;
  name: string;
  permissions: Permission[];
};

type Permission = {
  id: number;
  name: string;
};

type User = {
  id: number;
  email: string;
  role: Role | null;
};

export default function AdminPanel() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [newRole, setNewRole] = useState('');
  const [newPermission, setNewPermission] = useState('');
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRoleForUser, setSelectedRoleForUser] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('roles');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRoles, setEditingRoles] = useState<{ [id: number]: boolean }>({});
  const [editingPermissions, setEditingPermissions] = useState<{ [id: number]: boolean }>({});
  const [roleInputs, setRoleInputs] = useState<{ [id: number]: string }>({});
  const [permissionInputs, setPermissionInputs] = useState<{ [id: number]: string }>({});
  const [userSearch, setUserSearch] = useState('');
  const { currentView, navigateTo } = useViewNavigator('Admin-Panel');
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({message, type});
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permissionsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/admin/roles`),
        axios.get(`${API_URL}/admin/permissions`),
        axios.get(`${API_URL}/admin/users`)
      ]);
      setRoles(rolesRes.data);
      setPermissions(permissionsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      showNotification("Failed to load data", 'error');
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createRole = async () => {
    if (!newRole.trim()) return;
    try {
      await axios.post(`${API_URL}/admin/role`, { name: newRole });
      setNewRole('');
      showNotification('Role created successfully', 'success');
      fetchAll();
    } catch (error) {
      showNotification('Failed to create role', 'error');
    }
  };

  const createPermission = async () => {
    if (!newPermission.trim()) return;
    try {
      await axios.post(`${API_URL}/admin/permission`, { name: newPermission });
      setNewPermission('');
      showNotification('Permission created successfully', 'success');
      fetchAll();
    } catch (error) {
      showNotification('Failed to create permission', 'error');
    }
  };

  const assignPermissions = async () => {
    if (!selectedRole || selectedPermissions.length === 0) return;
    try {
      await axios.post(`${API_URL}/admin/role/assign-permissions`, {
        roleId: selectedRole,
        permissionIds: selectedPermissions,
      });
      setSelectedRole(null);
      setSelectedPermissions([]);
      showNotification('Permissions assigned successfully', 'success');
      fetchAll();
    } catch (error) {
      showNotification('Failed to assign permissions', 'error');
    }
  };

  const assignRoleToUser = async () => {
    if (!selectedUser || !selectedRoleForUser) return;
    try {
      await axios.post(`${API_URL}/admin/user/assign-role`, {
        userId: selectedUser,
        roleId: selectedRoleForUser,
      });
      setSelectedUser(null);
      setSelectedRoleForUser(null);
      showNotification('Role assigned to user successfully', 'success');
      fetchAll();
    } catch (error) {
      showNotification('Failed to assign role to user', 'error');
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };
   
const deleteRole = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/admin/role/${id}`);
    showNotification('Role deleted successfully', 'success');
    fetchAll();
  } catch {
    showNotification('Failed to delete role', 'error');
  }
};

const updateRole = async (id: number, name: string) => {
  try {
    await axios.put(`${API_URL}/admin/role/${id}`, { name });
    showNotification('Role updated successfully', 'success');
    fetchAll();
  } catch {
    showNotification('Failed to update role', 'error');
  }
};

const deletePermission = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/admin/permission/${id}`);
    showNotification('Permission deleted successfully', 'success');
    fetchAll();
  } catch {
    showNotification('Failed to delete permission', 'error');
  }
};

const updatePermission = async (id: number, name: string) => {
  try {
    await axios.put(`${API_URL}/admin/permission/${id}`, { name });
    showNotification('Permission updated successfully', 'success');
    fetchAll();
  } catch {
    showNotification('Failed to update permission', 'error');
  }
};


return (
  <div className={styles['app-container']}>
    <Navbar />
    <div className={styles['app-content']}>
      <Sidebar currentView={currentView} navigateTo={navigateTo} />
      <main className={styles['main-content']}>
        <div className={styles['breadcrumb']}>
          <span>SIGAM</span>
          <FiChevronRight className={styles['breadcrumb-arrow']} />
          <span>Admin Panel</span>
        </div>

        <div className={styles['admin-container']}>
          {notification && (
  <div className={`${styles.notification} ${notification.type === 'success' ? styles.notificationSuccess : styles.notificationError}`}>
    {notification.type === 'success' ? <FiCheck /> : <FiX />}
    <span>{notification.message}</span>
  </div>
)}

          <div className={styles['admin-header']}>
            <h1><FiShield /> Administration Panel</h1>
            <div className={styles['admin-tabs']}>
              <button
                className={`${styles['admin-tabs-button']} ${activeTab === 'roles' ? styles.active : ''}`}
                onClick={() => setActiveTab('roles')}
              >
                <FiKey /> Roles & Permissions
              </button>
              <button
                className={`${styles['admin-tabs-button']} ${activeTab === 'users' ? styles.active : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <FiUsers /> User Management
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className={styles['loading-spinner']}></div>
          ) : (
            <>
              {activeTab === 'roles' && (
                <div className={styles['admin-content']}>
                  <div className={styles['admin-card']}>
                    <h2><FiPlus /> Create New Role</h2>
                    <div className={`${styles['form-group']} ${styles['form-scope']}`}>
                      <input
                        type="text"
                        value={newRole}
                        onChange={e => setNewRole(e.target.value)}
                        placeholder="Enter role name"
                        onKeyPress={e => e.key === 'Enter' && createRole()}
                      />
                      <button onClick={createRole} className={styles.primary}>
                        Create Role
                      </button>
                    </div>
                  </div>

                  <div className={styles['admin-card']}>
                    <h2><FiPlus /> Create New Permission</h2>
                    <div className={`${styles['form-group']} ${styles['form-scope']}`}>
                      <input
                        type="text"
                        value={newPermission}
                        onChange={e => setNewPermission(e.target.value)}
                        placeholder="Enter permission name"
                        onKeyPress={e => e.key === 'Enter' && createPermission()}
                      />
                      <button onClick={createPermission} className={styles.primary}>
                        Create Permission
                      </button>
                    </div>
                  </div>

                  <div className={styles['admin-card']}>
                    <h2>🛠️ Manage Existing Roles</h2>
                    {roles.map(role => (
                      <div key={role.id} className={`${styles['form-inline']} ${styles['form-scope']}`}>
                        <input
                          value={roleInputs[role.id] ?? role.name}
                          disabled={!editingRoles[role.id]}
                          onChange={(e) =>
                            setRoleInputs(prev => ({ ...prev, [role.id]: e.target.value }))
                          }
                        />
                        {editingRoles[role.id] ? (
                          <button
                            className={styles.success}
                            onClick={() => {
                              updateRole(role.id, roleInputs[role.id]);
                              setEditingRoles(prev => ({ ...prev, [role.id]: false }));
                            }}
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            className={styles.warning}
                            onClick={() => {
                              setEditingRoles(prev => ({ ...prev, [role.id]: true }));
                              setRoleInputs(prev => ({ ...prev, [role.id]: role.name }));
                            }}
                          >
                            Modify
                          </button>
                        )}
                        <button onClick={() => deleteRole(role.id)} className={styles.danger}>
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className={styles['admin-card']}>
                    <h2>🛠️ Manage Existing Permissions</h2>
                    {permissions.map(permission => (
                      <div key={permission.id} className={`${styles['form-inline']} ${styles['form-scope']}`}>
                        <input
                          value={permissionInputs[permission.id] ?? permission.name}
                          disabled={!editingPermissions[permission.id]}
                          onChange={(e) =>
                            setPermissionInputs(prev => ({
                              ...prev,
                              [permission.id]: e.target.value,
                            }))
                          }
                        />
                        {editingPermissions[permission.id] ? (
                          <button
                            className={styles.success}
                            onClick={() => {
                              updatePermission(permission.id, permissionInputs[permission.id]);
                              setEditingPermissions(prev => ({ ...prev, [permission.id]: false }));
                            }}
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            className={styles.warning}
                            onClick={() => {
                              setEditingPermissions(prev => ({
                                ...prev,
                                [permission.id]: true,
                              }));
                              setPermissionInputs(prev => ({
                                ...prev,
                                [permission.id]: permission.name,
                              }));
                            }}
                          >
                            Modify
                          </button>
                        )}
                        <button onClick={() => deletePermission(permission.id)} className={styles.danger}>
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className={`${styles['admin-card']} ${styles['form-scope']}`}>
                    <h2><FiKey /> Assign Permissions to Role</h2>
                    <div className={styles['form-group']}>
                      <select
                        value={selectedRole || ''}
                        onChange={e => setSelectedRole(e.target.value ? Number(e.target.value) : null)}
                        className={styles['full-width']}
                      >
                        <option value="">Select a role</option>
                        {roles?.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles['permissions-grid']}>
                      {permissions?.map(p => (
                        <div
                          key={p.id}
                          className={`${styles['permission-item']} ${selectedPermissions.includes(p.id) ? styles.selected : ''}`}
                          onClick={() => handlePermissionToggle(p.id)}
                        >
                          <div className={styles['permission-checkbox']}>
                            {selectedPermissions.includes(p.id) && <FiCheck />}
                          </div>
                          <span>{p.name}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={assignPermissions}
                      className={`${styles.primary} ${styles['full-width']}`}
                      disabled={!selectedRole || selectedPermissions.length === 0}
                    >
                      Assign Selected Permissions
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className={styles['admin-content']}>
                  <div className={`${styles['admin-card']} ${styles['form-scope']}`}>
                    <h2><FiUsers /> Assign Role to User</h2>

                    <div className={styles['form-group']}>
                      <label>Select User</label>
                      <input
                        type="text"
                        placeholder="Search by email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className={styles['full-width']}
                      />
                      <select
                        value={selectedUser || ''}
                        onChange={e => setSelectedUser(e.target.value ? Number(e.target.value) : null)}
                        className={styles['full-width']}
                      >
                        <option value="">-- Choose a user --</option>
                        {users
                          .filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase()))
                          .map(u => (
                            <option key={u.id} value={u.id}>
                              {u.email} {u.role ? `(${u.role.name})` : ''}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className={styles['form-group']}>
                      <label>Select Role</label>
                      <select
                        value={selectedRoleForUser || ''}
                        onChange={e => setSelectedRoleForUser(e.target.value ? Number(e.target.value) : null)}
                        className={styles['full-width']}
                      >
                        <option value="">-- Choose a role --</option>
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={assignRoleToUser}
                      className={`${styles.primary} ${styles['full-width']}`}
                      disabled={!selectedUser || !selectedRoleForUser}
                    >
                      Assign Role to User
                    </button>
                  </div>

                  <div className={styles['admin-card']}>
                    <h2><FiUsers /> User List</h2>
                    <div className={styles['users-table']}>
                      <div className={styles['table-header']}>
                        <div>Email</div>
                        <div>Role</div>
                        <div>Permissions</div>
                      </div>

                      {users
                        .filter(user =>
                          user.email.toLowerCase().includes(userSearch.toLowerCase())
                        )
                        .map(user => (
                          <div key={user.id} className={styles['table-row']}>
                            <div><FiMail /> {user.email}</div>
                            <div>{user.role?.name || 'No role assigned'}</div>
                            <div className={styles['permissions-list']}>
                              {user.role?.permissions?.length ? (
                                user.role.permissions.map(p => (
                                  <span key={p.id} className={styles['permission-badge']}>{p.name}</span>
                                ))
                              ) : (
                                <span className={styles['no-permission']}>None</span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  </div>
);

}