## Pioneer PRO DJ LINK Live Overlay

**NOTE**: This repository is undergoing on-and-off refactoring and improvments,
See the `old` branch for a more "stable" version.

Generate a real time "now playing" track and player information overlays for DJ
live streams using PRO DJ LINK Pioneer equipment. Engage your audience and
avoid nagging "what track was that!" questions!

### How It Works

Pioneer DJ gear equipped with the PRO DJ LINK feature ([see compatible
equipment](#compatible-equipment)) are able to communicate to each other over a
network interface. By reverse engineering this protocol we're able to talk with
and understand the information that the CDJs report. We can then use this to
generate a customized real time overlay displaying various details about what's
happening while a DJ mixes.

This software serves a simple webpage that renders the overlay in real time
using ReactJS and websockets which can be overlayed on a video stream using the
[OBS Browser
plugin](https://obsproject.com/forum/resources/browser-plugin.115/) (or the [QT
Webkit plugin](https://github.com/bazukas/obs-qtwebkit) for Linux).

### Features

- Displays live CDJ player status (BPM, pitch, play state, on-air status, sync status).
- Displays metadata of the track currently loaded into the CDJ.
- Delays displaying of track metadata until the track is considered to be
  "playing" using a combination beat counting and the on-air status reported
  by the mixer.
- Displays indicator when a new track has been selected.

### Project Status

This project is currently a **work in progress**. I have not yet added
documentation for how to use this software as there are currently no public
builds available due to the stability of the software.

Currently various expected functionality is broken due to bugs in the [prolink
library](https://github.com/EvanPurkhiser/prolink-go) used to communicate with
the equipment. The readme outlines specifics on that project as to what has not
yet been implemented.

#### Possible Upcoming Features

- Configuration interface for various settings
  - Change how many bars until a track is considered playing.
  - How many beats can a track be interrupted before the next tracks is
    considered to be playing.
  - Position and style of track details.
- Display waveform for each track, including visual progress indicator for the
  playing tracks.
- Recognize "mix sessions" by some heuristic allowing track list details to be
  stored for that mix session
  - Save track lists in various formats, including timestamps.
    - Text for soundcloud and youtube
    - `cue` file for association to a recorded audio file
    - JSON for rendering on a track custom list website
  - Indicate on the live stream how many tracks have been mixed and how long
    the stream has been happening for.
- Live music collection web interface to allow the audience to make live track
  requests that can then be display in the overlay as being a requested track.

### Compatible Equipment

Currently the following Pioneer equipment is confirmed to work:

- [CDJ-2000 Nexus](https://www.pioneerdj.com/en-us/product/player/cdj-2000nxs/black/overview/)
- [DJM-900 Nexus](https://www.pioneerdj.com/en-us/product/mixer/djm-900nxs/black/overview/)

The following gear also supports the PRO DJ LINK feature and can likely be made
to work with this software. However it has not yet been tested. Feel free to
reach out if you would like to help to get your equipment working (or if it
just works!).

- [CDJ-900](https://www.pioneerdj.com/en-us/product/player/archive/cdj-900/black/overview/)
- [CDJ-900 Nexus](https://www.pioneerdj.com/en-us/product/player/cdj-900nxs/black/overview/)
- [XDJ-700](https://www.pioneerdj.com/en-us/product/player/xdj-700/black/overview/)
- [XDJ-1000](https://www.pioneerdj.com/en-us/product/player/xdj-1000/black/overview/)
- [XDJ-1000 Mk2](https://www.pioneerdj.com/en-us/product/player/xdj-1000mk2/black/overview/)
- [XDJ-RX](https://www.pioneerdj.com/en-us/product/all-in-one-system/xdj-rx/black/overview/)
- [CDJ 2000 Nexus 2](https://www.pioneerdj.com/en-us/product/player/cdj-2000nxs2/black/overview/)
- [DJM-900 Nexus 2](https://www.pioneerdj.com/en-us/product/mixer/djm-900nxs2/black/overview/)
- [DJM-2000 Nexus](https://www.pioneerdj.com/en-us/product/mixer/djm-2000nxs/black/overview/)
