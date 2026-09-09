"""
OrCom Agricultural Health Indexer
Calculates Normalized Difference Vegetation Index (NIR - Red) / (NIR + Red)
"""
import numpy as np

def compute_canopy_metrics(red_band, nir_band):
    print("[OrCom Edge] Processing red/NIR reflectance bands...")
    denominator = nir_band + red_band + 1e-6
    ndvi = (nir_band - red_band) / denominator
    deficit_area_pct = float(np.mean(ndvi < 0.25) * 100.0)
    
    return {
        "metric": "NDVI_CANOPY_INDEX",
        "mean_ndvi": float(np.mean(ndvi)),
        "drought_stress_area_pct": deficit_area_pct,
        "classification": "Moderate Drought Stress" if deficit_area_pct > 15 else "Healthy"
    }
