import React, { useEffect, useState } from 'react'
import ShowCase from '../../Components/HomeComponents/showCase/ShowCase.jsx'
import Sicons from './Icon'
import './HomePage.scss'
import CardSlider from '../../Components/HomeComponents/CardSlider/CardSlider.jsx'
import Value from '../../Components/HomeComponents/Value/Value.jsx'
import FollowUp from '../../Components/HomeComponents/FollowUp/FollowUp.jsx'
import Categories from '../../Components/HomeComponents/Categories/Categories.jsx'
import MainCategories from '../../Components/HomeComponents/Categories/MainCategories.jsx'
import { useSubCategories } from '../../hooks/useCategories.jsx';
import { FourSquare } from 'react-loading-indicators';
import { ToastContainer } from 'react-toastify';
import { useProducts } from '../../hooks/useProducts.jsx';
import { Helmet } from 'react-helmet-async'
import useTracking from '../../utils/useTracking.js'

const HomePage = () => {
    const { subcategories } = useSubCategories();
    const { products, loading, error } = useProducts();
    const [hideIcons, setHideIcons] = useState(false);

    const removeCTA = window.innerWidth >= 700
    useTracking();
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // لو أي سكشن منهم ظاهر أخفي الأيقونات
                const isAnyVisible = entries.some((entry) => entry.isIntersecting);
                setHideIcons(isAnyVisible);
            },
            { threshold: 0.3 }
        );

        const sections = [
            document.getElementById("Contact"),
            document.getElementById("Footer"),
        ];

        sections.forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => {
            sections.forEach((section) => {
                if (section) observer.unobserve(section);
            });
        };
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <FourSquare color={["#ff6f33"]} />
            </div>
        )
    }
    if (error) return <div>Error: {error}</div>;

    const bestselling = products.filter(product => product.sold > 5 && product.remaining > 0);
    const newArrival = products.filter(product => product.isNew && product.remaining > 0);
    const offers = products.filter(product => product.isSale && product.remaining > 0);
    const allProducts = products.filter(product => product.remaining > 0);

    return (
        <>
            <Helmet>
                {/* Title */}
                <title>معرض همسات هوم للأدوات المنزلية</title>

                {/* Basic Meta */}
                <meta
                    name="description"
                    content="معرض همسات هوم لتجهيز العرائس والمنزل العصري يقدم لكِ كل ما تحتاجينه تحت سقف واحد: أحدث الأجهزة الكهربائية، مفروشات راقية، وأدوات مطبخ متكاملة (زجاج، كاسات، أطقم صيني وخزف، أدوات المائدة، أطقم عشاء، والمزيد). استمتعي بتشكيلة واسعة من التصاميم الأنيقة، جودة عالية، وأسعار تنافسية تناسب جميع الأذواق."
                />

                <meta name="keywords" content="همسات, همسات هوم, معرض همسات, تجهيز عرائس, اجهزة كهربائية, مفروشات, ادوات منزلية, ادوات مطبخ, مستلزمات العروسة, ديكورات, اطقم صيني, كاسات, اطقم عشاء, معرض تجهيز عرائس الشرقية, فاقوس, اثاث منزلي, اجهزة منزلية حديثة, اطقم طهي, طاسات جرانيت" />

                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
                <meta name="googlebot" content="index, follow" />
                <meta name="bingbot" content="index, follow" />
                {/* Theme Color (Progressive Enhancement) */}
                <meta name="theme-color" content="#000000" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="معرض همسات للأدوات المنزلية" />
                <meta
                    property="og:description"
                    content="معرض همسات هوم لتجهيز العرائس والمنزل العصري يقدم لكِ كل ما تحتاجينه تحت سقف واحد: أحدث الأجهزة الكهربائية، مفروشات راقية، وأدوات مطبخ متكاملة (زجاج، كاسات، أطقم صيني وخزف، أدوات المائدة، أطقم عشاء، والمزيد). استمتعي بتشكيلة واسعة من التصاميم الأنيقة، جودة عالية، وأسعار تنافسية تناسب جميع الأذواق."
                />
                <meta property="og:image" content="/Hamasat-ShowCase.webp" />
                <meta property="og:url" content={`${process.env.REACT_APP_API_URL}/`} />
                <meta property="og:site_name" content="هوم همسات" />
                <link rel="manifest" href="https://hamsathome.com/site.webmanifest" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="معرض همسات للأدوات المنزلية" />
                <meta
                    name="twitter:description"
                    content="معرض همسات يقدم كل ما يلزم المطبخ العصري من أواني، أطقم طهي، أدوات تقطيع وتقديم، بجودة عالية وتصاميم أنيقة وأفضل سعر."
                />
                <meta name="twitter:image" content="/Hamasat-ShowCase.webp" />
                <link rel="canonical" href={`${process.env.REACT_APP_API_URL}/`} />

            </Helmet>
            <ShowCase />
            <main className='Home-body'>
                <Categories items={subcategories} hotLink={'subcategory'} mainHotLink={'allsubcategories'} hotName={"تسوق بالفئة"} />
                {offers.length > 5 && (<CardSlider sectionName="العروض" link='/offers' produactsData={offers} />)}
                <MainCategories />
                {newArrival.length < 5
                    ? (<CardSlider sectionName="وصل حديثاً" link='/shop' produactsData={allProducts} />)
                    : (<CardSlider sectionName="وصل حديثاً" link='/newarrival' produactsData={newArrival} />)}
                <br />
                {bestselling.length < 5
                    ? (<CardSlider sectionName="المتجر" link='/shop' produactsData={allProducts} />)
                    : (<CardSlider sectionName="الاكثر مبيعاً" link='/bestselling' produactsData={bestselling} />)}
                <Value />
                <div><FollowUp /></div>
                {!hideIcons && removeCTA && <Sicons />}
            </main>
            <ToastContainer toastClassName="custom-toast" />
        </>
    )
}

export default HomePage
