import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import Integrations from "./components/Integrations";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Reveal from "./components/Reveal";
import Security from "./components/Security";
import { API_BASE_URL, Assets_URL } from "../../Components/Apicongfig";

export default function HomeMessages({ data }) {
  // ── URL se name lo, agar useParams kaam na kare toh window.location fallback ──
  const params = useParams();
  const name =
    params.name ||
    window.location.pathname.split("/gate/")[1]?.split("/")[0] ||
    null;

  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(!data);

  const hasPlayedRef = useRef(false);
  const interactionListenersRef = useRef([]);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (data) {
      setLoading(false);
      return;
    }

    if (!name) {
      setLoading(false);
      return;
    }

    const fetchLandingData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/landing-pages/by-type/${name}`
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setFetchedData(result.data);
            return;
          }
        }

        // Fallback: fetch all and filter by gate_name
        const listRes = await fetch(`${API_BASE_URL}/landing-pages`);
        if (listRes.ok) {
          const listResult = await listRes.json();
          const pages = listResult.data || listResult;
          const matched = Array.isArray(pages)
            ? pages.find(
                (p) => p.gate_name?.toLowerCase() === name?.toLowerCase()
              )
            : null;
          if (matched) setFetchedData(matched);
        }
      } catch (error) {
        console.error("Error fetching landing page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, [data, name]);

  // ─── Data Normalization ───────────────────────────────────────────────────
  const finalData = useMemo(() => {
    const activeData = data || fetchedData;
    if (!activeData) return null;

    const getMedia = (file) => {
      if (!file) return null;
      if (typeof file === "string") {
        if (
          file.startsWith("http") ||
          file.startsWith("data:") ||
          file.startsWith("blob:")
        )
          return file;
        return `${Assets_URL}/${file}`;
      }
      if (file instanceof File || file instanceof Blob)
        return URL.createObjectURL(file);
      return null;
    };

    const isFormData = "heroTitle" in activeData || "gateName" in activeData;

    if (isFormData) {
      // ── Form / Preview mode (camelCase) ──────────────────────────────────
      return {
        ...activeData,
        hero_title: activeData.heroTitle,
        hero_subtitle: activeData.heroSubtitle,
        hero_benefits: activeData.heroBenefits,
        hero_cta_primary: activeData.heroCtaPrimary,
        hero_cta_primary_link: activeData.heroCtaPrimaryLink,
        hero_cta_secondary: activeData.heroCtaSecondary,
        hero_cta_secondary_link: activeData.heroCtaSecondaryLink,
        hero_media_path: getMedia(activeData.heroMediaFile),
        hero_autoplay: activeData.heroAutoplay,
        hero_media_type: activeData.heroMediaType,
        hero_youtube_url: activeData.heroYoutubeUrl,
        problem_title: activeData.problemTitle,
        problems: activeData.problems,
        problem_media_type: activeData.problemMediaType,
        problem_media_path: getMedia(activeData.problemMediaFile),
        problem_media_desc: activeData.problemMediaDesc,
        solution_title: activeData.solutionTitle,
        solution_intro: activeData.solutionIntro,
        features: (activeData.features || []).map((f) => ({
          ...f,
          media_path: getMedia(f.mediaFile),
          media_type: f.mediaType,
        })),
        how_title: activeData.howTitle,
        steps: (activeData.steps || []).map((s) => ({
          ...s,
          media_path: getMedia(s.mediaFile),
          media_type: s.mediaType,
        })),
        benefits_title: activeData.benefitsTitle,
        benefits_for_you: activeData.benefitsForYou,
        benefits_for_clients: activeData.benefitsForClients,
        benefits_media_type: activeData.benefitsMediaType,
        benefits_media_path: getMedia(activeData.benefitsMediaFile),
        benefits_key_figure: activeData.benefitsKeyFigure,
        testimonials_title: activeData.testimonialsTitle,
        testimonials: (activeData.testimonials || []).map((t) => ({
          headline: t.headline,
          content: t.content,
          author_name: t.authorName,
          author_role: t.authorRole,
          avatar: getMedia(t.authorImage),
        })),
        integrations_title: activeData.integrationsTitle,
        integrations_subtitle: activeData.integrationsSubtitle,
        integrations_list: activeData.integrationsList,
        integrations_media_type: activeData.integrationsMediaType,
        integrations_media_path: getMedia(activeData.integrationsMediaFile),
        integrations_badge: activeData.integrationsBadge,
        faq_items: (activeData.faqItems || []).map((f) => ({
          question: f.question,
          answer: f.answer,
          media_path: getMedia(f.mediaFile),
        })),
        security_args: activeData.securityArgs,
        audio_path: getMedia(activeData.audioFile), // Form uses audioFile
        contracts: activeData.contracts,
      };
    } else {
      // ── API mode (snake_case) ─────────────────────────────────────────────
      return {
        ...activeData,
        hero_media_path: getMedia(activeData.hero_media_path),
        problem_media_path: getMedia(activeData.problem_media_path),
        features: (activeData.features || []).map((f) => ({
          ...f,
          media_path: getMedia(f.media_path),
        })),
        steps: (activeData.steps || []).map((s) => ({
          ...s,
          media_path: getMedia(s.media_path),
        })),
        benefits_media_path: getMedia(activeData.benefits_media_path),
        testimonials: (activeData.testimonials || []).map((t) => ({
          ...t,
          avatar: getMedia(t.avatar),
        })),
        integrations_media_path: getMedia(activeData.integrations_media_path),
        faq_items: (activeData.faq_items || []).map((f) => ({
          ...f,
          media_path: getMedia(f.media_path),
        })),
        // ✅ FIXED: API returns "audio_file" not "audio_path"
        audio_path: getMedia(activeData.audio_file),
      };
    }
  }, [data, fetchedData]);

  // ─── Cleanup interaction listeners ───────────────────────────────────────
  const cleanupListeners = useCallback(() => {
    interactionListenersRef.current.forEach(({ evt, handler }) =>
      window.removeEventListener(evt, handler)
    );
    interactionListenersRef.current = [];
  }, []);

  // ─── Play audio ───────────────────────────────────────────────────────────
  const playAudio = useCallback(
    (audioEl) => {
      if (!audioEl) return;

      audioEl.volume = 0.5;
      audioEl.currentTime = 0;

      const stopAfter8s = () => {
        setTimeout(() => {
          if (audioEl) {
            audioEl.pause();
            audioEl.currentTime = 0;
          }
        }, 8000);
      };

      audioEl
        .play()
        .then(() => {
          hasPlayedRef.current = true;
          cleanupListeners();
          stopAfter8s();
        })
        .catch(() => {
          // Autoplay blocked — play on first user interaction
          const onInteraction = () => {
            if (hasPlayedRef.current) return;
            hasPlayedRef.current = true;
            cleanupListeners();

            audioEl.volume = 0.5;
            audioEl.currentTime = 0;
            audioEl.play().then(stopAfter8s).catch(() => {});
          };

          const events = ["click", "scroll", "keydown", "touchstart"];
          events.forEach((evt) => {
            window.addEventListener(evt, onInteraction, { passive: true });
            interactionListenersRef.current.push({ evt, handler: onInteraction });
          });
        });
    },
    [cleanupListeners]
  );

  // ─── Trigger audio when audio_path is ready ───────────────────────────────
  useEffect(() => {
    const audioPath = finalData?.audio_path;
    if (!audioPath) return;

    hasPlayedRef.current = false;
    cleanupListeners();

    // new Audio() — no DOM ref needed, no timing issues
    const audioEl = new Audio(audioPath);
    audioEl.preload = "auto";
    playAudio(audioEl);

    return () => {
      cleanupListeners();
      audioEl.pause();
    };
  }, [finalData?.audio_path, playAudio, cleanupListeners]);

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const fd = finalData || {};

  const hasItems = (arr) =>
    Array.isArray(arr) &&
    arr.some((item) => {
      if (typeof item === "string") return item.trim().length > 0;
      if (typeof item === "object" && item !== null)
        return Object.values(item).some(
          (v) => v && String(v).trim().length > 0
        );
      return false;
    });

  return (
    <div className="home-messages-main-wrapper">
      <Hero data={fd} />

      <Reveal>
        <HowItWorks data={fd} />
      </Reveal>

      {hasItems(fd.features) && (
        <Reveal>
          <Features data={fd} />
        </Reveal>
      )}

      {hasItems(fd.testimonials) && fd?.testimonials?.length > 0 && (
        <Reveal>
          <Testimonials data={fd} />
        </Reveal>
      )}

      {hasItems(fd.integrations_list) && (
        <Reveal>
          <Integrations data={fd} />
        </Reveal>
      )}

      {hasItems(fd.security_args) && (
        <Reveal>
          <Security data={fd} />
        </Reveal>
      )}

      <Reveal>
        <Pricing data={fd} />
      </Reveal>

      {hasItems(fd.faq_items) && (
        <Reveal>
          <FAQ data={fd} />
        </Reveal>
      )}
    </div>
  );
}