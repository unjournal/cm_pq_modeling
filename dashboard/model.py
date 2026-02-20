"""
Cultured Meat First-Principles Cost Model

A Monte Carlo simulation model for estimating 2036 cultured meat production costs.
Based on techno-economic analysis (TEA) principles with explicit uncertainty.

Source: Adapted from UC Davis ACBM calculator and Unjournal PQ evaluations.
"""
from __future__ import annotations
import math
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, Any

# Standard normal quantiles for p5/p95
Z_5 = -1.6448536269514722
Z_95 = 1.6448536269514722


def sample_lognormal_p5_p95(rng, p5, p95, n):
    """Sample from lognormal distribution specified by p5/p95 percentiles."""
    p5 = np.asarray(p5)
    p95 = np.asarray(p95)
    mu = (np.log(p5) + np.log(p95)) / 2.0
    sigma = (np.log(p95) - np.log(p5)) / (2.0 * abs(Z_95))
    return np.exp(mu + sigma * rng.standard_normal(n))


def sample_uniform(rng, lo, hi, n):
    """Sample from uniform distribution."""
    return rng.uniform(lo, hi, size=n)


def beta_from_mean_stdev(mean, stdev):
    """Convert mean/stdev to beta distribution parameters."""
    var = stdev**2
    max_var = mean * (1 - mean)
    if var <= 0 or var >= max_var:
        # Clamp to valid range
        stdev = min(stdev, math.sqrt(max_var * 0.99))
        var = stdev**2
    t = max_var / var - 1.0
    a = mean * t
    b = (1 - mean) * t
    return max(a, 0.01), max(b, 0.01)


def sample_beta_mean_stdev(rng, mean, stdev, n):
    """Sample from beta distribution specified by mean/stdev."""
    a, b = beta_from_mean_stdev(mean, stdev)
    return rng.beta(a, b, size=n)


def crf(wacc, n_years):
    """Capital Recovery Factor: converts CAPEX to annualized cost."""
    return wacc * (1 + wacc) ** n_years / ((1 + wacc) ** n_years - 1)


@dataclass
class Params:
    """
    Model parameters organized by category.
    All distributions specified as p5/p95 (for lognormal) or mean/sd (for beta).
    """

    # === BASIC PARAMETERS (shown in main UI) ===

    # Scale + operations
    plant_kta_p5: float = 5      # Plant capacity p5 (kTA/year)
    plant_kta_p95: float = 50    # Plant capacity p95 (kTA/year)
    uptime_mean: float = 0.90   # Utilization rate mean
    uptime_sd: float = 0.05     # Utilization rate std dev

    # Industry maturity (latent factor for correlation)
    maturity_mean: float = 0.50
    maturity_sd: float = 0.20

    # Technology adoption probabilities (base, before maturity adjustment)
    p_hydro_mean: float = 0.60      # Prob hydrolysates widely used by 2036
    p_hydro_sd: float = 0.10
    p_foodgrade_mean: float = 0.65  # Prob food-grade commodity micros
    p_foodgrade_sd: float = 0.10
    p_recfactors_mean: float = 0.50  # Prob cheap recombinant factors
    p_recfactors_sd: float = 0.15

    # Financing
    wacc_p5: float = 0.08       # WACC p5 (8%)
    wacc_p95: float = 0.20      # WACC p95 (20%)
    asset_life_lo: float = 8    # Asset lifetime lower bound (years)
    asset_life_hi: float = 20   # Asset lifetime upper bound (years)

    # === ADVANCED PARAMETERS (hidden in expandable section) ===

    # Process intensities
    density_gL_p5: float = 30       # Final biomass density (g/L) p5
    density_gL_p95: float = 200     # Final biomass density (g/L) p95
    cycle_days_p5: float = 0.5      # Production cycle length (days) p5
    cycle_days_p95: float = 5.0     # Production cycle length (days) p95
    media_turnover_p5: float = 1.0  # Media turnover ratio p5 (1=batch)
    media_turnover_p95: float = 10.0  # Media turnover ratio p95 (>1=perfusion)

    # Media costs (conditional on hydrolysates)
    media_cost_hydro_p5: float = 0.2    # $/L with hydrolysates p5
    media_cost_hydro_p95: float = 1.2   # $/L with hydrolysates p95
    media_cost_nohydro_p5: float = 1.0  # $/L without hydrolysates p5
    media_cost_nohydro_p95: float = 4.0  # $/L without hydrolysates p95

    # Commodity micronutrients (conditional on food-grade)
    comm_micros_gkg_fg_p5: float = 0.1     # g/kg food-grade p5
    comm_micros_gkg_fg_p95: float = 2.0    # g/kg food-grade p95
    comm_micros_gkg_nofg_p5: float = 1.0   # g/kg pharma-grade p5
    comm_micros_gkg_nofg_p95: float = 10.0  # g/kg pharma-grade p95
    comm_micros_price_fg_p5: float = 0.02   # $/g food-grade p5
    comm_micros_price_fg_p95: float = 2.0   # $/g food-grade p95
    comm_micros_price_nofg_p5: float = 0.5  # $/g pharma-grade p5
    comm_micros_price_nofg_p95: float = 20.0  # $/g pharma-grade p95

    # Recombinant factors (growth factors, albumin-like proteins)
    recfac_gkg_cheap_p5: float = 1e-4    # g/kg cheap tech p5
    recfac_gkg_cheap_p95: float = 1e-2   # g/kg cheap tech p95
    recfac_gkg_exp_p5: float = 1e-3      # g/kg expensive tech p5
    recfac_gkg_exp_p95: float = 2e-1     # g/kg expensive tech p95
    recfac_price_cheap_p5: float = 0.05   # $/g cheap tech p5
    recfac_price_cheap_p95: float = 20.0  # $/g cheap tech p95
    recfac_price_exp_p5: float = 5.0      # $/g expensive tech p5
    recfac_price_exp_p95: float = 500.0   # $/g expensive tech p95

    # Other variable costs (utilities, disposables, etc.)
    other_var_p5: float = 0.5   # $/kg p5
    other_var_p95: float = 5.0  # $/kg p95

    # Reactor/CAPEX
    reactor_cost_per_L_pharma_p5: float = 50    # $/L pharma bioreactor p5
    reactor_cost_per_L_pharma_p95: float = 500  # $/L pharma bioreactor p95
    custom_reactor_cost_ratio_p5: float = 0.35  # Custom/pharma cost ratio p5
    custom_reactor_cost_ratio_p95: float = 0.85  # Custom/pharma cost ratio p95
    custom_reactor_share_mean: float = 0.55     # Share using custom reactors
    custom_reactor_share_sd: float = 0.15

    capex_scale_exp_p5: float = 0.6   # CAPEX scaling exponent p5 (K ~ V^s)
    capex_scale_exp_p95: float = 0.9  # CAPEX scaling exponent p95
    plant_factor_p5: float = 1.5      # Lang factor (total plant / reactors) p5
    plant_factor_p95: float = 3.5     # Lang factor p95

    # Fixed OPEX (annual, at 20kTA reference)
    fixed_opex_perkg_ref_lo: float = 1.0  # $/kg at 20kTA p5
    fixed_opex_perkg_ref_hi: float = 6.0  # $/kg at 20kTA p95
    fixed_opex_scale_exp_lo: float = 0.6  # Fixed OPEX scaling exponent p5
    fixed_opex_scale_exp_hi: float = 1.0  # Fixed OPEX scaling exponent p95


def simulate(n: int = 50_000, seed: int = 42, P: Params = None) -> Dict[str, Any]:
    """
    Run Monte Carlo simulation of cultured meat production costs.

    Args:
        n: Number of Monte Carlo samples
        seed: Random seed for reproducibility
        P: Parameters dataclass (uses defaults if None)

    Returns:
        Dictionary with summary statistics and full distributions
    """
    if P is None:
        P = Params()

    rng = np.random.default_rng(seed)

    # === Latent maturity factor (correlates adoption, costs, financing) ===
    maturity = sample_beta_mean_stdev(rng, P.maturity_mean, P.maturity_sd, n)

    # === Scale and operations ===
    plant_kta = sample_lognormal_p5_p95(rng, P.plant_kta_p5, P.plant_kta_p95, n)
    uptime = sample_beta_mean_stdev(rng, P.uptime_mean, P.uptime_sd, n)
    output_kgpy = plant_kta * 1e6 * uptime  # kg/year produced

    # === Technology adoption (maturity-adjusted) ===
    p_hydro = np.clip(
        sample_beta_mean_stdev(rng, P.p_hydro_mean, P.p_hydro_sd, n)
        + 0.25 * (maturity - 0.5),
        0, 1
    )
    p_foodgrade = np.clip(
        sample_beta_mean_stdev(rng, P.p_foodgrade_mean, P.p_foodgrade_sd, n)
        + 0.20 * (maturity - 0.5),
        0, 1
    )
    p_recf = np.clip(
        sample_beta_mean_stdev(rng, P.p_recfactors_mean, P.p_recfactors_sd, n)
        + 0.25 * (maturity - 0.5),
        0, 1
    )

    is_hydro = rng.random(n) < p_hydro
    is_foodgrade = rng.random(n) < p_foodgrade
    is_recf_cheap = rng.random(n) < p_recf

    # === Process intensities ===
    density_gL = sample_lognormal_p5_p95(rng, P.density_gL_p5, P.density_gL_p95, n)
    cycle_days = sample_lognormal_p5_p95(rng, P.cycle_days_p5, P.cycle_days_p95, n)
    media_turnover = sample_lognormal_p5_p95(rng, P.media_turnover_p5, P.media_turnover_p95, n)

    # L/kg = liters of culture volume per kg harvested, times media turnover
    L_per_kg = (1000.0 / density_gL) * media_turnover

    # === Variable Operating Costs ===

    # Media cost ($/kg) - conditional on hydrolysates
    media_cost_L = np.where(
        is_hydro,
        sample_lognormal_p5_p95(rng, P.media_cost_hydro_p5, P.media_cost_hydro_p95, n),
        sample_lognormal_p5_p95(rng, P.media_cost_nohydro_p5, P.media_cost_nohydro_p95, n),
    )
    cost_media = L_per_kg * media_cost_L

    # Commodity micronutrients ($/kg) - conditional on food-grade
    g_comm = np.where(
        is_foodgrade,
        sample_lognormal_p5_p95(rng, P.comm_micros_gkg_fg_p5, P.comm_micros_gkg_fg_p95, n),
        sample_lognormal_p5_p95(rng, P.comm_micros_gkg_nofg_p5, P.comm_micros_gkg_nofg_p95, n),
    )
    price_comm = np.where(
        is_foodgrade,
        sample_lognormal_p5_p95(rng, P.comm_micros_price_fg_p5, P.comm_micros_price_fg_p95, n),
        sample_lognormal_p5_p95(rng, P.comm_micros_price_nofg_p5, P.comm_micros_price_nofg_p95, n),
    )
    cost_comm_micros = g_comm * price_comm

    # Recombinant factors ($/kg) - conditional on cheap tech
    g_recf = np.where(
        is_recf_cheap,
        sample_lognormal_p5_p95(rng, P.recfac_gkg_cheap_p5, P.recfac_gkg_cheap_p95, n),
        sample_lognormal_p5_p95(rng, P.recfac_gkg_exp_p5, P.recfac_gkg_exp_p95, n),
    )
    price_recf = np.where(
        is_recf_cheap,
        sample_lognormal_p5_p95(rng, P.recfac_price_cheap_p5, P.recfac_price_cheap_p95, n),
        sample_lognormal_p5_p95(rng, P.recfac_price_exp_p5, P.recfac_price_exp_p95, n),
    )
    cost_recf = g_recf * price_recf

    # Other variable costs
    other_var = sample_lognormal_p5_p95(rng, P.other_var_p5, P.other_var_p95, n)

    # Total variable operating costs
    voc = cost_media + cost_comm_micros + cost_recf + other_var

    # === CAPEX ===

    # Reactor volume requirement from productivity
    prod_kg_L_day = (density_gL / 1000.0) / cycle_days
    total_working_volume_L = output_kgpy / (prod_kg_L_day * 365.0)

    # Reactor cost per liter (blend of pharma and custom)
    reactor_cost_L_pharma = sample_lognormal_p5_p95(
        rng, P.reactor_cost_per_L_pharma_p5, P.reactor_cost_per_L_pharma_p95, n
    )
    custom_ratio = sample_uniform(
        rng, P.custom_reactor_cost_ratio_p5, P.custom_reactor_cost_ratio_p95, n
    )
    custom_share = np.clip(
        sample_beta_mean_stdev(rng, P.custom_reactor_share_mean, P.custom_reactor_share_sd, n)
        + 0.30 * (maturity - 0.5),
        0, 1
    )
    reactor_cost_L_avg = reactor_cost_L_pharma * (
        custom_share * custom_ratio + (1 - custom_share)
    )

    # CAPEX with scaling and plant factor (Lang factor)
    capex_s = sample_uniform(rng, P.capex_scale_exp_p5, P.capex_scale_exp_p95, n)
    plant_factor = sample_lognormal_p5_p95(rng, P.plant_factor_p5, P.plant_factor_p95, n)

    V_ref = 1e6  # Reference volume for numeric stability
    capex_total = (
        (reactor_cost_L_avg * total_working_volume_L)
        * ((total_working_volume_L / V_ref) ** (capex_s - 1))
        * plant_factor
    )

    # === Financing ===
    wacc = sample_lognormal_p5_p95(rng, P.wacc_p5, P.wacc_p95, n) - 0.03 * (maturity - 0.5)
    wacc = np.clip(wacc, 0.03, None)
    asset_life = sample_uniform(rng, P.asset_life_lo, P.asset_life_hi, n)
    crf_val = crf(wacc, asset_life)

    capex_perkg = (capex_total * crf_val) / output_kgpy

    # === Fixed OPEX ===
    ref_output = 20e6 * 0.9  # 20 kTA at 90% utilization
    fixed_perkg_ref = sample_uniform(rng, P.fixed_opex_perkg_ref_lo, P.fixed_opex_perkg_ref_hi, n)
    fixed_annual_ref = fixed_perkg_ref * ref_output
    fixed_scale = sample_uniform(rng, P.fixed_opex_scale_exp_lo, P.fixed_opex_scale_exp_hi, n)
    fixed_annual = fixed_annual_ref * ((output_kgpy / ref_output) ** fixed_scale)
    fixed_perkg = fixed_annual / output_kgpy

    # === Total Unit Cost ===
    unit_cost = voc + capex_perkg + fixed_perkg

    # === Summary Statistics ===
    def q(x, p):
        return float(np.quantile(x, p))

    results = {
        # Main outputs
        "unit_cost": unit_cost,
        "p5": q(unit_cost, 0.05),
        "p25": q(unit_cost, 0.25),
        "p50": q(unit_cost, 0.50),
        "p75": q(unit_cost, 0.75),
        "p95": q(unit_cost, 0.95),
        "mean": float(np.mean(unit_cost)),
        "std": float(np.std(unit_cost)),

        # Probability thresholds
        "prob_lt_10": float(np.mean(unit_cost < 10)),
        "prob_lt_25": float(np.mean(unit_cost < 25)),
        "prob_lt_50": float(np.mean(unit_cost < 50)),

        # Cost components (for breakdown chart)
        "cost_media": cost_media,
        "cost_comm_micros": cost_comm_micros,
        "cost_recf": cost_recf,
        "cost_other_var": other_var,
        "cost_capex": capex_perkg,
        "cost_fixed": fixed_perkg,

        # Component means for waterfall
        "mean_media": float(np.mean(cost_media)),
        "mean_comm_micros": float(np.mean(cost_comm_micros)),
        "mean_recf": float(np.mean(cost_recf)),
        "mean_other_var": float(np.mean(other_var)),
        "mean_capex": float(np.mean(capex_perkg)),
        "mean_fixed": float(np.mean(fixed_perkg)),

        # Scenario adoption rates (realized)
        "pct_hydro": float(np.mean(is_hydro)),
        "pct_foodgrade": float(np.mean(is_foodgrade)),
        "pct_recf_cheap": float(np.mean(is_recf_cheap)),
    }

    return results


if __name__ == "__main__":
    # Quick test
    res = simulate(n=100_000)
    print(f"Unit Cost ($/kg):")
    print(f"  p5:  ${res['p5']:.2f}")
    print(f"  p50: ${res['p50']:.2f}")
    print(f"  p95: ${res['p95']:.2f}")
    print(f"  P(<$10/kg): {res['prob_lt_10']:.1%}")
    print(f"  P(<$25/kg): {res['prob_lt_25']:.1%}")
