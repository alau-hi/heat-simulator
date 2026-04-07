import { useState, useEffect, useCallback } from 'react';

const N_NODES = 20;

export function useHeatSimulation(initialParams) {
  const [params, setParams] = useState(initialParams);
  const [history, setHistory] = useState([]);

  const getCompressedThickness = useCallback((time, paramObj) => {
    let baseL = paramObj.thicknessInches;
    if (!paramObj.compression || !paramObj.compression.active) return baseL;
    
    let { start, stop, ratio } = paramObj.compression;
    if (time <= start) return baseL;
    if (time >= stop) return baseL / ratio;

    let progress = (time - start) / (stop - start);
    return baseL - (baseL - baseL / ratio) * progress;
  }, []);

  useEffect(() => {
    // Perform lightning-fast, fully synchronous pre-calculation of the physical block.
    // By mathematically evaluating the complete history array instantly upon param changes, 
    // we permanently eliminate UI streaming desync and strictly enforce linearly scalable scrubber mapping.
    const baseAlpha = params.alpha; // roughly 0.18e-6
    let initialBoundsT = (params.platenRamp && params.platenRamp.active) ? params.platenRamp.startTemp : params.platenTemp;
    let currentT = Array(N_NODES).fill(params.initWoodTemp);
    currentT[0] = initialBoundsT; 
    currentT[N_NODES - 1] = initialBoundsT;
    
    let time = 0;
    const computedHistory = [{ time: 0, temps: [...currentT], thickness: params.thicknessInches }];
    
    let targetCoreTemp = params.targetCoreTemp;
    let isFinished = false;
    let iterations = 0;
    const MAX_ITER = 3000000;
    
    let nextSampleTime = 0.5; // only store array snapshot every 0.5s to completely save memory bounds
    
    while (!isFinished && iterations < MAX_ITER) {
      iterations++;
      
      let L = getCompressedThickness(time, params);
      let dx = (L * 0.0254) / (N_NODES - 1); // convert explicit inches directly into meters
      
      let currentRatio = params.thicknessInches / L;
      let alphaMultiplier = 1;
      if (currentRatio > 1) {
        // 2x thermal diff for every 3x density increase
        alphaMultiplier = Math.pow(2, (currentRatio - 1) / 3);
      }
      let effectiveAlpha = baseAlpha * alphaMultiplier;
      
      let dt = 0.4 * (dx * dx) / effectiveAlpha;
      if (dt > 1.0) dt = 1.0; 
      
      let currentBoundsT = params.platenTemp;
      if (params.platenRamp && params.platenRamp.active) {
        let r_start = params.platenRamp.startTemp;
        let r_end = params.platenRamp.endTemp;
        let r_time = params.platenRamp.duration;
        if (time >= r_time) {
          currentBoundsT = r_end;
        } else {
          currentBoundsT = r_start + ((r_end - r_start) * (time / r_time));
        }
      }

      let nextT = [...currentT];
      for (let i = 1; i < N_NODES - 1; i++) {
        let temp = currentT[i];
        nextT[i] = temp + effectiveAlpha * dt * (currentT[i+1] - 2 * temp + currentT[i-1]) / (dx * dx);
      }
      nextT[0] = currentBoundsT;
      nextT[N_NODES - 1] = currentBoundsT;
      
      time += dt;
      currentT = nextT;
      
      if (currentT[Math.floor(N_NODES / 2)] >= targetCoreTemp) {
        isFinished = true;
        computedHistory.push({ time, temps: [...currentT], thickness: L }); 
        break;
      }
      
      if (time >= nextSampleTime) {
        computedHistory.push({ time, temps: [...currentT], thickness: L });
        nextSampleTime += 0.5;
      }
    }
    
    setHistory(computedHistory);
  }, [params, getCompressedThickness]);

  return {
    params,
    setParams,
    history
  };
}
