'use client';
import { useState, useEffect, useRef } from 'react';

export interface TelemetryMetrics {
  ttfb: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number;
  fid: number | null;
  memoryUsed: number | null;
  memoryLimit: number | null;
  online: boolean;
}

export interface HistoricalBaseline {
  ttfbAvg: number;
  fcpAvg: number;
  lcpAvg: number;
  clsAvg: number;
  fidAvg: number;
  samples: number;
}

const STORAGE_KEY = 'perf_telemetry_history';

export function usePerformanceTelemetry() {
  const [metrics, setMetrics] = useState<TelemetryMetrics>({
    ttfb: null,
    fcp: null,
    lcp: null,
    cls: 0,
    fid: null,
    memoryUsed: null,
    memoryLimit: null,
    online: true,
  });

  const [baseline, setBaseline] = useState<HistoricalBaseline>({
    ttfbAvg: 0,
    fcpAvg: 0,
    lcpAvg: 0,
    clsAvg: 0,
    fidAvg: 0,
    samples: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Gather Connection / Status
    const handleOnlineStatus = () => {
      setMetrics((prev) => ({ ...prev, online: navigator.onLine }));
    };
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    handleOnlineStatus();

    // 2. Navigation Timing (TTFB)
    try {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const nav = navEntries[0] as PerformanceNavigationTiming;
        const ttfbVal = Math.round(nav.responseStart - nav.startTime);
        setTimeout(() => setMetrics((prev) => ({ ...prev, ttfb: ttfbVal })), 0);
      } else if (performance.timing) {
        // Fallback for older browsers
        const t = performance.timing;
        const ttfbVal = Math.max(0, t.responseStart - t.navigationStart);
        setTimeout(() => setMetrics((prev) => ({ ...prev, ttfb: ttfbVal })), 0);
      }
    } catch (e) {
      console.warn('Navigation timing not supported:', e);
    }

    // 3. Performance Observers
    const observers: PerformanceObserver[] = [];

    // FCP Observer
    try {
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const fcpVal = Math.round(entries[0].startTime);
          setTimeout(() => setMetrics((prev) => ({ ...prev, fcp: fcpVal })), 0);
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      observers.push(fcpObserver);
    } catch (e) {
      console.warn('Paint timing observer not supported:', e);
    }

    // LCP Observer
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          const lcpVal = Math.round(lastEntry.startTime);
          setTimeout(() => setMetrics((prev) => ({ ...prev, lcp: lcpVal })), 0);
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported:', e);
    }

    // CLS Observer
    let clsValue = 0;
    try {
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const shiftEntry = entry as any;
          if (!shiftEntry.hadRecentInput) {
            clsValue += shiftEntry.value;
            setTimeout(() => setMetrics((prev) => ({ ...prev, cls: parseFloat(clsValue.toFixed(4)) })), 0);
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported:', e);
    }

    // FID Observer
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const firstInput = entries[0] as any;
          const fidVal = Math.round(firstInput.processingStart - firstInput.startTime);
          setMetrics((prev) => ({ ...prev, fid: fidVal }));
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      observers.push(fidObserver);
    } catch (e) {
      console.warn('FID observer not supported:', e);
    }

    // 4. Memory Usage Check (Periodic)
    const checkMemory = () => {
      const perf: any = window.performance;
      if (perf && perf.memory) {
        setMetrics((prev) => ({
          ...prev,
          memoryUsed: Math.round(perf.memory.usedJSHeapSize / (1024 * 1024)),
          memoryLimit: Math.round(perf.memory.jsHeapSizeLimit / (1024 * 1024)),
        }));
      }
    };
    checkMemory();
    const memInterval = setInterval(checkMemory, 5000);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      observers.forEach((obs) => obs.disconnect());
      clearInterval(memInterval);
    };
  }, []);

  // 5. Update/Calculate historical baseline
  useEffect(() => {
    // Only compile stats when some core metrics are available
    if (metrics.fcp === null && metrics.ttfb === null) return;

    try {
      const savedHist = localStorage.getItem(STORAGE_KEY);
      let historyList: Partial<TelemetryMetrics>[] = [];
      if (savedHist) {
        historyList = JSON.parse(savedHist);
      }

      // Add current session's snapshot
      const snapshot = {
        ttfb: metrics.ttfb,
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        cls: metrics.cls,
        fid: metrics.fid,
      };

      // Limit history length to last 15 samples to keep it relevant
      historyList.push(snapshot);
      if (historyList.length > 15) {
        historyList.shift();
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historyList));

      // Calculate averages
      const validTtfb = historyList.filter((h) => h.ttfb !== null && h.ttfb !== undefined) as { ttfb: number }[];
      const validFcp = historyList.filter((h) => h.fcp !== null && h.fcp !== undefined) as { fcp: number }[];
      const validLcp = historyList.filter((h) => h.lcp !== null && h.lcp !== undefined) as { lcp: number }[];
      const validCls = historyList.filter((h) => h.cls !== null && h.cls !== undefined) as { cls: number }[];
      const validFid = historyList.filter((h) => h.fid !== null && h.fid !== undefined) as { fid: number }[];

      setTimeout(() => {
        setBaseline({
          ttfbAvg: validTtfb.length > 0 ? Math.round(validTtfb.reduce((s, x) => s + x.ttfb, 0) / validTtfb.length) : 0,
          fcpAvg: validFcp.length > 0 ? Math.round(validFcp.reduce((s, x) => s + x.fcp, 0) / validFcp.length) : 0,
          lcpAvg: validLcp.length > 0 ? Math.round(validLcp.reduce((s, x) => s + x.lcp, 0) / validLcp.length) : 0,
          clsAvg: validCls.length > 0 ? parseFloat((validCls.reduce((s, x) => s + x.cls, 0) / validCls.length).toFixed(4)) : 0,
          fidAvg: validFid.length > 0 ? Math.round(validFid.reduce((s, x) => s + x.fid, 0) / validFid.length) : 0,
          samples: historyList.length,
        });
      }, 0);
    } catch (e) {
      console.warn('Failed to calculate historical baseline:', e);
    }
  }, [metrics.ttfb, metrics.fcp, metrics.lcp, metrics.cls, metrics.fid]);

  return { metrics, baseline };
}
