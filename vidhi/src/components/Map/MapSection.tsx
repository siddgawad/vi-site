// app/globe/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Cesium types (runtime comes from CDN)
type CesiumNS = typeof import('cesium');

gsap.registerPlugin(ScrollTrigger);

/** Geo config */
const MUMBAI = { lat: 19.076, lon: 72.8777, label: 'Mumbai' };
const CAMBRIDGE = { lat: 43.3601, lon: -80.3127, label: 'Cambridge' };

const CESIUM_VERSION = '1.132.0';
const CESIUM_BASE = `https://cdnjs.cloudflare.com/ajax/libs/cesium/${CESIUM_VERSION}/`;

type LenisInstance = InstanceType<typeof Lenis>;

declare global {
  interface Window {
    Cesium: CesiumNS;
    CESIUM_BASE_URL?: string;
    __lenis?: LenisInstance;
  }
}

/** Init Lenis once and wire it to GSAP/ScrollTrigger */
function initLenisOnce() {
  if (typeof window === 'undefined') return;
  if (window.__lenis) {
    window.__lenis.on('scroll', ScrollTrigger.update);
    return window.__lenis;
  }
  const lenis = new Lenis({
    autoRaf: false, // driven by GSAP
    smoothWheel: true,
    lerp: 0.12,
    wheelMultiplier: 1,
    gestureOrientation: 'vertical',
    overscroll: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); // GSAP seconds -> ms
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
  return lenis;
}

export default function MapSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cesiumReady, setCesiumReady] = useState(false);

  // Initialize Lenis once app-side
  useEffect(() => {
    initLenisOnce();
  }, []);

  useEffect(() => {
    if (!cesiumReady || !sectionRef.current || !pinRef.current || !containerRef.current) return;
    const Cesium = window.Cesium;

    // --- Viewer ---
    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      shadows: false,
      baseLayerPicker: false,
      // CRISPER labels & imagery on HiDPI: render at devicePixelRatio
      useBrowserRecommendedResolution: false,
    });

    // Render quality knobs
    viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 2);

    // --- Imagery: OSM tiles (clean, readable). ---
    viewer.imageryLayers.removeAll();
    const osm = new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: '© OpenStreetMap contributors',
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      minimumLevel: 0,
      maximumLevel: 19,
    });
    const osmLayer = viewer.imageryLayers.addImageryProvider(osm);
    osmLayer.brightness = 1.08;
    osmLayer.saturation = 1.12;
    osmLayer.gamma = 0.98;

    // Atmosphere + lighting (subtle)
    if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = true;
    viewer.scene.skyBox = undefined;
    viewer.scene.globe.enableLighting = true;
    if (viewer.scene.globe.translucency) {
      viewer.scene.globe.translucency.enabled = false; // solid earth for map readability
    }

    const cart3 = (lon: number, lat: number, h = 0) => Cesium.Cartesian3.fromDegrees(lon, lat, h);

    // --- Labels (Arial, bigger). ---
    const addLabel = (lon: number, lat: number, text: string) =>
      viewer.entities.add({
        position: cart3(lon, lat, 0),
        point: {
          pixelSize: 10,
          color: Cesium.Color.fromCssColorString('#ff4d4d'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          text,
          font: '700 22px Arial, Helvetica, sans-serif',
          pixelOffset: new Cesium.Cartesian2(0, -26),
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });

    addLabel(MUMBAI.lon, MUMBAI.lat, MUMBAI.label);
    addLabel(CAMBRIDGE.lon, CAMBRIDGE.lat, CAMBRIDGE.label);

    // --- Great-circle arc + sampled positions for the plane (very slow) ---
    const startCarto = Cesium.Cartographic.fromDegrees(MUMBAI.lon, MUMBAI.lat, 0);
    const endCarto = Cesium.Cartographic.fromDegrees(CAMBRIDGE.lon, CAMBRIDGE.lat, 0);
    const geodesic = new Cesium.EllipsoidGeodesic(startCarto, endCarto);

    const samples = 240;
    const maxHeight = 900_000; // meters
    const start = Cesium.JulianDate.now();
    const totalSeconds = 90; // MUCH slower flight
    const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());

    const sampledPos = new Cesium.SampledPositionProperty();
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const c = geodesic.interpolateUsingFraction(t);
      const h = Math.sin(Math.PI * t) * maxHeight;
      const pos = Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, h);
      const when = Cesium.JulianDate.addSeconds(start, totalSeconds * t, new Cesium.JulianDate());
      sampledPos.addSample(when, pos);
    }
    sampledPos.setInterpolationOptions({
      interpolationDegree: 2,
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
    });

    // Route polyline (soft glow)
    const routePositions: number[] = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const c = geodesic.interpolateUsingFraction(t);
      const h = Math.sin(Math.PI * t) * maxHeight;
      routePositions.push(c.longitude, c.latitude, h);
    }
    viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromRadiansArrayHeights(routePositions),
        width: 2,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.18,
          color: Cesium.Color.fromCssColorString('#ffdbe8').withAlpha(0.75),
        }),
      },
    });

    // Plane model (built into Cesium distribution)
    const PLANE_URL = Cesium.buildModuleUrl('SampleData/models/CesiumAir/Cesium_Air.glb');
    const plane = viewer.entities.add({
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start, stop })]),
      position: sampledPos,
      orientation: new Cesium.VelocityOrientationProperty(sampledPos),
      model: { uri: PLANE_URL, minimumPixelSize: 64, maximumScale: 20000, color: Cesium.Color.WHITE },
      path: { leadTime: 0, trailTime: totalSeconds, width: 1.5, material: Cesium.Color.WHITE.withAlpha(0.5) },
    });

    // Clock for scrubbing (we’ll drive time manually)
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.shouldAnimate = false;
    viewer.clock.canAnimate = false;

    // Helper: set camera with smooth control
    const setLookAt = (lon: number, lat: number, height: number, headingRad: number, pitchRad: number) => {
      viewer.camera.setView({
        destination: cart3(lon, lat, height),
        orientation: { heading: headingRad, pitch: pitchRad, roll: 0 },
      });
    };

    // Start: globe immediately visible (wide view near Mumbai)
    setLookAt(MUMBAI.lon, 10, 15_000_000, 0, Cesium.Math.toRadians(-30));

    // --- Scroll timeline (very long / “effectively infinite”) ---
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sectionRef.current!,
        start: 'top top',
        end: '+=3000%', // huge scroll runway
        scrub: true,
        pin: pinRef.current!,
        pinSpacing: true,
      },
    });

    // Proxy scalar for timeline
    const prog = { t: 0 };

    // A) Gentle settle toward Mumbai, slight zoom-in
    tl.to(prog, {
      t: 0.10,
      duration: 0.10,
      onUpdate: () => {
        const p = Math.max(0, Math.min(1, prog.t / 0.10));
        const height = gsap.utils.interpolate(15_000_000, 6_000_000, p);
        const heading = gsap.utils.interpolate(0, Cesium.Math.toRadians(30), p);
        const pitch = gsap.utils.interpolate(Cesium.Math.toRadians(-30), Cesium.Math.toRadians(-25), p);
        setLookAt(MUMBAI.lon, MUMBAI.lat, height, heading, pitch);
      },
    }, 0);

    // B) Track the plane and scrub the slow flight
    tl.to(prog, {
      t: 0.55,
      duration: 0.45,
      onStart: () => { viewer.trackedEntity = plane; },
      onUpdate: () => {
        const p = Math.max(0, Math.min(1, (prog.t - 0.10) / 0.45));
        const secs = totalSeconds * p; // 0 → totalSeconds (slow)
        const now = Cesium.JulianDate.addSeconds(start, secs, new Cesium.JulianDate());
        viewer.clock.currentTime = now;
      },
      onComplete: () => { viewer.trackedEntity = undefined; },
    }, 0.10);

    // C) Post-arrival slow orbit: globe stays visible, keeps moving
    const latCenter = 15;
    const heightOrbit = 12_000_000;
    const revolutions = 1.5;
    tl.to(prog, {
      t: 1.0,
      duration: 0.45,
      onUpdate: () => {
        const p = Math.max(0, Math.min(1, (prog.t - 0.55) / 0.45));
        const lon = CAMBRIDGE.lon + 360 * revolutions * p;
        const heading = Cesium.Math.toRadians(60) + Cesium.Math.toRadians(180) * p;
        const pitch = Cesium.Math.toRadians(-28);
        setLookAt(lon, latCenter, heightOrbit, heading, pitch);
      },
    }, 0.55);

    // Cleanup
    return () => {
      try {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      } catch {}
      try {
        viewer.destroy();
      } catch {}
    };
  }, [cesiumReady]);

  return (
    <main style={{ position: 'relative', minHeight: '300vh', background: '#0b0f14', color: '#fff' }}>
      {/* Cesium CSS */}
      <link rel="stylesheet" href={`${CESIUM_BASE}Widgets/widgets.css`} />

      {/* Must run before Cesium.js */}
      <Script id="cesium-base" strategy="afterInteractive">
        {`window.CESIUM_BASE_URL='${CESIUM_BASE}';`}
      </Script>

      {/* Cesium core script */}
      <Script
        src={`${CESIUM_BASE}Cesium.js`}
        strategy="afterInteractive"
        onLoad={() => setCesiumReady(true)}
      />

      {/* Lead-in */}
      <section style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Scroll to travel 🌍✈️
        </h1>
      </section>

      {/* Pinned globe stage — long runway so it feels infinite */}
      <section ref={sectionRef} style={{ position: 'relative', height: '3000vh' }}>
        <div ref={pinRef} style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
          {/* Cesium canvas */}
          <div ref={containerRef} id="cesiumContainer" style={{ position: 'absolute', inset: 0 }} />

          {/* Overlay UI */}
          <div
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '2rem',
              fontSize: 'clamp(1rem,2vw,1.125rem)',
              background: 'radial-gradient(1200px 400px at 50% 110%, rgba(255,255,255,0.06), transparent 60%)',
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontWeight: 700,
            }}
          >
            <div>Focus: Mumbai, India</div>
            <div>Flying to Cambridge, Ontario</div>
          </div>
        </div>
      </section>

      {/* Tail section */}
      <section style={{ height: '120vh', display: 'grid', placeItems: 'center', background: '#111827' }}>
        <div style={{ fontSize: 'clamp(1.25rem,2vw,1.5rem)', opacity: 0.9 }}>Next section</div>
      </section>
    </main>
  );
}
