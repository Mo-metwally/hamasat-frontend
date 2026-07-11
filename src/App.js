import React, { useEffect, useState } from "react";
import './App.scss';
import HomePage from './Pages/HomePage/HomePage';
import 'bootstrap/dist/css/bootstrap.min.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Routes, Route, useParams, useLocation, useNavigate } from 'react-router-dom';
import ProductsPage from './Pages/ProductsPage/ProductsPage';
import Nav from './Components/HomeComponents/Nav/Nav';
import CategoriesPage from './Pages/CategoriesPage/CategoriesPage';
import ProductDetails from './Pages/ProductDetails/ProductDetails';
import SubCategoriesPage from './Pages/CategoriesPage/SubCategoriesPage';
import Login from './Pages/Login/Login';
import Admin from './Pages/Admin/Admin';
import Dashboard from './Components/AdminCoponents/Dashboard/Dashboard';
import AddProducts from './Components/AdminCoponents/AddProducts/AddProducts';
import AddCategories from './Components/AdminCoponents/AddCategories/AddCategories';
import CategoriesList from './Components/AdminCoponents/CategoriesList/CategoriesList';
import ProductsList from './Components/AdminCoponents/ProductsList/ProductsList';
import EditProduct from './Components/AdminCoponents/EditProduct/EditProduct';
import SearchModel from './Components/HomeComponents/SearchModel/SearchModel';
import SearchPage from './Pages/ProductsPage/SearchPage';
import { useUserInterests } from './Context/InterestContext';
import { useRecentlyWatched } from './Context/RecentlyWatchedContext';
import ContactSec from './Components/HomeComponents/ContactSec/ContactSec';
import Footer from './Components/HomeComponents/Footer/Footer';
import { FourSquare } from 'react-loading-indicators';
import { useSubCategories } from './hooks/useCategories';
import Categories from './Components/HomeComponents/Categories/Categories';
import { FilterProvider } from './Context/FilterContext';
import CartPage from './Pages/CartPage/CartPage';
import CheckOut from './Pages/CheckOut/CheckOut';
import NotFound from './Pages/NotFound/NotFound';
import CartCheckOut from './Pages/CheckOut/CartCheckOut';
import Orders from './Pages/Orders/Orders';
import TrackOrder from './Pages/TrackOrder/TrackOrder';
import AdminOrders from './Components/AdminCoponents/OrdersTable/AdminOrders';
import InvoicePage from './Components/AdminCoponents/InvoicePage/InvoicePage';
import ErrorPage from './Pages/NotFound/ErrorPage';
import TimeOutPage from './Pages/NotFound/TimeOut';
import { useProducts } from './hooks/useProducts';
import PrintInvoice from './Components/AdminCoponents/PrintInvoice/PrintInvoice';
import DeliveryAndPrivacy from './Pages/TermsAndConditions/DeliveryAndPrivacy';
import TermsAndConditions from './Pages/TermsAndConditions/TermsAndConditions';
import PrivacyPolicy from './Pages/TermsAndConditions/PrivacyPolicy';
import VendorTerms from './Pages/TermsAndConditions/VendorTerms';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Financial from './Components/AdminCoponents/Financial/Financial';
import CreateAlbums from './Components/AdminCoponents/Albums/CreateAlbums';
import AddAlbum from "./Components/AdminCoponents/Albums/AddAlbum";
import Competition from "./Components/AdminCoponents/Competition/Competition";
import DuplicateProduct from "./Components/AdminCoponents/AddProducts/DuplicateProduct";
import VendorRegistration from './Pages/VendorRegistration/VendorRegistration';
import VendorsList from './Components/AdminCoponents/VendorsList/VendorsList';
import UsersList from './Components/AdminCoponents/UsersList/UsersList';
import MyAccount from './Components/AdminCoponents/MyAccount/MyAccount';
import VendorProfile from './Pages/VendorProfile/VendorProfile';
import VendorProducts from './Pages/VendorProfile/VendorProducts';

function CategoryProductsWrapper() {
  const { subCatId, subCatName } = useParams();
  const { products, loading, error } = useProducts();
  const featuredProducts = products.slice(0, 6);
  const { subcategories } = useSubCategories();

  const filteredProducts = subCatId
    ? products.filter(product => product.subcategoryId === subCatId)
    : products;

  return (
    <>
      <Helmet>
        {/* عنوان ووصف المتجر */}
        <title>{`منصة همسات - ${subCatName}`}</title>


        <meta
          name="description"
          content="اكتشف أحدث منتجات همسات لتجهيز المنازل. مجموعة متنوعة من الأدوات المميزة بجودة عالية وأسعار مناسبة."
        />

        <meta name="keywords" content={`همسات, همسات هوم, منصة همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت ,${subCatName}`} />
        <link rel="manifest" href="https://hamsathome.com/site.webmanifest" />

        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />

        {/* Canonical */}
        <link rel="canonical" href={`${process.env.REACT_APP_CLIENT_URL}/subcategory/${subCatId}/${subCatName}`} />

        {/* OG Tags الأساسية */}
        <meta property="og:type" content="product.group" />
        <meta property="og:title" content={`منصة همسات - ${subCatName}`} />
        <meta
          property="og:description"
          content="تسوق أحدث منتجات همسات لتجهيز المنازل."
        />
        <meta property="og:site_name" content="همسات هوم" />
        <meta property="og:url" content={`${process.env.REACT_APP_CLIENT_URL}/subcategory/${subCatId}/${subCatName}`} />

        {/* صور المنتجات */}
        {featuredProducts.map((product) => (
          <meta
            key={product.id}
            property="og:image"
            title={`${product.name_ar}`}
            content={`${product.image}`}
          />
        ))}

        {/* روابط المنتجات */}
        {featuredProducts.map((product) => {
          const subcategory = subcategories.find(
            (sub) => sub.id === product.subcategoryId
          );
          const subcategoryName = subcategory ? subcategory.name_ar : '';

          return (
            <meta
              key={`see_also_${product.id}`}
              property="og:see_also"
              content={`${process.env.REACT_APP_CLIENT_URL}/subcategory/${product.subcategoryId}/${subcategoryName}/product/${product.id}/${product.name_ar}`}
            />
          );
        })}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`منصة همسات - ${subCatName}`} />
        <meta
          name="twitter:description"
          content="اكتشف أحدث منتجات همسات لتجهيز المنازل."
        />
        {featuredProducts[0] && (
          <meta
            name="twitter:image"
            content={`${featuredProducts[0].image}`}
          />
        )}

      </Helmet>
      <ProductsPage products={filteredProducts} error={error} loading={loading} />
    </>
  );
}

function BrandProductsWrapper() {
  const { brandId, brandName } = useParams();
  const { products, loading, error } = useProducts();
  const { subcategories } = useSubCategories();

  const featuredProducts = products.slice(0, 6);

  const filteredProducts = brandId
    ? products.filter(product => product.brandId === brandId)
    : products;

  return (
    <>
      <Helmet>
        {/* عنوان ووصف المتجر */}
        <title>{`منصة همسات - ${brandName}`}</title>


        <meta
          name="description"
          content="اكتشف أحدث منتجات همسات لتجهيز المنازل. مجموعة متنوعة من الأدوات المميزة بجودة عالية وأسعار مناسبة."
        />
        <meta name="keywords" content={`${brandName},همسات, همسات هوم, منصة همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت`} />

        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />

        {/* Canonical */}
        <link rel="canonical" href={`${process.env.REACT_APP_CLIENT_URL}/vendor/${brandId}/${brandName}`} />
        <link rel="manifest" href="https://hamsathome.com/site.webmanifest" />

        {/* OG Tags الأساسية */}
        <meta property="og:type" content="product.group" />
        <meta property="og:title" content={`منصة همسات - ${brandName}`} />
        <meta
          property="og:description"
          content="تسوق أحدث منتجات همسات لتجهيز المنازل."
        />
        <meta property="og:site_name" content="همسات هوم" />
        <meta property="og:url" content={`${process.env.REACT_APP_CLIENT_URL}/vendor/${brandId}/${brandName}`} />

        {/* صور المنتجات */}
        {featuredProducts.map((product) => (
          <meta
            key={product.id}
            property="og:image"
            title={`${product.name_ar}`}
            content={`${product.image}`}
          />
        ))}

        {/* روابط المنتجات */}
        {featuredProducts.map((product) => {
          const subcategory = subcategories.find(
            (sub) => sub.id === product.subcategoryId
          );
          const subcategoryName = subcategory ? subcategory.name_ar : '';

          return (
            <meta
              key={`see_also_${product.id}`}
              property="og:see_also"
              content={`${process.env.REACT_APP_CLIENT_URL}/subcategory/${product.subcategoryId}/${subcategoryName}/product/${product.id}/${product.name_ar}`}
            />
          );
        })}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`منصة همسات - ${brandName}`} />
        <meta
          name="twitter:description"
          content="اكتشف أحدث منتجات همسات لتجهيز المنازل."
        />
        {featuredProducts[0] && (
          <meta
            name="twitter:image"
            content={`${featuredProducts[0].image}`}
          />
        )}
      </Helmet>
      <ProductsPage products={filteredProducts} error={error} loading={loading} />
    </>
  )
    ;
}

function SuggestionPageWrapper() {

  const { products, loading, error } = useProducts();
  const { watchedProducts } = useRecentlyWatched();
  const { interests } = useUserInterests();
  const featuredProducts = products.slice(0, 6);

  const { subcategories } = useSubCategories();


  // Optional: You can choose what to show in "main products"
  const suggestedMain = watchedProducts.length > 0 ? watchedProducts : products.slice(0, 8);

  const interestBasedProducts = products.filter(p =>
    interests.some(interest =>
      p.category?.toLowerCase().includes(interest.toLowerCase())
    )
  ).slice(0, 8);

  return (
    <>

      <Helmet>
        {/* عنوان ووصف المتجر */}
        <title>{`منصة همسات - رأيت مؤخراً`}</title>

        <meta
          name="description"
          content="اكتشف أحدث منتجات همسات لتجهيز المنازل. مجموعة متنوعة من الأدوات المميزة بجودة عالية وأسعار مناسبة."
        />
        <meta name="keywords" content="همسات, همسات هوم, منصة همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت" />

        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        {/* Canonical */}
        <link rel="canonical" href={`${process.env.REACT_APP_CLIENT_URL}/suggestion`} />
        <link rel="manifest" href="https://hamsathome.com/site.webmanifest" />

        {/* OG Tags الأساسية */}
        <meta property="og:type" content="product.group" />
        <meta property="og:title" content={`منصة همسات - رأيت مؤخراً`} />
        <meta
          property="og:description"
          content="تسوق أحدث منتجات همسات لتجهيز المنازل."
        />
        <meta property="og:site_name" content="همسات هوم" />
        <meta property="og:url" content={`${process.env.REACT_APP_CLIENT_URL}/suggestion`} />

        {/* صور المنتجات */}
        {featuredProducts.map((product) => (
          <meta
            key={product.id}
            property="og:image"
            title={`${product.name_ar}`}
            content={`${product.image}`}
          />
        ))}

        {/* روابط المنتجات */}
        {featuredProducts.map((product) => {
          const subcategory = subcategories.find(
            (sub) => sub.id === product.subcategoryId
          );
          const subcategoryName = subcategory ? subcategory.name_ar : '';

          return (
            <meta
              key={`see_also_${product.id}`}
              property="og:see_also"
              content={`${process.env.REACT_APP_CLIENT_URL}/subcategory/${product.subcategoryId}/${subcategoryName}/product/${product.id}/${product.name_ar}`}
            />
          );
        })}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`منصة همسات - رأيت مؤخراً`} />
        <meta
          name="twitter:description"
          content="اكتشف أحدث منتجات همسات لتجهيز المنازل."
        />
        {featuredProducts[0] && (
          <meta
            name="twitter:image"
            content={`${featuredProducts[0].image}`}
          />
        )}
      </Helmet>

      <ProductsPage
        products={suggestedMain}
        error={error}
        loading={loading}
        hotName="رأيت مؤخراً"
        extraSections={
          interestBasedProducts.length > 0
            ? [
              {
                title: 'مقترحات بناءً على اهتمامك',
                products: interestBasedProducts,
              },
            ]
            : []
        }
      />
    </>
  );
}


function App() {

  const { brands } = useSubCategories();
  const { products, loading, error, errorCode } = useProducts();
  const [showSearch, setShowSearch] = useState(false);
  const bestselling = products.filter(product => product.sold > 5);
  const newArrival = products.filter(product => product.isNew);
  const isOffer = products.filter(product => product.isSale);
  const location = useLocation(); // ⬅️ عشان تجيب المسار الحالي
  const [searchResults, setSearchResults] = useState([]);
  const { subcategories } = useSubCategories();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.__INITIAL_DATA__?.notFound) {
      navigate("/404", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q')?.toLowerCase() || '';

    const matchedProducts = products.filter((product) => {
      const nameEn = product.name_en?.toLowerCase() || '';
      const nameAr = product.name_ar?.toLowerCase() || '';
      return nameEn.includes(query) || nameAr.includes(query);
    });

    setSearchResults(matchedProducts);
  }, [location.search, products]);


  useEffect(() => {
    if (error && errorCode === 429) {
      navigate(`/timeout?msg=${encodeURIComponent(error)}&code=429`);
    }
  }, [error, errorCode, navigate]);

  const hideNavRoutes = ['/login',
    '/admin',
    '/admin/dashboard',
    '/admin/addproducts',
    '/admin/duplicateproduct',
    '/admin/addcategories',
    '/admin/categorieslist',
    '/admin/productslist',
    '/admin/vendors',
    '/admin/productslist/edit/:itemId',
    '/admin/orders/invoice/:orderId',
    '/admin/competition'
  ];
  const hideCartRoutes = ['/cart', '/checkout', '/followup', '/vendor-register'];

  const toggelSearch = () => {
    setShowSearch(prev => !prev);
  };

  const isNavHidden = hideNavRoutes.some(route => location.pathname.startsWith(route));
  const isCartHidden = hideCartRoutes.some(route => location.pathname.startsWith(route));
  const featuredProducts = products.slice(0, 6);





  return (
    <div className="App">
      {!isNavHidden && <Nav searchBtn={toggelSearch} offers={isOffer} />} {/* عرض الشرطي للـ Nav */}
      {showSearch && (<SearchModel closeBtn={toggelSearch} />)}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vendor-register" element={<VendorRegistration />} />

        <Route path="/admin" element={<Admin />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="addproducts" element={<AddProducts />} />
          <Route path="duplicateproduct" element={<DuplicateProduct />} />
          <Route path="addcategories" element={
            <>
              <Helmet>
                <title>إضافة فئات</title>
                <meta
                  name="description"
                  content="إضافة فئات جديدة لتنظيم منتجات همسات هوم."
                />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin/addcategories`} />
              </Helmet>
              <AddCategories />
            </>
          } />
          <Route path="categorieslist" element={
            <>
              <Helmet>
                <title>قائمة الفئات</title>
                <meta
                  name="description"
                  content="عرض وإدارة جميع الفئات المتوفرة في متجر همسات هوم."
                />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin/categorieslist`} />
              </Helmet>

              <CategoriesList />
            </>
          } />
          <Route path="productslist" element={
            <>
              <Helmet>
                <title>قائمة المنتجات</title>
                <meta
                  name="description"
                  content="إدارة جميع المنتجات المتوفرة في متجر همسات هوم."
                />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin/productslist`} />
              </Helmet>

              <ProductsList />
            </>
          } />
          <Route path="productslist/edit/:itemId" element={
            <>
              <Helmet>
                <title>تعديل منتج</title>
                <meta
                  name="description"
                  content="تعديل بيانات المنتج المختار في متجر همسات هوم."
                />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin/productslist/edit/:itemId`} />
              </Helmet>

              <EditProduct />
            </>
          } />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="competition" element={<Competition />} />
          <Route path="orders/invoice/:orderId" element={<InvoicePage />} />
          <Route path="orders/print-invoice" element={<PrintInvoice />} />
          <Route path="financial" element={
            <>
              <Helmet>
                <title>الإدارة المالية</title>
                <meta
                  name="description"
                  content="إدارة البيانات المالية الخاصة بمتجر همسات هوم."
                />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin/financial`} />
              </Helmet>

              <Financial />
            </>
          } />
          <Route path="createalbums" element={
            <>
              <Helmet>
                <title>إنشاء ألبومات</title>
                <meta
                  name="description"
                  content="إنشاء ألبومات صور جديدة لعرض منتجات متجر همسات هوم."
                />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin/createalbums`} />
              </Helmet>

              <CreateAlbums />
            </>
          } />
          <Route path="addalbum" element={
            <>
              <Helmet>
                <title>إضافة ألبوم</title>
                <meta
                  name="description"
                  content="إضافة ألبوم جديد لعرض منتجات همسات هوم في المعرض."
                />
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/admin/addalbum`} />
              </Helmet>

              <AddAlbum />
            </>
          } />
          <Route path="vendors" element={
            <>
              <Helmet>
                <title>إدارة البائعين</title>
              </Helmet>
              <VendorsList />
            </>
          } />
          <Route path="all-accounts" element={
            <>
              <Helmet>
                <title>لوحة الإدارة - كل الحسابات</title>
              </Helmet>
              <UsersList />
            </>
          } />
          <Route path="my-account" element={
            <>
              <Helmet>
                <title>حسابي</title>
              </Helmet>
              <MyAccount />
            </>
          } />
          {/* Add more nested admin routes as needed */}
        </Route>
        <Route path="/shop" element={
          <>
            <Helmet>
              {/* عنوان ووصف المتجر */}
              <title>{`منصة همسات - المتجر`}</title>

              <meta
                name="description"
                content="منصة همسات - المتجر منصة همسات هوم لتجهيز العرائس والمنزل العصري يقدم لكِ كل ما تحتاجينه تحت سقف واحد: أحدث الأجهزة الكهربائية، مفروشات راقية، وأدوات مطبخ متكاملة (زجاج، كاسات، أطقم صيني وخزف، أدوات المائدة، أطقم عشاء، والمزيد). استمتعي بتشكيلة واسعة من التصاميم الأنيقة، جودة عالية، وأسعار تنافسية تناسب جميع الأذواق. "
              />
              <meta name="keywords" content="همسات, همسات هوم, منصة همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت" />

              <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
              <meta name="googlebot" content="index, follow" />
              <meta name="bingbot" content="index, follow" />

              {/* Canonical */}
              <link rel="canonical" href={`${process.env.REACT_APP_CLIENT_URL}/shop`} />
              <link rel="manifest" href="https://hamsathome.com/site.webmanifest" />

              {/* OG Tags الأساسية */}
              <meta property="og:type" content="product.group" />
              <meta property="og:title" content={`منصة همسات - المتجر`} />
              <meta
                property="og:description"
                content="تسوق أحدث منتجات همسات لتجهيز المنازل."
              />
              <meta property="og:site_name" content="همسات هوم" />
              <meta property="og:url" content={`${process.env.REACT_APP_CLIENT_URL}/shop`} />

              {/* صور المنتجات */}
              {featuredProducts.map((product) => (
                <meta
                  key={product.id}
                  property="og:image"
                  title={`${product.name_ar}`}
                  content={`${product.image}`}
                />
              ))}

              {/* روابط المنتجات */}
              {featuredProducts.map((product) => {
                const subcategory = subcategories.find(
                  (sub) => sub.id === product.subcategoryId
                );
                const subcategoryName = subcategory ? subcategory.name_ar : '';

                return (
                  <meta
                    key={`see_also_${product.id}`}
                    property="og:see_also"
                    content={`${process.env.REACT_APP_CLIENT_URL}/subcategory/${product.subcategoryId}/${subcategoryName}/product/${product.id}/${product.name_ar}`}
                  />
                );
              })}

              {/* Twitter Card */}
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={`منصة همسات - المتجر`} />
              <meta
                name="twitter:description"
                content="اكتشف أحدث منتجات همسات لتجهيز المنازل."
              />
              {featuredProducts[0] && (
                <meta
                  name="twitter:image"
                  content={`${featuredProducts[0].image}`}
                />
              )}
            </Helmet>
            <ProductsPage products={products} error={error} loading={loading} hotName='المتجر' hotLink='shop' />
          </>
        } />


        <Route path="/newarrival" element={
          <>
            <Helmet>
              {/* عنوان ووصف المتجر */}
              <title>{`منصة همسات - وصل حديثاً`}</title>

              <meta
                name="description"
                content="اكتشف أحدث منتجات همسات لتجهيز المنازل. مجموعة متنوعة من الأدوات المميزة بجودة عالية وأسعار مناسبة."
              />
              <meta name="keywords" content="همسات, همسات هوم, منصة همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت" />

              <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
              <meta name="googlebot" content="index, follow" />
              <meta name="bingbot" content="index, follow" />
              {/* Canonical */}
              <link rel="canonical" href={`${process.env.REACT_APP_CLIENT_URL}/newarrival`} />
              <link rel="manifest" href="https://hamsathome.com/site.webmanifest" />

              {/* OG Tags الأساسية */}
              <meta property="og:type" content="product.group" />
              <meta property="og:title" content={`منصة همسات - وصل حديثاً`} />
              <meta
                property="og:description"
                content="تسوق أحدث منتجات همسات لتجهيز المنازل."
              />
              <meta property="og:site_name" content="همسات هوم" />
              <meta property="og:url" content={`${process.env.REACT_APP_CLIENT_URL}/newarrival`} />

              {/* صور المنتجات */}
              {featuredProducts.map((product) => (
                <meta
                  key={product.id}
                  property="og:image"
                  title={`${product.name_ar}`}
                  content={`${product.image}`}
                />
              ))}

              {/* روابط المنتجات */}
              {featuredProducts.map((product) => {
                const subcategory = subcategories.find(
                  (sub) => sub.id === product.subcategoryId
                );
                const subcategoryName = subcategory ? subcategory.name_ar : '';

                return (
                  <meta
                    key={`see_also_${product.id}`}
                    property="og:see_also"
                    content={`${process.env.REACT_APP_CLIENT_URL}/subcategory/${product.subcategoryId}/${subcategoryName}/product/${product.id}/${product.name_ar}`}
                  />
                );
              })}

              {/* Twitter Card */}
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={`منصة همسات - وصل حديثاً`} />
              <meta
                name="twitter:description"
                content="اكتشف أحدث منتجات همسات لتجهيز المنازل."
              />
              {featuredProducts[0] && (
                <meta
                  name="twitter:image"
                  content={`${featuredProducts[0].image}`}
                />
              )}
            </Helmet>
            <ProductsPage products={newArrival} error={error} loading={loading} hotName='وصل حديثاً' hotLink='newarrival' />
          </>
        } />
        <Route path="/bestselling" element={
          <>
            <Helmet>
              {/* عنوان ووصف المتجر */}
              <title>{`منصة همسات - الأكثر مبيعاً`}</title>

              <meta
                name="description"
                content="اكتشف أحدث منتجات همسات لتجهيز المنازل. مجموعة متنوعة من الأدوات المميزة بجودة عالية وأسعار مناسبة."
              />

              <meta name="keywords" content="همسات, همسات هوم, منصة همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت" />

              <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
              <meta name="googlebot" content="index, follow" />
              <meta name="bingbot" content="index, follow" />
              {/* Canonical */}
              <link rel="canonical" href={`${process.env.REACT_APP_CLIENT_URL}/bestselling`} />
              <link rel="manifest" href="https://hamsathome.com/site.webmanifest" />

              {/* OG Tags الأساسية */}
              <meta property="og:type" content="product.group" />
              <meta property="og:title" content={`منصة همسات - الأكثر مبيعاً`} />
              <meta
                property="og:description"
                content="تسوق أحدث منتجات همسات لتجهيز المنازل."
              />
              <meta property="og:site_name" content="همسات هوم" />
              <meta property="og:url" content={`${process.env.REACT_APP_CLIENT_URL}/bestselling`} />

              {/* صور المنتجات */}
              {featuredProducts.map((product) => (
                <meta
                  key={product.id}
                  property="og:image"
                  title={`${product.name_ar}`}
                  content={`${product.image}`}
                />
              ))}

              {/* روابط المنتجات */}
              {featuredProducts.map((product) => {
                const subcategory = subcategories.find(
                  (sub) => sub.id === product.subcategoryId
                );
                const subcategoryName = subcategory ? subcategory.name_ar : '';

                return (
                  <meta
                    key={`see_also_${product.id}`}
                    property="og:see_also"
                    content={`${process.env.REACT_APP_CLIENT_URL}/subcategory/${product.subcategoryId}/${subcategoryName}/product/${product.id}/${product.name_ar}`}
                  />
                );
              })}

              {/* Twitter Card */}
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={`منصة همسات - الأكثر مبيعاً`} />
              <meta
                name="twitter:description"
                content="اكتشف أحدث منتجات همسات لتجهيز المنازل."
              />
              {featuredProducts[0] && (
                <meta
                  name="twitter:image"
                  content={`${featuredProducts[0].image}`}
                />
              )}
            </Helmet>
            <ProductsPage products={bestselling} error={error} loading={loading} hotName='الأكثر مبيعاً' hotLink='bestselling' />
          </>
        } />
        <Route path="/offers" element={
          <>
            <Helmet>
              <title>{`منصة همسات - عروض خاصة`}</title>

              <meta
                name="description"
                content="استمتع بأفضل العروض والتخفيضات على منتجات همسات لتجهيز المنازل. منصة همسات هوم لتجهيز العرائس والمنزل العصري يقدم لكِ كل ما تحتاجينه تحت سقف واحد: أحدث الأجهزة الكهربائية، مفروشات راقية، وأدوات مطبخ متكاملة (زجاج، كاسات، أطقم صيني وخزف، أدوات المائدة، أطقم عشاء، والمزيد). استمتعي بتشكيلة واسعة من التصاميم الأنيقة، جودة عالية، وأسعار تنافسية تناسب جميع الأذواق."
              />
              <meta name="keywords" content="همسات, همسات هوم, منصة همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت" />

              <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
              <meta name="googlebot" content="index, follow" />
              <meta name="bingbot" content="index, follow" />
              <link rel="canonical" href={`${process.env.REACT_APP_CLIENT_URL}/offers`} />
              <link rel="manifest" href="https://hamsathome.com/site.webmanifest" />

              <meta property="og:type" content="product.group" />
              <meta property="og:title" content={`منصة همسات - عروض خاصة`} />
              <meta
                property="og:description"
                content="تسوق أحدث منتجات همسات لتجهيز المنازل."
              />
              <meta property="og:site_name" content="همسات هوم" />
              <meta property="og:url" content={`${process.env.REACT_APP_CLIENT_URL}/offers`} />

              {featuredProducts.map((product) => (
                <meta
                  key={product.id}
                  property="og:image"
                  title={`${product.name_ar}`}
                  content={`${product.image}`}
                />
              ))}

              {featuredProducts.map((product) => {
                const subcategory = subcategories.find(
                  (sub) => sub.id === product.subcategoryId
                );
                const subcategoryName = subcategory ? subcategory.name_ar : '';

                return (
                  <meta
                    key={`see_also_${product.id}`}
                    property="og:see_also"
                    content={`${process.env.REACT_APP_CLIENT_URL}/subcategory/${product.subcategoryId}/${subcategoryName}/product/${product.id}/${product.name_ar}`}
                  />
                );
              })}

              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={`منصة همسات - عروض خاصة`} />
              <meta
                name="twitter:description"
                content="اكتشف أحدث منتجات همسات لتجهيز المنازل."
              />
              {featuredProducts[0] && (
                <meta
                  name="twitter:image"
                  content={`${featuredProducts[0].image}`}
                />
              )}
            </Helmet>
            <ProductsPage products={isOffer} error={error} loading={loading} hotName='عروض خاصة' hotLink='offers' />
          </>
        } />
        <Route path="/suggestion" element={<SuggestionPageWrapper />} />
        <Route path="/searchresults" element={<SearchPage key={location.search} products={searchResults} error={error} loading={loading} hotName='نتائج البحث' />} />
        <Route path="/allsubcategories" element={
          <>
            <Helmet>
              {/* Title */}
              <title>كل الفئات - همسات هوم</title>

              {/* Basic Meta */}
              <meta
                name="description"
                content="استعرض جميع الفئات المتوفرة في منصة همسات هوم لتجهيز المنازل. تسوق من مجموعات متنوعة تشمل أواني الطهي، أدوات المطبخ، أطقم تقديم، والمزيد بأفضل الأسعار."
              />
              <meta name="keywords" content="همسات, همسات هوم, منصة همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت" />

              <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
              <meta name="googlebot" content="index, follow" />
              <meta name="bingbot" content="index, follow" />

              {/* Theme Color */}
              <meta name="theme-color" content="#000000" />
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

              {/* Open Graph / Facebook / WhatsApp */}
              <meta property="og:type" content="website" />
              <meta property="og:title" content="كل الفئات - منصة همسات" />
              <meta
                property="og:description"
                content="اكتشف جميع الفئات المتاحة في منصة همسات هوم. أدوات مطبخ، أواني طهي، أطقم تقديم والمزيد في مكان واحد."
              />
              <meta property="og:image" content="/Hamasat-ShowCase.webp" />
              <meta property="og:url" content={`${process.env.REACT_APP_API_URL}/allsubcategories`} />
              <meta property="og:site_name" content="همسات هوم" />

              {/* Twitter Card */}
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="كل الفئات - منصة همسات" />
              <meta
                name="twitter:description"
                content="تصفح جميع أقسام منصة همسات هوم لتجهيز المنازل بأفضل الأسعار والجودة العالية."
              />
              <meta name="twitter:image" content="/Hamasat-ShowCase.webp" />

              {/* Canonical URL */}
              <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/allsubcategories`} />
            </Helmet>
            <CategoriesPage />
          </>
        } />
        <Route path="/allvendor" element={
          <>
            <Helmet>
              {/* Title */}
              <title>كل البائعين - همسات هوم</title>

              {/* Basic Meta */}
              <meta
                name="description"
                content="استعرض جميع البائعين في منصة همسات هوم لتجهيز المنازل. تسوق من مجموعات متنوعة."
              />
              <meta name="keywords" content="همسات, همسات هوم, منصة همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت" />

              <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
              <meta name="googlebot" content="index, follow" />
              <meta name="bingbot" content="index, follow" />
              {/* Theme Color */}
              <meta name="theme-color" content="#000000" />
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

              {/* Open Graph / Facebook / WhatsApp */}
              <meta property="og:type" content="website" />
              <meta property="og:title" content="كل الفئات - منصة همسات" />
              <meta
                property="og:description"
                content="اكتشف جميع الفئات المتاحة في منصة همسات هوم. أدوات مطبخ، أواني طهي، أطقم تقديم والمزيد في مكان واحد."
              />
              <meta property="og:image" content="/Hamasat-ShowCase.webp" />
              <meta property="og:url" content={`${process.env.REACT_APP_API_URL}/allvendor`} />
              <meta property="og:site_name" content="همسات هوم" />

              {/* Twitter Card */}
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="كل الفئات - منصة همسات" />
              <meta
                name="twitter:description"
                content="تصفح جميع أقسام منصة همسات هوم لتجهيز المنازل بأفضل الأسعار والجودة العالية."
              />
              <meta name="twitter:image" content="/Hamasat-ShowCase.webp" />

              {/* Canonical URL */}
              <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/allvendor`} />
            </Helmet>
            <CategoriesPage />
          </>
        } />
        <Route path="/subcategory/:subCatId/:subCatName" element={<CategoryProductsWrapper />} />

        <Route path="/vendor/:brandId/:brandName" element={<BrandProductsWrapper />} />

        <Route path="/category/:catId/:catName" element={<SubCategoriesPage />} />

        <Route path="/subcategory/:subCatId/:subCatName/product/:productId/:productName" element={<ProductDetails />} />

        <Route path="/cart" element={<CartPage />} />

        <Route path="/checkout" element={<CheckOut />} />

        <Route path="/cart/checkout" element={<CartCheckOut />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/followup" element={<TrackOrder />} />
        <Route path="/vendor-register" element={<VendorRegistration />} />
        <Route path="/vendor/:id" element={<VendorProfile />} />
        <Route path="/vendor/:id/products" element={<VendorProducts products={products} />} />
        <Route path="/vendor-terms" element={<VendorTerms />} />
        <Route path="/admin/*" element={<Admin />} />

        <Route path="/deliverypolicy" element={<DeliveryAndPrivacy />} />
        <Route path="/termsandconditions" element={<TermsAndConditions />} />
        <Route path="/vendor-terms" element={<VendorTerms />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/timeout" element={<TimeOutPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {
        !isCartHidden &&
        !isNavHidden &&
        brands.length >= 5 && (
          <Categories
            items={brands}
            hotLink={'vendor'}
            mainHotLink={'allvendor'}
            hotName={"البائعين"}
          />
        )
      }
      {!isNavHidden && <ContactSec />}
      {!isNavHidden && <Footer />}
    </div>
  );
}




export default function AppWithRouter() {
  const { loading: productLoading } = useProducts();
  const { loading: subLoading } = useSubCategories();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [minDelayPassed, setMinDelayPassed] = useState(false);
  const [extraBufferDone, setExtraBufferDone] = useState(false);

  // ✅ تابع تحميل الصور
  useEffect(() => {
    const checkImagesLoaded = () => {
      const images = Array.from(document.images);
      if (images.length === 0) {
        setImagesLoaded(true);
        return;
      }

      let loadedCount = 0;
      images.forEach((img) => {
        if (img.complete) {
          loadedCount++;
        } else {
          img.onload = img.onerror = () => {
            loadedCount++;
            if (loadedCount === images.length) {
              setImagesLoaded(true);
            }
          };
        }
      });

      // fallback بعد 5 ثواني
      setTimeout(() => setImagesLoaded(true), 200);
    };

    const timer = setTimeout(() => setMinDelayPassed(true), 200); // ضمان عرض الودنج على الأقل 1 ثانية

    checkImagesLoaded();

    return () => clearTimeout(timer);
  }, []);

  // ✅ بعد التأكد إن كل حاجة اتحملت.. نضيف وقت ضمان إضافي
  useEffect(() => {
    if (!productLoading && !subLoading && imagesLoaded && minDelayPassed) {
      const buffer = setTimeout(() => setExtraBufferDone(true), 100); // هنا وقت الضمان 0.5 ثانية
      return () => clearTimeout(buffer);
    }
  }, [productLoading, subLoading, imagesLoaded, minDelayPassed]);

  const appFullyLoaded = extraBufferDone;

  return (
    <>
      {!appFullyLoaded ? (
        <div className="loading">
          <FourSquare color={["#ff6f33"]} size="large" textColor="#3b0c0c" />
        </div>
      ) : (
        <HelmetProvider>
          <FilterProvider>
            <App />
          </FilterProvider>
        </HelmetProvider>
      )}
    </>
  );
}