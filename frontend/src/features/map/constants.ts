// Island path and zone positions are expressed in these units.
// The actual rendered size is derived from viewport × MAP_ZOOM_BUDGET
//see useMapDimensions
export const MAP_W = 3200;
export const MAP_H = 2000;
export const MAP_ASPECT = MAP_W / MAP_H;

// How much extra map exists beyond the viewport at minimum zoom
export const MAP_ZOOM_BUDGET = 2.8;

// Canonical hit radius, scales proportionally with map size.
// At minimum zoom the indicator always appears as ZONE_HIT_RADIUS / MAP_ZOOM_BUDGET px on screen.
export const ZONE_HIT_RADIUS = 160;

export enum ZoneId {
  Airport = "airport",
  Hotel = "hotel",
  Beach = "beach",
  Parrot = "parrot",
  Broadcast = "broadcast",
}
