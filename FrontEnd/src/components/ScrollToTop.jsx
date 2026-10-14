import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  // Disable browser's native scroll restoration to prevent flickering/jumping
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    let timeoutId;
    let isThrottled = false;

    const handleScroll = () => {
      if (!isThrottled) {
        sessionStorage.setItem(`scrollPosition-${pathname}`, window.scrollY);
        isThrottled = true;
        setTimeout(() => {
          isThrottled = false;
        }, 150);
      }
    };

    timeoutId = setTimeout(() => {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
      sessionStorage.setItem(`scrollPosition-${pathname}`, window.scrollY);
    };
  }, [pathname]);

  useEffect(() => {
    if (navType !== "POP") {
      window.scrollTo(0, 0);
      return;
    }

    const savedPosition = sessionStorage.getItem(`scrollPosition-${pathname}`);
    if (savedPosition) {
      const targetScroll = parseInt(savedPosition, 10);
      window.scrollTo(0, targetScroll);
      const timer = setTimeout(() => {
        window.scrollTo({ top: targetScroll, behavior: "instant" });
      }, 100);
      return () => clearTimeout(timer);
    }

    window.scrollTo(0, 0);
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;