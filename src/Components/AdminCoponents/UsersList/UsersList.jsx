import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Form } from 'react-bootstrap';
import { FaUsersCog, FaEdit, FaTrashAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { ThreeDot } from 'react-loading-indicators';
import './UsersList.scss';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Expandable row state
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/users`, {
        withCredentials: true
      });
      const dataObj = res.data?.data;
      const usersArray = Array.isArray(dataObj) ? dataObj : dataObj?.data || [];
      setUsers(usersArray);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/users/${user.id}`,
        { isActive: !user.isActive },
        { withCredentials: true }
      );
      fetchUsers();
    } catch (err) {
      alert("حدث خطأ أثناء تعديل حالة المستخدم");
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('هل أنت متأكد من رفض/حذف هذا المستخدم بشكل نهائي؟')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/v1/users/${id}`, {
          withCredentials: true
        });
        fetchUsers();
      } catch (err) {
        alert("حدث خطأ أثناء مسح المستخدم");
      }
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superAdmin': return <span className="role-badge role-superadmin">مسؤول</span>;
      case 'admin': return <span className="role-badge role-admin">بائع</span>;
      // case 'manager': return <span className="role-badge role-manager">مدير</span>;
      // case 'vendor': return <span className="role-badge role-vendor">بائع</span>;
      // case 'customer': return <span className="role-badge role-customer">مستخدم عادي</span>;
      default: return <span className="role-badge role-default">{role}</span>;
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/users/${currentUser.id}`, currentUser, {
        withCredentials: true
      });
      setShowEdit(false);
      fetchUsers();
    } catch (err) {
      alert("حدث خطأ أثناء تعديل بيانات المستخدم");
    }
  };

  if (loading) {
    return (
      <div className="users-admin-wrapper">
        <div className="loading-wrapper">
          <ThreeDot color="#ff6f33" size="medium" text="جاري تحميل الحسابات..." textColor="#ff6f33" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-admin-wrapper">
        <div className="alert alert-danger" style={{ borderRadius: '10px' }}>خطأ: {error}</div>
      </div>
    );
  }

  const filteredUsers = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter);

  return (
    <div className="users-admin-wrapper">
      <div className="header-sec" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>
          <FaUsersCog /> إدارة الحسابات
        </h2>
        <div>
          <Form.Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="advanced-input"
            style={{ minWidth: '200px' }}
          >
            <option value="all">الكل (All)</option>
            {/* <option value="customer">مستخدم عادي (Customer)</option>
            <option value="vendor">بائع (Vendor)</option>
            <option value="manager">مدير (Manager)</option> */}
            <option value="admin">بائع (Admin)</option>
            <option value="superAdmin">مسؤول (Super Admin)</option>
          </Form.Select>
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>الصلاحية</th>
                <th>رقم الهاتف</th>
                <th>مجال العمل</th>
                <th>وصف المنتجات</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-5 text-center text-muted">لا يوجد حسابات مسجلين حتى الآن.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <React.Fragment key={user.id}>
                    <tr
                      className={`user-row ${expandedRow === user.id ? 'expanded' : ''}`}
                      onClick={() => setExpandedRow(expandedRow === user.id ? null : user.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="user-info">
                          <span className="user-name">{user.name}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </td>
                      <td className="text-center">{getRoleBadge(user.role)}</td>
                      <td>{user.phone || <span className="text-muted">-</span>}</td>
                      <td>{user.businessField || <span className="text-muted">-</span>}</td>
                      <td>
                        <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.productDescription}>
                          {user.productDescription || <span className="text-muted">-</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'مفعل' : 'قيد المراجعة'}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className={`btn-toggle ${user.isActive ? 'is-active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleUserStatus(user); }}
                            title={user.isActive ? 'إلغاء التفعيل' : 'تفعيل الحساب'}
                          >
                            {user.isActive ? <FaTimes /> : <FaCheck />}
                          </button>
                          <button
                            className="btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentUser(user);
                              setShowEdit(true);
                            }}
                            title="تعديل"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-delete"
                            onClick={(e) => { e.stopPropagation(); deleteUser(user.id); }}
                            title="حذف"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === user.id && (
                      <tr className="expanded-details-row">
                        <td colSpan="6">
                          <div className="expanded-details-content">
                            <div className="detail-section">
                              <strong>عن المستخدم/المتجر:</strong>
                              <p>{user.userDescription || 'لا يوجد وصف متاح.'}</p>
                            </div>
                            <div className="detail-section">
                              <strong>تفاصيل المنتجات:</strong>
                              <p>{user.productDescription || 'لا توجد تفاصيل متاحة.'}</p>
                            </div>
                            <div className="detail-section">
                              <strong>لماذا ترغب بالانضمام إلينا؟ (Why Us):</strong>
                              <p>{user.whyUs || 'غير متوفر.'}</p>
                            </div>
                            <div className="detail-row">
                              <div><strong>العنوان:</strong> {user.address || 'غير محدد'}</div>
                              <div><strong>رقم إضافي:</strong> {user.sec_phone || 'غير محدد'}</div>
                              <div>
                                <strong>الروابط:</strong>
                                <div className="mt-2 social-links-admin">
                                  {user.fbLink && <a href={user.fbLink} target="_blank" rel="noopener noreferrer">Facebook</a>}
                                  {user.instLink && <a href={user.instLink} target="_blank" rel="noopener noreferrer">Instagram</a>}
                                  {user.tiktokLink && <a href={user.tiktokLink} target="_blank" rel="noopener noreferrer">TikTok</a>}
                                  {user.gMapLink && <a href={user.gMapLink} target="_blank" rel="noopener noreferrer">Google Maps</a>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showEdit} onHide={() => setShowEdit(false)} dialogClassName="edit-user-modal" size="xl" dir="rtl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2 text-primary" /> تعديل بيانات المستخدم
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser && (
            <Form onSubmit={handleEditSubmit} className="advanced-form">
              <div className="form-section">
                <h5 className="section-title">المعلومات الأساسية</h5>
                <div className="row g-3">
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>الاسم</Form.Label>
                      <Form.Control type="text" value={currentUser.name} onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })} required className="advanced-input" />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>البريد الإلكتروني</Form.Label>
                      <Form.Control type="email" value={currentUser.email || ''} onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>مجال العمل</Form.Label>
                      <Form.Control type="text" value={currentUser.businessField || ''} onChange={(e) => setCurrentUser({ ...currentUser, businessField: e.target.value })} className="advanced-input" />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>الصلاحية (Role)</Form.Label>
                      <Form.Select
                        value={currentUser.role || 'user'}
                        onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                        className="advanced-input role-select"
                      >
                        {/* <option value="customer">مستخدم عادي (Customer)</option>
                        <option value="user">بائع (User)</option>
                        <option value="manager">مدير (Manager)</option> */}
                        <option value="admin">بائع (Admin)</option>
                        <option value="superAdmin">مسؤول (Super Admin)</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>
              </div>

              <div className="mt-4 form-section">
                <h5 className="section-title">بيانات التواصل</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>رقم الهاتف</Form.Label>
                      <Form.Control type="text" value={currentUser.phone || ''} onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                  <div className="col-md-4">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>رقم إضافي</Form.Label>
                      <Form.Control type="text" value={currentUser.sec_phone || ''} onChange={(e) => setCurrentUser({ ...currentUser, sec_phone: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                  <div className="col-md-4">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>العنوان</Form.Label>
                      <Form.Control type="text" value={currentUser.address || ''} onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })} className="advanced-input" />
                    </Form.Group>
                  </div>
                </div>
              </div>

              <div className="mt-4 form-section">
                <h5 className="section-title">الروابط ومواقع التواصل</h5>
                <div className="row g-3">
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>Facebook</Form.Label>
                      <Form.Control type="text" value={currentUser.fbLink || ''} onChange={(e) => setCurrentUser({ ...currentUser, fbLink: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>Instagram</Form.Label>
                      <Form.Control type="text" value={currentUser.instLink || ''} onChange={(e) => setCurrentUser({ ...currentUser, instLink: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>TikTok</Form.Label>
                      <Form.Control type="text" value={currentUser.tiktokLink || ''} onChange={(e) => setCurrentUser({ ...currentUser, tiktokLink: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>Google Maps</Form.Label>
                      <Form.Control type="text" value={currentUser.gMapLink || ''} onChange={(e) => setCurrentUser({ ...currentUser, gMapLink: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                </div>
              </div>

              <div className="mt-4 form-section">
                <h5 className="section-title">التفاصيل والوصف</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>عن المتجر/المستخدم</Form.Label>
                      <Form.Control as="textarea" rows={4} value={currentUser.vendorDescription || ''} onChange={(e) => setCurrentUser({ ...currentUser, vendorDescription: e.target.value })} className="advanced-input" />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>لماذا ترغب بالانضمام إلينا؟</Form.Label>
                      <Form.Control as="textarea" rows={4} value={currentUser.whyUs || ''} onChange={(e) => setCurrentUser({ ...currentUser, whyUs: e.target.value })} className="advanced-input" />
                    </Form.Group>
                  </div>
                  <div className="col-md-12">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>وصف المنتجات</Form.Label>
                      <Form.Control as="textarea" rows={5} value={currentUser.productDescription || ''} onChange={(e) => setCurrentUser({ ...currentUser, productDescription: e.target.value })} className="advanced-input" />
                    </Form.Group>
                  </div>
                </div>
              </div>

              <div className="mt-4 modal-footer-custom">
                <button type="button" className="btn-cancel" onClick={() => setShowEdit(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn-save">
                  <FaCheck className="me-2" /> حفظ التعديلات
                </button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UsersList;
