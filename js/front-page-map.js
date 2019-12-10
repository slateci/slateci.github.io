var map = L.map('map').setView([40, -50], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var slateIcon = L.icon({
    iconUrl: '/css/images/marker-icon.png',
    iconSize: [15, 25],
    iconAnchor: [7, 24]
})

axios.get("https://slate-geoip.s3.amazonaws.com/map_data")
    .then(function (response) {
        response.data.clusters.forEach(function (cluster) {
            var organization = cluster.organization;
            var name = cluster.name;
            var lat = cluster.location.latitude;
            var lon = cluster.location.longitude;
            if (organization != null
                && lat != null
                && lon != null) {
                L.marker([lat, lon], {icon: slateIcon})
                    .addTo(map)
                    .bindPopup(organization + " / " + name);
            }
        });
    });