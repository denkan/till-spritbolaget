import { LatLng } from "./models";

export const COLORS = {
    SUCCESS: '#06CE6A',
    ERROR: '#D84039',
    WARNING: '#F2C112',
    INFO: '#4781FE',
}

export function getDistance(p1: LatLng, p2: LatLng) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.latitude - p1.latitude);
    var dLong = rad(p2.longitude - p1.longitude);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.latitude)) * Math.cos(rad(p2.latitude)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter

    function rad(x) {
        return x * Math.PI / 180;
    };
};