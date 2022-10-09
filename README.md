# Path-Gen

Path generator for robotics applications.

## Installation

Not required! Just download the [latest release](https://github.com/SizzinSeal/Path-Gen/releases/tag/v1.0.0-beta.1) if you want to use it locally.

## Contributing

To contribute, please fork the repository and submit a pull request. If you have any questions, found a bug, or want to request a feature, please [open an issue](https://github.com/SizzinSeal/Path-Gen/issues/new/choose).

## License

This project is licensed under the GPLv3 license. See the [LICENSE](LICENSE) file for more details.

---

## Path Format for Robot

This is the format that the robot will use to interpret the path.
> lookahead
> <br />
  trackWidth
  <br />
  deactivateDist
  <br />
  lF
  <br />
  lA
  <br />
  lJ
  <br />
  lP
  <br />
  lI
  <br />
  lD
  <br />
  lB
  <br />
  lG
  <br />
  rF
  <br />
  rA
  <br />
  rJ
  <br />
  rP
  <br />
  rI
  <br />
  rD
  <br />
  rB
  <br />
  rG
  <br />
  x0, y0, vel0
  <br />
  x1, y1, vel1
  <br />
  x2, y2, vel2
  <br />
  ...

## Debug Format

This is the format that Path-Gen will use to visualize the debug data.
> x0, y0, vel0
  <br />
  x1, y1, vel1
  <br />
  x2, y2, vel2
  <br />
  ...
  <br />
  debug
  <br />
  timestamp0, rbtX0, rbtY0, rbtH0, closestX0, closestY0, lookaheadX0, lookaheadY0, curvature0, targetVel0, leftTargetVel0, rightTargetVel0, leftVel0, rightVel0
  <br />
  timestamp1, rbtX1, rbtY1, rbtH1, closestX1, closestY1, lookaheadX1, lookaheadY1, curvature1, targetVel1, leftTargetVel1, rightTargetVel1, leftVel1, rightVel1
  <br />
  timestamp2, rbtX2, rbtY2, rbtH2, closestX2, closestY2, lookaheadX2, lookaheadY2, curvature2, targetVel2, leftTargetVel2, rightTargetVel2, leftVel2, rightVel2
  <br />
  ...
