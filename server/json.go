package server

import (
	"encoding/base64"
	"fmt"
	"net"
	"time"

	"go.evanpurkhiser.com/prolink"
	"go.evanpurkhiser.com/prolink/mixstatus"
)

type config struct {
	// Interfaces declares what network interface should be bound to for
	// broadcasting network packets.
	Interface string `json:"interface"`

	// PlayerID specifies what player ID should be used when broadcasting
	// ourselves as a CDJ on the network.
	PlayerID int `json:"player_id"`

	// MixStatus represents the configuration for the mix status handler.
	MixStatus configMixStatus `json:"mix_status"`
}

type configMixStatus struct {
	AllowedInterruptBeats *int `json:"allowed_interrupt_beats"`
	BeatsUntilReported    *int `json:"beats_until_reported"`
	TimeBetweenSets       *int `json:"time_between_sets"`
}

func mapConfig(n *prolink.Network, ms *mixstatus.Processor) config {
	tbs := int(ms.Config.TimeBetweenSets.Seconds())

	msConfig := configMixStatus{
		AllowedInterruptBeats: &ms.Config.AllowedInterruptBeats,
		BeatsUntilReported:    &ms.Config.BeatsUntilReported,
		TimeBetweenSets:       &tbs,
	}

	iface := ""
	if n.TargetInterface != nil {
		iface = n.TargetInterface.Name
	}

	return config{
		Interface: iface,
		PlayerID:  int(n.VirtualCDJID),
		MixStatus: msConfig,
	}
}

// configAnnotated provides additional details about configuration that may be
// useful for clients requesting configuration details.
type configAnnotated struct {
	config

	// The current list of interfaces
	AvailableInterfaces []string `json:"available_interfaces"`

	// UnusedPlayerIDs is a list of player IDs that are not currently used on
	// the network.
	UnusedPlayerIDs []int `json:"unused_player_ids"`
}

type device struct {
	ID         int       `json:"player_id"`
	Name       string    `json:"name"`
	Type       string    `json:"type"`
	MacAddr    string    `json:"mac"`
	IP         net.IP    `json:"ip"`
	LastActive time.Time `json:"last_active"`
}

func mapDevice(d *prolink.Device) device {
	return device{
		ID:         int(d.ID),
		Name:       d.Name,
		Type:       d.Type.String(),
		MacAddr:    d.MacAddr.String(),
		IP:         d.IP,
		LastActive: d.LastActive,
	}
}

type track struct {
	ID        int       `json:"id"`
	Path      string    `json:"path"`
	Title     string    `json:"title"`
	Artist    string    `json:"artist"`
	Album     string    `json:"album"`
	Label     string    `json:"label"`
	Genre     string    `json:"genre"`
	Comment   string    `json:"comment"`
	Key       string    `json:"key"`
	Length    int       `json:"length"`
	DateAdded time.Time `json:"date_added"`
	Artwork   string    `json:"artwork"`
}

func mapTrack(pt *prolink.Track) *track {
	t := track{
		ID:        int(pt.ID),
		Path:      pt.Path,
		Title:     pt.Title,
		Artist:    pt.Artist,
		Album:     pt.Album,
		Label:     pt.Label,
		Comment:   pt.Comment,
		Key:       pt.Key,
		Length:    int(pt.Length.Seconds()),
		DateAdded: pt.DateAdded,
	}

	if len(pt.Artwork) > 0 {
		artworkBase64 := base64.StdEncoding.EncodeToString(pt.Artwork)
		t.Artwork = fmt.Sprintf("data:%s;base64,%s", "image/jpeg", artworkBase64)
	}

	return &t
}

type trackID struct {
	ID     int    `json:"id"`
	Device int    `json:"device"`
	Slot   string `json:"slot"`
	Type   string `json:"type"`
}

func mapTrackID(s *prolink.CDJStatus) *trackID {
	tid := trackID{
		ID:     int(s.TrackID),
		Device: int(s.PlayerID),
		Slot:   s.TrackSlot.String(),
		Type:   s.TrackType.String(),
	}

	return &tid
}

type playerStatus struct {
	TrackID        trackID `json:"track_id"`
	PlayState      string  `json:"play_state"`
	BPM            float32 `json:"bpm"`
	Pitch          float32 `json:"pitch"`
	EffectivePitch float32 `json:"effective_pitch"`
	OnAir          bool    `json:"on_air"`
	Synced         bool    `json:"synced"`
	IsMaster       bool    `json:"is_master"`
	Beat           int     `json:"beat"`
	BeatInMeasure  int     `json:"beat_in_measure"`
	BeatsUntilCue  int     `json:"beats_until_cue"`
}

func mapStatus(s2 *prolink.CDJStatus) *playerStatus {
	s := playerStatus{
		PlayState:      s2.PlayState.String(),
		OnAir:          s2.IsOnAir,
		Synced:         s2.IsSync,
		BPM:            s2.TrackBPM,
		Pitch:          s2.SliderPitch,
		EffectivePitch: s2.EffectivePitch,
	}

	return &s
}

type beat struct {
	AbsoluteBeat  int `json:"absolute_beat"`
	BeatInMeasure int `json:"beat_in_measure"`
	BeatsUntilCue int `json:"beats_until_cue"`
}

func mapBeat(s *prolink.CDJStatus) *beat {
	b := beat{
		AbsoluteBeat:  int(s.Beat),
		BeatInMeasure: int(s.BeatInMeasure),
		BeatsUntilCue: int(s.BeatsUntilCue),
	}

	return &b
}

type event struct {
	// Type represents the event type being emitted
	Type string `json:"event"`

	// When an event is emmited from a particular device on the network (and
	// not a event inferred from the state of multiple device) the player ID
	// will be set. Otherwise the player ID will be `null`.
	PlayerID *int `json:"player_id"`

	// The precise event timestamp, formatted as a RFC3339Nano
	Timestamp string `json:"ts"`

	// The data object describing the event. This will usually be the place of
	// interest. Each event contains a different data object.
	Data interface{} `json:"data"`
}

func mapEvent(t string, playerID *prolink.DeviceID, data interface{}) event {
	var playerNumber *int = nil

	if playerID != nil {
		n := int(*playerID)
		playerNumber = &n
	}

	e := event{
		Type:      t,
		PlayerID:  playerNumber,
		Timestamp: time.Now().Format(time.RFC3339Nano),
		Data:      data,
	}

	return e
}

type subscriptions struct {
	Subscriptions []string `json:"subscriptions"`
}

type message struct{}
