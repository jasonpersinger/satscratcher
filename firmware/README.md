# SatScratcher Firmware Workspace

The actual firmware fork lives separately:

`https://github.com/jasonpersinger/NMMiner-SatScratcher`

This directory holds source assets and helper tools for that fork.

## v1 Firmware Scope

1. Rename the setup AP SSID to `SatScratcher`.
2. Replace the boot splash.
3. Replace idle/mining screens with SatScratcher mascot states.
4. Restyle the WiFi configuration portal.

## First Validation

Before branding work, prove the unmodified upstream firmware builds and flashes to the exact CYD board.

```bash
pio run
pio run -t upload --upload-port /dev/ttyUSB0
```

After flashing, verify:

- Splash appears.
- Setup AP is visible.
- Setup portal loads.
- Mining screen starts after configuration.
