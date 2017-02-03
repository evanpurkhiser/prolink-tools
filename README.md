## Pioneer PRO DJ LINK Live Overlay

Generate a real time "now playing" track and player information overlays for DJ
live streams using PRO DJ LINK Pioneer equipment. Engage your audience and
avoid nagging "what track was that!" questions!

![](http://img.pixady.com/2017/02/570457_20170202230944.png)

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

 * Displays live CDJ player status (BPM, pitch, play state, on-air status, sync status).
 * Displays metadata of the track currently loaded into the CDJ.
 * Delays displaying of track metadata until the track is considered to be
   "playing" using a combination beat counting and the on-air status reported
   by the mixer.
 * Displays indicator when a new track has been selected.

### Project Status

This project is currently a work in progress. I would like to add a lot of
functionality to support various other features DJs may find useful.

### Compatible Equipment

Currently the following Pioneer equipment is confirmed to work:

 * [CDJ-2000 Nexus](https://www.pioneerdj.com/en-us/product/player/cdj-2000nxs/black/overview/)
 * [DJM-900 Nexus](https://www.pioneerdj.com/en-us/product/mixer/djm-900nxs/black/overview/)

The following gear also supports the PRO DJ LINK feature and can likely be made
to work with this software. However it has not yet been tested. Feel free to
reach out if you would like to help to get your equipment working (or if it
just works!).

 * [CDJ-900](https://www.pioneerdj.com/en-us/product/player/archive/cdj-900/black/overview/)
 * [CDJ-900 Nexus](https://www.pioneerdj.com/en-us/product/player/cdj-900nxs/black/overview/)
 * [XDJ-700](https://www.pioneerdj.com/en-us/product/player/xdj-700/black/overview/)
 * [XDJ-1000](https://www.pioneerdj.com/en-us/product/player/xdj-1000/black/overview/)
 * [XDJ-1000 Mk2](https://www.pioneerdj.com/en-us/product/player/xdj-1000mk2/black/overview/)
 * [XDJ-RX](https://www.pioneerdj.com/en-us/product/all-in-one-system/xdj-rx/black/overview/)
 * [CDJ 2000 Nexus 2](https://www.pioneerdj.com/en-us/product/player/cdj-2000nxs2/black/overview/)
 * [DJM-900 Nexus 2](https://www.pioneerdj.com/en-us/product/mixer/djm-900nxs2/black/overview/)
 * [DJM-2000 Nexus](https://www.pioneerdj.com/en-us/product/mixer/djm-2000nxs/black/overview/)
