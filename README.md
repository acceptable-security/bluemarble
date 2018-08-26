# BlueMarble

## Ideas

- Using simulated climates to modify the way the hydraulic simulation happens
- Use 3D noise to generate cloud patterns n(x, y, t) = d, where x & y are positions, t is the current time, and the outputted noise is used to calculate "cloud density" which is compared against a threshold to see if rain occurs in that part

## Questions

- Massive maps? 4096x4096 already gonna be a pain. Perhaps use a a "high level" terrain map which represents a lower of detail but a higher level of simulation, then each pixel can represent a block of data which can have less intricate simulations using the data from that high level terrain map.