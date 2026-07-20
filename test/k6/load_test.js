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
