// useTracking.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

function useTracking() {
    const location = useLocation();

    // ✅ الصفحات التي لن يتم تتبعها
    const excludedRoutes = [
        "/cart/checkout",
        "/checkout",
        "/followup",
        "/orders",
        "/login",
        "/admin"
    ];

    // ✅ تحقق دقيق إذا الصفحة الحالية مسموح بالتتبع
    const shouldTrack = !excludedRoutes.some(route => {
        // إزالة trailing slash لتجنب المشاكل
        const normalizedRoute = route.replace(/\/$/, "");
        const normalizedPath = location.pathname.replace(/\/$/, "");
        return normalizedPath === normalizedRoute || normalizedPath.startsWith(normalizedRoute + "/");
    });

    useEffect(() => {
        if (!shouldTrack) return;
        if (!ReactGA) return;

        ReactGA.send({
            hitType: "pageview",
            page: location.pathname + location.search,
        });

    }, [location.pathname, location.search, shouldTrack]);

    useEffect(() => {
        if (!shouldTrack) return;
        if (!window.fbq) return;

        window.fbq("track", "PageView");

    }, [location.pathname, shouldTrack]);

    useEffect(() => {
        if (!shouldTrack) return;
        if (!window.dataLayer) return;

        window.dataLayer.push({
            event: "pageview",
            page: location.pathname + location.search,
        });

    }, [location.pathname, location.search, shouldTrack]);
}

export default useTracking;
