var map = L.map('map').setView([25, -10], 1.35);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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
                L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup(organization + " / " + name);
            }
        });
    });