## Pioneer prolink-tools

[![Build Status](https://github.com/evanpurkhiser/prolink-tools/workflows/build/badge.svg)](https://github.com/EvanPurkhiser/prolink-tools/actions?query=workflow%3Abuild)

Prolink Tools is a collection of software that can be used to interact with the
Pioner Pro DJ Link functionality that many of Pioneer's DJ equipment is
compatable with.

[Development builds](https://github.com/EvanPurkhiser/prolink-tools/releases/tag/dev-build) are available.

#### `prolink-server`

The server component is the foundation for other tools to build on top of.
This component must be run before any other tools are able to communicate with
the Prolink network. The server provides a HTTP and Websocket interface to the
devices on the network, allowing for easy access to real-time data from these
devices.

This component is a command line tool that should be run as a daemon.

[**Read the documentation**](/server)

#### `prolink-overlay`

![Screen Shot 2020-05-08 at 00 17 08](https://user-images.githubusercontent.com/1421724/81381295-50636300-90c1-11ea-80b9-1a4ce72adca6.png)

The overlay component is a single-file HTML page that connects to the server to
display real-time now-playing and track history information, intended to be
used in live-streaming applications. It features smooth animations on track
change, displaying detailed information about the currently playing track. The
`prolink-server`'s [Mix Status functionality](/server#mix-status) is used to
determine when a new track is considered to be playing.

This can be easily used with the [OBS Browser Plugin](https://obsproject.com/forum/resources/browser-plugin.115/).

It's recommended that you have correctly tagged your music collection (or
tracks you expect to play) for an optimal viewer experience.

[**Mac OS setup tutorial video**](https://youtu.be/8vzgDZLa3Sc) (minorly outdated as [prolink.tools/overlay](http://prolink.tools/overlay) exists now)

### How It Works

Pioneer DJ gear equipped with the PRO DJ LINK feature are able to communicate
to each other over a network interface. By reverse engineering this protocol
we're able to talk with and understand the information that the CDJs report.
Using the `prolink-server` we can easily communicate and receive this
information and use it in various way.

### Project Status

This project is currently still in the **alpha phase** of testing. Testers are
welcome and it is encouraged to create issues on the GitHub project issue
tracker.

The project also has some limitations as documented on the
[prolink-go](https://github.com/EvanPurkhiser/prolink-go#limitations-bugs-and-missing-functionality)
project.
