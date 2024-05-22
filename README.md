# MapGPT
Language to Maps:

![Design](https://github.com/QueueLab/MapGPT/assets/115367894/d8cb6eca-83f8-4efc-ac5c-417271f777e1)

## Contributing

Welcome! Please see the issues for items that need attention, and below for some tools to aid in development and debugging.

Visit our roadmap for more information.
[Roadmap] (https://draw.roadmap.sh/664d9e21d6b907c7f745be36)

### Running the app on your own machine
1. Install the Python dependencies, and run the tile server proxy.
    ```
    $ cd server
    $ python -m venv env
    $ . env/bin/activate
    $ pip install -r requirements.txt
    $ python tile_server_proxy.py
    ```
2. Run a web server, such as live-server, in the working directory. Make sure you specify a port that doesn't conflict with the tile server proxy.
    ```
    $ npm install live-server
    $ live-server --port=8081 .
    ```

## Third-party libraries used
1. [Turf.js](https://turfjs.org/) (for GeoJSON processingand geospatial calculations)
2. [Leaflet](https://leafletjs.com/) (provides OpenStreetMap widget)≥
3. [unmute](https://github.com/swevans/unmute) (improved web audio behavior on iOS)
≥
