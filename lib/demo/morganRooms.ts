export const MORGAN_ROOMS = [
  {
    name: "Living Room",
    deviceIds: [
      "demo-samsung-frame",
      "demo-appletv",
      "demo-sonos",
      "demo-switch",
      "demo-ps5",
      "demo-xbox",
    ],
  },
  {
    name: "Office",
    deviceIds: [
      "demo-macbook",
      "demo-studio-display",
      "demo-canon-printer",
      "demo-unifi-router",
      "demo-synology",
      "demo-iphone",
    ],
  },
  {
    name: "Kitchen",
    deviceIds: ["demo-samsung-fridge", "demo-echo-show"],
  },
  {
    name: "Laundry Room",
    deviceIds: ["demo-lg-washer", "demo-lg-dryer"],
  },
  {
    name: "Bedroom",
    deviceIds: [
      "demo-robot-vacuum",
      "demo-air-purifier",
      "demo-lg-oled",
    ],
  },
  {
    name: "Entryway",
    deviceIds: ["demo-ring", "demo-smart-lock"],
  },
  {
    name: "Hallway",
    deviceIds: ["demo-nest", "demo-unifi-ap"],
  },
  {
    name: "Garage",
    deviceIds: ["demo-cameras"],
  },
] as const;
