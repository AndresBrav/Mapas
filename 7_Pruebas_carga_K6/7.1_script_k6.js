import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const geocodeDuration = new Trend("geocode_duration");
const routeDuration = new Trend("route_duration");
const distanceDuration = new Trend("distance_duration");

export const options = {
    stages: [
        { duration: "10s", target: 5 },
        { duration: "20s", target: 10 },
        { duration: "10s", target: 0 },
    ],
    thresholds: {
        errors: ["rate<0.01"],
        geocode_duration: ["p(95)<500"],
        route_duration: ["p(95)<500"],
        distance_duration: ["p(95)<500"],
    },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3050/v1";

const headers = {
    "Content-Type": "application/json",
    "x-clientid": "geo-app-dev",
    "x-client-secret": "sk-dev-geo456ghi",
};

const addresses = [
    "Av. América 123, Cochabamba, Bolivia",
    "Calle Bolívar 456, La Paz, Bolivia",
    "Av. Heroínas 789, Cochabamba, Bolivia",
    "Plaza 14 de Septiembre, Cochabamba, Bolivia",
    "Av. Pando 321, Cochabamba, Bolivia",
    "Calle España 111, Santa Cruz, Bolivia",
    "Av. San Martín 555, Cochabamba, Bolivia",
    "Calle Lanza 222, La Paz, Bolivia",
];

const coordinates = [
    {
        origin: { latitude: -17.39345, longitude: -66.15678 },
        destination: { latitude: -17.3802, longitude: -66.1501 },
    },
    {
        origin: { latitude: -17.4, longitude: -66.16 },
        destination: { latitude: -17.37, longitude: -66.14 },
    },
    {
        origin: { latitude: -17.42, longitude: -66.17 },
        destination: { latitude: -17.35, longitude: -66.13 },
    },
    {
        origin: { latitude: -17.38, longitude: -66.145 },
        destination: { latitude: -17.395, longitude: -66.155 },
    },
    {
        origin: { latitude: -17.41, longitude: -66.165 },
        destination: { latitude: -17.36, longitude: -66.135 },
    },
];

function testGeocode() {
    const address = addresses[Math.floor(Math.random() * addresses.length)];
    const res = http.post(
        `${BASE_URL}/geo/geocode`,
        JSON.stringify({ address }),
        { headers },
    );
    const success = check(res, {
        "geocode status 200": (r) => r.status === 200,
        "geocode has coordinates": (r) => r.json("data.latitude") !== undefined,
    });
    errorRate.add(!success);
    geocodeDuration.add(res.timings.duration);
}

function testRoute() {
    const pair = coordinates[Math.floor(Math.random() * coordinates.length)];
    const res = http.post(`${BASE_URL}/geo/route`, JSON.stringify(pair), {
        headers,
    });
    const success = check(res, {
        "route status 200": (r) => r.status === 200,
        "route has path": (r) =>
            r.json("data.path") !== undefined && r.json("data.path").length > 0,
    });
    errorRate.add(!success);
    routeDuration.add(res.timings.duration);
}

function testDistance() {
    const pair = coordinates[Math.floor(Math.random() * coordinates.length)];
    const res = http.post(`${BASE_URL}/geo/distance`, JSON.stringify(pair), {
        headers,
    });
    const success = check(res, {
        "distance status 200": (r) => r.status === 200,
        "distance has value": (r) =>
            r.json("data.distance.value") !== undefined,
        "distance has duration": (r) =>
            r.json("data.duration.value") !== undefined,
    });
    errorRate.add(!success);
    distanceDuration.add(res.timings.duration);
}

export default function () {
    const rand = Math.random();
    if (rand < 0.4) {
        testGeocode();
    } else if (rand < 0.7) {
        testRoute();
    } else {
        testDistance();
    }
    sleep(1);
}

export function handleSummary(data) {
    const rows = [];

    for (const [name, metric] of Object.entries(data.metrics)) {
        if (metric.type === "counter") {
            rows.push(`<tr><td>${name}</td><td>Counter</td><td>${metric.count}</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`);
        }
        if (metric.type === "rate") {
            rows.push(`<tr><td>${name}</td><td>Rate</td><td>-</td><td>-</td><td>-</td><td>-</td><td>${(metric.rate * 100).toFixed(2)}%</td></tr>`);
        }
        if (metric.type === "trend" && metric.values) {
            const p = metric.values;
            rows.push(`<tr><td>${name}</td><td>Trend</td><td>${p.min.toFixed(2)}</td><td>${p.avg.toFixed(2)}</td><td>${p.med.toFixed(2)}</td><td>${p["p(95)"].toFixed(2)}</td><td>-</td></tr>`);
        }
    }

    const thresholds = [];
    for (const [name, check] of Object.entries(data.metrics)) {
        if (check.thresholds && Array.isArray(check.thresholds)) {
            for (const th of check.thresholds) {
                thresholds.push(`<tr><td>${name}</td><td>${th.source}</td><td>${th.ok ? "✅ Pass" : "❌ Fail"}</td></tr>`);
            }
        }
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>K6 Load Test Report</title>
<style>
body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f5f5f5; margin: 20px; color: #333; }
h1 { color: #1a237e; }
h2 { color: #283593; margin-top: 30px; }
table { border-collapse: collapse; width: 100%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #ddd; }
th { background: #1a237e; color: #fff; }
tr:hover { background: #f0f0f0; }
.summary-box { background: #e8eaf6; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
.summary-box span { font-weight: bold; }
.status-pass { color: green; font-weight: bold; }
.status-fail { color: red; font-weight: bold; }
</style>
</head>
<body>
<h1>📊 K6 Load Test Report</h1>
<div class="summary-box">
    <span>Test Date:</span> ${new Date().toISOString()} |
    <span>Duration:</span> ${data.state.testRunDurationMs} ms |
    <span>Total Requests:</span> ${data.metrics.http_reqs?.count ?? "N/A"}
</div>

<h2>Metrics</h2>
<table>
<thead><tr><th>Metric</th><th>Type</th><th>Min</th><th>Avg</th><th>Med</th><th>P(95)</th><th>Rate</th></tr></thead>
<tbody>${rows.join("\n")}</tbody>
</table>

<h2>Thresholds</h2>
<table>
<thead><tr><th>Metric</th><th>Threshold</th><th>Status</th></tr></thead>
<tbody>${thresholds.length ? thresholds.join("\n") : '<tr><td colspan="3">No thresholds defined</td></tr>'}</tbody>
</table>

<h2>Checks</h2>
<table>
<thead><tr><th>Check</th><th>Passes</th><th>Fails</th><th>Success Rate</th></tr></thead>
<tbody>
${
    Object.entries(data.metrics)
        .filter(([, m]) => m.type === "rate")
        .map(([name, m]) => `<tr><td>${name}</td><td>${m.passes}</td><td>${m.fails}</td><td>${(m.rate * 100).toFixed(2)}%</td></tr>`)
        .join("\n")
}
</tbody>
</table>

<p style="margin-top: 30px; color: #888; font-size: 12px;">Generated by K6</p>
</body>
</html>`;

    return {
        "/reports/7.1_reporte_k6.html": html,
    };
}
