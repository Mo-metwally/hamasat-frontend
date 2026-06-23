import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Form } from 'react-bootstrap';
import { FaUsersCog, FaEdit, FaTrashAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { ThreeDot } from 'react-loading-indicators';
import './VendorsList.scss';

const VendorsList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);

  // Expandable row state
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/vendors`, {
        withCredentials: true
      });
      const dataObj = res.data?.data;
      const vendorsArray = Array.isArray(dataObj) ? dataObj : dataObj?.data || [];
      setVendors(vendorsArray);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleVendorStatus = async (vendor) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/admin/vendors/${vendor.id}`,
        { isActive: !vendor.isActive },
        { withCredentials: true }
      );
      fetchVendors();
    } catch (err) {
      alert("حدث خطأ أثناء تعديل حالة البائع");
    }
  };

  const deleteVendor = async (id) => {
    if (window.confirm('هل أنت متأكد من رفض/حذف هذا البائع بشكل نهائي؟')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/v1/admin/vendors/${id}`, {
          withCredentials: true
        });
        fetchVendors();
      } catch (err) {
        alert("حدث خطأ أثناء حذف البائع");
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/admin/vendors/${currentVendor.id}`, currentVendor, {
        withCredentials: true
      });
      setShowEdit(false);
      fetchVendors();
    } catch (err) {
      alert("حدث خطأ أثناء تعديل بيانات البائع");
    }
  };

  if (loading) {
    return (
      <div className="vendors-admin-wrapper">
        <div className="loading-wrapper">
          <ThreeDot color="#ff6f33" size="medium" text="جاري تحميل البائعين..." textColor="#ff6f33" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendors-admin-wrapper">
        <div className="alert alert-danger" style={{ borderRadius: '10px' }}>خطأ: {error}</div>
      </div>
    );
  }

  return (
    <div className="vendors-admin-wrapper">
      <div className="header-sec">
        <h2>
          <FaUsersCog /> إدارة البائعين
        </h2>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>البائع</th>
                <th>رقم الهاتف</th>
                <th>مجال العمل</th>
                <th>وصف المنتجات</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-5 text-center text-muted">لا يوجد بائعين مسجلين حتى الآن.</td>
                </tr>
              ) : (
                vendors.map(vendor => (
                  <React.Fragment key={vendor.id}>
                    <tr
                      className={`vendor-row ${expandedRow === vendor.id ? 'expanded' : ''}`}
                      onClick={() => setExpandedRow(expandedRow === vendor.id ? null : vendor.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="vendor-info">
                          <span className="vendor-name">{vendor.name}</span>
                          <span className="vendor-email">{vendor.email}</span>
                        </div>
                      </td>
                      <td>{vendor.phone || <span className="text-muted">-</span>}</td>
                      <td>{vendor.businessField || <span className="text-muted">-</span>}</td>
                      <td>
                        <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={vendor.productDescription}>
                          {vendor.productDescription || <span className="text-muted">-</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${vendor.isActive ? 'active' : 'inactive'}`}>
                          {vendor.isActive ? 'مفعل' : 'قيد المراجعة'}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className={`btn-toggle ${vendor.isActive ? 'is-active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleVendorStatus(vendor); }}
                            title={vendor.isActive ? 'إلغاء التفعيل' : 'تفعيل الحساب'}
                          >
                            {vendor.isActive ? <FaTimes /> : <FaCheck />}
                          </button>
                          <button
                            className="btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentVendor(vendor);
                              setShowEdit(true);
                            }}
                            title="تعديل"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-delete"
                            onClick={(e) => { e.stopPropagation(); deleteVendor(vendor.id); }}
                            title="حذف"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === vendor.id && (
                      <tr className="expanded-details-row">
                        <td colSpan="6">
                          <div className="expanded-details-content">
                            <div className="detail-section">
                              <strong>عن البائع/المتجر:</strong>
                              <p>{vendor.vendorDescription || 'لا يوجد وصف متاح.'}</p>
                            </div>
                            <div className="detail-section">
                              <strong>تفاصيل المنتجات:</strong>
                              <p>{vendor.productDescription || 'لا توجد تفاصيل متاحة.'}</p>
                            </div>
                            <div className="detail-section">
                              <strong>لماذا ترغب بالانضمام إلينا؟ (Why Us):</strong>
                              <p>{vendor.whyUs || 'غير متوفر.'}</p>
                            </div>
                            <div className="detail-row">
                              <div><strong>العنوان:</strong> {vendor.address || 'غير محدد'}</div>
                              <div><strong>رقم إضافي:</strong> {vendor.sec_phone || 'غير محدد'}</div>
                              <div>
                                <strong>الروابط:</strong>
                                <div className="mt-2 social-links-admin">
                                  {vendor.fbLink && <a href={vendor.fbLink} target="_blank" rel="noopener noreferrer">Facebook</a>}
                                  {vendor.instLink && <a href={vendor.instLink} target="_blank" rel="noopener noreferrer">Instagram</a>}
                                  {vendor.tiktokLink && <a href={vendor.tiktokLink} target="_blank" rel="noopener noreferrer">TikTok</a>}
                                  {vendor.gMapLink && <a href={vendor.gMapLink} target="_blank" rel="noopener noreferrer">Google Maps</a>}
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

      <Modal show={showEdit} onHide={() => setShowEdit(false)} dialogClassName="edit-vendor-modal" size="xl" dir="rtl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2 text-primary" /> تعديل بيانات البائع
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentVendor && (
            <Form onSubmit={handleEditSubmit} className="advanced-form">
              <div className="form-section">
                <h5 className="section-title">المعلومات الأساسية</h5>
                <div className="row g-3">
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>الاسم</Form.Label>
                      <Form.Control type="text" value={currentVendor.name} onChange={(e) => setCurrentVendor({ ...currentVendor, name: e.target.value })} required className="advanced-input" />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>البريد الإلكتروني</Form.Label>
                      <Form.Control type="email" value={currentVendor.email || ''} onChange={(e) => setCurrentVendor({ ...currentVendor, email: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>مجال العمل</Form.Label>
                      <Form.Control type="text" value={currentVendor.businessField || ''} onChange={(e) => setCurrentVendor({ ...currentVendor, businessField: e.target.value })} className="advanced-input" />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>الصلاحية (Role)</Form.Label>
                      <Form.Select
                        value={currentVendor.role || 'vendor'}
                        onChange={(e) => setCurrentVendor({ ...currentVendor, role: e.target.value })}
                        className="advanced-input role-select"
                      >
                        {/* <option value="customer">مستخدم عادي (Customer)</option>
                        <option value="vendor">بائع (Vendor)</option>
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
                      <Form.Control type="text" value={currentVendor.phone || ''} onChange={(e) => setCurrentVendor({ ...currentVendor, phone: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                  <div className="col-md-4">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>رقم إضافي</Form.Label>
                      <Form.Control type="text" value={currentVendor.sec_phone || ''} onChange={(e) => setCurrentVendor({ ...currentVendor, sec_phone: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                  <div className="col-md-4">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>العنوان</Form.Label>
                      <Form.Control type="text" value={currentVendor.address || ''} onChange={(e) => setCurrentVendor({ ...currentVendor, address: e.target.value })} className="advanced-input" />
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
                      <Form.Control type="text" value={currentVendor.fbLink || ''} onChange={(e) => setCurrentVendor({ ...currentVendor, fbLink: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>Instagram</Form.Label>
                      <Form.Control type="text" value={currentVendor.instLink || ''} onChange={(e) => setCurrentVendor({ ...currentVendor, instLink: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>TikTok</Form.Label>
                      <Form.Control type="text" value={currentVendor.tiktokLink || ''} onChange={(e) => setCurrentVendor({ ...currentVendor, tiktokLink: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>Google Maps</Form.Label>
                      <Form.Control type="text" value={currentVendor.gMapLink || ''} onChange={(e) => setCurrentVendor({ ...currentVendor, gMapLink: e.target.value })} className="advanced-input" dir="ltr" />
                    </Form.Group>
                  </div>
                </div>
              </div>

              <div className="mt-4 form-section">
                <h5 className="section-title">التفاصيل والوصف</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>عن المتجر/البائع</Form.Label>
                      <Form.Control as="textarea" rows={4} value={currentVendor.vendorDescription || ''} onChange={(e) => setCurrentVendor({ ...currentVendor, vendorDescription: e.target.value })} className="advanced-input" />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>لماذا ترغب بالانضمام إلينا؟</Form.Label>
                      <Form.Control as="textarea" rows={4} value={currentVendor.whyUs || ''} onChange={(e) => setCurrentVendor({ ...currentVendor, whyUs: e.target.value })} className="advanced-input" />
                    </Form.Group>
                  </div>
                  <div className="col-md-12">
                    <Form.Group className="form-floating-custom">
                      <Form.Label>وصف المنتجات</Form.Label>
                      <Form.Control as="textarea" rows={5} value={currentVendor.productDescription || ''} onChange={(e) => setCurrentVendor({ ...currentVendor, productDescription: e.target.value })} className="advanced-input" />
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

export default VendorsList;
