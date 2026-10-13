"""
RouteNexa AI - Data Comparison & Visualizer Verification Test Suite
===================================================================
Tests all 12 charts, filter endpoints, aggregations, and CSV exports.
"""

import os
import sys
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_visualizer_metadata():
    res = client.get("/api/v1/visualizer/metadata")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "factories" in data and len(data["factories"]) == 5, "Should have 5 factories"
    assert "regions" in data and len(data["regions"]) == 4, "Should have 4 regions"
    assert "ship_modes" in data and len(data["ship_modes"]) == 4, "Should have 4 ship modes"
    assert "min_date" in data and "max_date" in data
    print("[PASS] test_visualizer_metadata passed.")

def test_visualizer_data_all():
    res = client.get("/api/v1/visualizer/data")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    
    # 1. Total matched & KPIs
    assert data["total_matched"] == 10194, f"Expected 10194, got {data['total_matched']}"
    kpis = data["kpis"]
    assert kpis["total_shipments"] == 10194
    assert 0.0 < kpis["avg_lead_time"] < 10.0, "Average lead time should be operational, not uncorrected offset"
    
    # 2. Chart 1: Route Performance
    rp = data["route_performance"]
    assert "top_10_fastest" in rp and len(rp["top_10_fastest"]) <= 10
    assert "bottom_10_slowest" in rp and len(rp["bottom_10_slowest"]) <= 10
    assert "top_10_volume" in rp and len(rp["top_10_volume"]) <= 10
    assert "top_10_delay" in rp and len(rp["top_10_delay"]) <= 10
    
    # 3. Chart 2: Ship Mode Comparison
    sm = data["ship_mode_comparison"]
    assert len(sm) == 4
    total_sm_vol = sum(m["volume"] for m in sm)
    assert total_sm_vol == 10194, f"Ship mode volumes ({total_sm_vol}) must reconcile with 10194 total"
    
    # 4. Chart 3: Shipment Trends
    st = data["shipment_trends"]
    assert len(st) > 0
    total_st_vol = sum(t["volume"] for t in st)
    assert total_st_vol == 10194, "Monthly volume must reconcile with total"
    
    # 5. Chart 4: Factory Performance
    fp = data["factory_performance"]
    assert len(fp) == 5, "Must have all 5 factories"
    total_fp_vol = sum(f["volume"] for f in fp)
    assert total_fp_vol == 10194, "Factory volume must sum to total matched"
    
    # 6. Chart 5: Regional Comparison
    rc = data["regional_comparison"]
    assert len(rc) == 4, "Must have 4 regions (Pacific, Atlantic, Interior, Gulf)"
    total_rc_vol = sum(r["volume"] for r in rc)
    assert total_rc_vol == 10194, "Regional volume must sum to total matched"
    
    # 7. Chart 6: Lead-Time Distribution Histogram
    ltd = data["lead_time_distribution"]
    assert len(ltd) == 5, "Must have 5 buckets"
    total_hist_count = sum(b["count"] for b in ltd)
    assert total_hist_count == 10194, "Histogram buckets must reconcile to 10194"
    
    # 8. Chart 7: Route Volume vs Efficiency
    rve = data["route_volume_efficiency"]
    assert len(rve) > 0
    
    # 9. Chart 8: Prediction vs Actual (evaluated orders)
    pva = data["prediction_vs_actual"]
    assert "summary" in pva and "evaluated_orders" in pva
    assert pva["summary"]["evaluated_count"] == len(pva["evaluated_orders"])
    for o in pva["evaluated_orders"]:
        assert o["actual_lt"] is not None, "Only orders with actual outcomes must be included"
        
    # 10. Chart 9: ML Model Comparison
    ml = data["ml_models_comparison"]
    assert "delay_classification" in ml and len(ml["delay_classification"]) == 4
    assert "eta_regression" in ml and len(ml["eta_regression"]) == 5
    
    # 11. Chart 10: Anomaly Trends
    at = data["anomaly_trends"]
    assert len(at) > 0
    total_anomalies_trend = sum(a["anomalies"] for a in at)
    assert total_anomalies_trend == kpis["total_anomalies"], "Anomaly count must reconcile"
    
    # 12. Chart 11: Historical vs Forecast
    hvf = data["historical_vs_forecast"]
    assert len(hvf) == 44, f"Expected 30 days history + 14 days forecast = 44, got {len(hvf)}"
    
    # 13. Chart 12: Sales, Gross Profit & Product Cost
    spt = data["sales_profit_trends"]
    assert "data" in spt and "disclaimer" in spt
    assert "wholesale" in spt["disclaimer"].lower() or "manufacturing" in spt["disclaimer"].lower()
    
    print("[PASS] test_visualizer_data_all passed with 100% mathematical reconciliation.")

def test_visualizer_filters():
    # Filter by Factory: Secret Factory
    res = client.get("/api/v1/visualizer/data?factory=Secret Factory")
    assert res.status_code == 200
    d = res.json()
    assert d["total_matched"] < 10194
    for f in d["factory_performance"]:
        if f["factory_name"] != "Secret Factory":
            assert f["volume"] == 0
        else:
            assert f["volume"] == d["total_matched"]
            
    # Filter by Ship Mode: Same Day
    res = client.get("/api/v1/visualizer/data?ship_mode=Same Day")
    assert res.status_code == 200
    d = res.json()
    assert d["total_matched"] == 547
    
    # Filter by Lead Time Cap: max 3 days
    res = client.get("/api/v1/visualizer/data?max_lead_time=3.0")
    assert res.status_code == 200
    d = res.json()
    assert d["kpis"]["avg_lead_time"] <= 3.0
    
    print("[PASS] test_visualizer_filters passed.")

def test_visualizer_export_csv():
    res = client.get("/api/v1/visualizer/export-csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers.get("content-type", "")
    lines = res.text.strip().splitlines()
    assert len(lines) > 100
    assert "Order ID,Order Date,Ship Mode,Factory,Destination State" in lines[0]
    print("[PASS] test_visualizer_export_csv passed.")

if __name__ == "__main__":
    test_visualizer_metadata()
    test_visualizer_data_all()
    test_visualizer_filters()
    test_visualizer_export_csv()
    print("\nALL VISUALIZER ASSERTIONS PASSED SUCCESSFULLY! (4/4)")
