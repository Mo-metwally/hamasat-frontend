import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebook, FaInstagram, FaTiktok, FaBriefcase, FaStore } from 'react-icons/fa';
import './VendorProfile.scss';

const VendorProfile = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/users/vendor/${id}`);
        setVendor(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'حدث خطأ أثناء جلب بيانات البائع');
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  const extractIframeSrc = (link) => {
    if (!link) return { type: 'none' };
    if (link.includes('<iframe')) {
      const match = link.match(/src="([^"]+)"/);
      return match ? { type: 'embed', url: match[1] } : { type: 'link', url: link };
    }
    if (link.includes('google.com/maps/embed')) {
      return { type: 'embed', url: link };
    }
    return { type: 'link', url: link };
  };

  if (loading) {
    return (
      <div className="vendor-profile-loading">
        <div className="spinner"></div>
        <p>جاري تحميل بيانات البائع...</p>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="vendor-profile-error">
        <h2>عذراً!</h2>
        <p>{error || 'لم يتم العثور على البائع'}</p>
        <Link to="/" className="btn-return">العودة للرئيسية</Link>
      </div>
    );
  }

  const mapSrc = extractIframeSrc(vendor.gMapLink);

  const canonicalUrl = `${process.env.REACT_APP_CLIENT_URL || 'https://hamsathome.com'}/vendor/${id}`;
  const vendorDesc = vendor.vendorDescription ? vendor.vendorDescription.replace(/<[^>]*>?/gm, '').substring(0, 160) : `تسوق من متجر ${vendor.name} على همسات هوم. اكتشف أفضل المنتجات بأسعار تنافسية.`;

  return (
    <div className="vendor-profile-page">
      <Helmet>
        <meta charSet="UTF-8" />
        <title>{vendor.name} - متجر همسات هوم</title>
        <meta name="description" content={vendorDesc} />
        <meta name="keywords" content={`${vendor.name}, متجر ${vendor.name}, ${vendor.businessField || 'أدوات منزلية'}, همسات هوم, شراء أونلاين, تسوق`} />
        
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`${vendor.name} - متجر همسات هوم`} />
        <meta property="og:description" content={vendorDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="همسات هوم" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${vendor.name} - متجر همسات هوم`} />
        <meta name="twitter:description" content={vendorDesc} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": vendor.name,
            "description": vendorDesc,
            "url": canonicalUrl,
            "telephone": vendor.phone || "",
            "address": vendor.address || ""
          })}
        </script>
      </Helmet>

      <div className="container">
        {/* Header Section */}
        <div className="profile-header glass-panel">
          <div className="header-info">
            <div className="avatar-placeholder">
              <FaStore />
            </div>
            <div className="text-info">
              <h1>{vendor.name}</h1>
              {vendor.businessField && (
                <span className="badge"><FaBriefcase /> {vendor.businessField}</span>
              )}
            </div>
          </div>
          <div className="header-actions" style={{ marginRight: 'auto', display: 'flex', alignItems: 'center' }}>
            <Link 
              to={`/vendor/${id}/products`} 
              className="C-btn" 
              style={{ padding: '10px 25px', fontSize: '1.1rem', borderRadius: '8px', fontWeight: 'bold' }}
            >
              عرض منتجات البائع
            </Link>
          </div>
        </div>

        <div className="row mt-4">
          {/* Main Details (Left/Main col in RTL) */}
          <div className="col-lg-8">
            <div className="glass-panel section-card">
              <h3>عن المتجر</h3>
              <p className="description-text">{vendor.vendorDescription || 'لا يوجد وصف متاح.'}</p>
            </div>

            <div className="glass-panel section-card mt-4">
              <h3>المنتجات المتوفرة</h3>
              <p className="description-text">{vendor.productDescription || 'لا توجد تفاصيل.'}</p>
            </div>

            {mapSrc && mapSrc.type !== 'none' && (
              <div className="glass-panel section-card mt-4 map-card">
                <h3>موقع المتجر على الخريطة</h3>
                {mapSrc.type === 'embed' ? (
                  <div className="map-wrapper">
                    <iframe 
                      src={mapSrc.url} 
                      width="100%" 
                      height="350" 
                      style={{ border: 0 }} 
                      allowFullScreen="" 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Vendor Location"
                    ></iframe>
                  </div>
                ) : (
                  <div className="map-link-wrapper" style={{textAlign: 'center', padding: '30px'}}>
                      <p style={{marginBottom: '15px'}}>لقد قام البائع بإرفاق رابط لموقعه على خرائط جوجل.</p>
                      <a href={mapSrc.url} target="_blank" rel="noopener noreferrer" className="C-btn" style={{display: 'inline-block', padding: '10px 20px', fontSize: '16px', borderRadius: '8px'}}>
                          فتح الموقع على الخريطة
                      </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar / Contact Info */}
          <div className="col-lg-4">
            <div className="glass-panel contact-card">
              <h3>معلومات التواصل</h3>
              <ul className="contact-list">
                {vendor.address && (
                  <li>
                    <FaMapMarkerAlt className="icon" />
                    <span>{vendor.address}</span>
                  </li>
                )}
                {vendor.phone && (
                  <li>
                    <FaPhoneAlt className="icon" />
                    <span dir="ltr">{vendor.phone}</span>
                  </li>
                )}
                {vendor.sec_phone && (
                  <li>
                    <FaPhoneAlt className="icon" />
                    <span dir="ltr">{vendor.sec_phone}</span>
                  </li>
                )}
                {vendor.email && (
                  <li>
                    <FaEnvelope className="icon" />
                    <a href={`mailto:${vendor.email}`}>{vendor.email}</a>
                  </li>
                )}
              </ul>

              {(vendor.fbLink || vendor.instLink || vendor.tiktokLink) && (
                <div className="social-links">
                  <h4>تابعنا على</h4>
                  <div className="icons-wrapper">
                    {vendor.fbLink && (
                      <a href={vendor.fbLink} target="_blank" rel="noopener noreferrer" className="social-icon fb">
                        <FaFacebook />
                      </a>
                    )}
                    {vendor.instLink && (
                      <a href={vendor.instLink} target="_blank" rel="noopener noreferrer" className="social-icon inst">
                        <FaInstagram />
                      </a>
                    )}
                    {vendor.tiktokLink && (
                      <a href={vendor.tiktokLink} target="_blank" rel="noopener noreferrer" className="social-icon tiktok">
                        <FaTiktok />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
